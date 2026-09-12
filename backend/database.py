import sqlite3
import uuid
from datetime import datetime


# --------------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------------

DATABASE_NAME = "game_sessions.db"


# --------------------------------------------------
# CREATE DATABASE AND TABLE
# --------------------------------------------------

def initialize_database():

    connection = sqlite3.connect(DATABASE_NAME)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS game_sessions (

            session_id TEXT PRIMARY KEY,
            patient_id TEXT NOT NULL,
            game_type TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            total_moves INTEGER NOT NULL,
            error_count INTEGER NOT NULL,
            time_taken_sec REAL NOT NULL,
            completed BOOLEAN NOT NULL,
            timestamp DATETIME NOT NULL,
            sync_status BOOLEAN NOT NULL

        )
    """)

    connection.commit()
    connection.close()


# --------------------------------------------------
# SAVE GAME SESSION
# --------------------------------------------------

def save_game_session(session):

    session_id = str(uuid.uuid4())

    timestamp = datetime.now().isoformat()

    connection = sqlite3.connect(DATABASE_NAME)

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO game_sessions (
            session_id,
            patient_id,
            game_type,
            difficulty,
            total_moves,
            error_count,
            time_taken_sec,
            completed,
            timestamp,
            sync_status
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (

        session_id,
        session["patient_id"],
        session["game_type"],
        session["current_difficulty"],
        session["total_moves"],
        session["errors_made"],
        session["time_taken_seconds"],
        session["completed"],
        timestamp,

        # 0 means the session is still local
        # and has not been pushed to Firebase.
        0
    ))

    connection.commit()
    connection.close()

    return session_id


# --------------------------------------------------
# GET ALL GAME SESSIONS
# --------------------------------------------------

def get_all_sessions():

    connection = sqlite3.connect(DATABASE_NAME)

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            session_id,
            patient_id,
            game_type,
            difficulty,
            total_moves,
            error_count,
            time_taken_sec,
            completed,
            timestamp,
            sync_status
        FROM game_sessions
        ORDER BY timestamp DESC
    """)

    rows = cursor.fetchall()

    connection.close()

    return rows
