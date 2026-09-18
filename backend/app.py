"""
COGNIVA Backend — Phase 3 & 4
Flask REST API  •  SQLite (WAL mode)

Local dev:  python app.py            → http://localhost:5000
Production: gunicorn app:app          → Render.com auto-assigns $PORT
"""

from __future__ import annotations

import os
import sqlite3
from collections import defaultdict
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

# ── App setup ─────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

DB_PATH = os.path.join(os.path.dirname(__file__), "cogniva.db")


# ── Database helpers ──────────────────────────────────────────────────────────

def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_db() as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS game_sessions (
                id           TEXT    PRIMARY KEY,
                game_type    TEXT    NOT NULL,
                time_taken_sec INTEGER NOT NULL DEFAULT 0,
                error_count  INTEGER NOT NULL DEFAULT 0,
                level        INTEGER NOT NULL DEFAULT 2,
                synced_at    TEXT    NOT NULL
            )
        """)
        conn.commit()


init_db()


# ── POST /api/sync ─────────────────────────────────────────────────────────────
# Idempotent upserts — safe to retry on network failure.
# Returns exactly which IDs were acknowledged.

@app.route("/api/sync", methods=["POST"])
def sync():
    data = request.get_json(silent=True)
    if not data or not isinstance(data, list):
        return jsonify({"error": "Expected a JSON array of session objects"}), 400

    acknowledged_ids: list[str] = []
    now = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        for session in data:
            try:
                sid = str(session["id"])
                conn.execute(
                    """
                    INSERT INTO game_sessions
                        (id, game_type, time_taken_sec, error_count, level, synced_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET synced_at = excluded.synced_at
                    """,
                    (
                        sid,
                        session.get("game", "UNKNOWN"),
                        int(session.get("time_taken_sec", 0)),
                        int(session.get("error_count", 0)),
                        int(session.get("level", 2)),
                        now,
                    ),
                )
                acknowledged_ids.append(sid)
            except Exception:
                pass  # Skip malformed entries — never fail the whole batch

        conn.commit()

    return jsonify(
        {
            "status": "success",
            "synced_count": len(acknowledged_ids),
            "acknowledged_ids": acknowledged_ids,
        }
    )


# ── GET /api/analytics ────────────────────────────────────────────────────────
# Returns moving averages (window=3, last 10 sessions) and attention_needed flag.

def moving_avg(values: list[float], window: int = 3) -> list[float]:
    result = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        chunk = values[start : i + 1]
        result.append(round(sum(chunk) / len(chunk), 1))
    return result


def build_game_stats(sessions: list[dict]) -> dict:
    """Build chart-ready data for a single game type."""
    # sessions come in newest-first; reverse for chronological chart display
    ordered = list(reversed(sessions[:10]))
    times  = [s["time_taken_sec"] for s in ordered]
    errors = [s["error_count"]    for s in ordered]
    labels = [s["synced_at"][:10] for s in ordered]
    return {
        "labels":           labels,
        "raw_time":         times,
        "raw_errors":       errors,
        "moving_avg_time":  moving_avg(times),
        "moving_avg_errors": moving_avg(errors),
    }


EMPTY_GAME_STATS = {
    "labels": [], "raw_time": [], "raw_errors": [],
    "moving_avg_time": [], "moving_avg_errors": [],
}


@app.route("/api/analytics", methods=["GET"])
def analytics():
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, game_type, time_taken_sec, error_count, level, synced_at
            FROM   game_sessions
            ORDER  BY id DESC
            LIMIT  50
            """
        ).fetchall()

    if not rows:
        return jsonify(
            {
                "attention_needed": False,
                "MEMORY_MATCH":     EMPTY_GAME_STATS,
                "DAILY_SEQUENCE":   EMPTY_GAME_STATS,
            }
        )

    dicts = [dict(r) for r in rows]

    # ── Attention flag: most recent 3 sessions (any game) all have error_count > 4
    recent_3 = dicts[:3]
    attention_needed = len(recent_3) == 3 and all(
        r["error_count"] > 4 for r in recent_3
    )

    # ── Group by game type
    by_game: dict[str, list[dict]] = defaultdict(list)
    for row in dicts:
        by_game[row["game_type"]].append(row)

    return jsonify(
        {
            "attention_needed": attention_needed,
            "MEMORY_MATCH":   build_game_stats(by_game["MEMORY_MATCH"])
                              if "MEMORY_MATCH" in by_game else EMPTY_GAME_STATS,
            "DAILY_SEQUENCE": build_game_stats(by_game["DAILY_SEQUENCE"])
                              if "DAILY_SEQUENCE" in by_game else EMPTY_GAME_STATS,
        }
    )


# ── Health check ──────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "db": DB_PATH})


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") != "production"
    print(f"COGNIVA API running on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
