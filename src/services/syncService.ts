/**
 * COGNIVA Sync Service — Phase 3
 *
 * The ONLY module permitted to read/write localStorage['cogniva_sessions'].
 * Manages the offline-first data bridge between the app and the Flask backend.
 *
 * Auto-triggers on:
 *  - window 'online' event (network reconnect)
 *  - manual call from game completion screens
 */

import { getSessions, markSynced, getUnsyncedCount } from '../utils/storage';

// ── API URL ───────────────────────────────────────────────────────────────────
// In production (Vercel) → VITE_API_URL env var points to Render.com backend
// In local dev           → falls back to same hostname on port 5000
const API_URL = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')   // strip trailing slash
  : `http://${window.location.hostname}:5000/api`;

// ── Sync state ────────────────────────────────────────────────────────────────

export type SyncState = 'idle' | 'syncing' | 'synced' | 'offline';

let currentState: SyncState = 'idle';
let currentUnsyncedCount: number = getUnsyncedCount();
const stateListeners = new Set<(state: SyncState, count: number) => void>();

function setState(state: SyncState): void {
  currentState = state;
  currentUnsyncedCount = getUnsyncedCount();
  stateListeners.forEach(cb => cb(currentState, currentUnsyncedCount));
}

/**
 * Subscribe to sync state changes.
 * The callback fires immediately with the current state, then on every change.
 * Returns an unsubscribe function.
 */
export function subscribeSyncState(
  cb: (state: SyncState, unsyncedCount: number) => void
): () => void {
  stateListeners.add(cb);
  cb(currentState, currentUnsyncedCount); // Immediate snapshot
  return () => stateListeners.delete(cb);
}

// ── Core sync loop ────────────────────────────────────────────────────────────

let isSyncing = false;

export async function syncPendingSessions(): Promise<void> {
  if (isSyncing) return;

  const unsynced = getSessions().filter(s => s.synced === 0);
  if (unsynced.length === 0) {
    setState('synced');
    return;
  }

  if (!navigator.onLine) {
    setState('offline');
    return;
  }

  isSyncing = true;
  setState('syncing');

  try {
    // Strip the client-only 'synced' flag before sending to server
    const payload = unsynced.map(({ synced: _s, ...rest }) => rest);

    const response = await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as { acknowledged_ids: string[] };

    // Mark ONLY the server-confirmed IDs as synced (never trust unconfirmed)
    data.acknowledged_ids.forEach(id => markSynced(Number(id)));

    setState(getUnsyncedCount() === 0 ? 'synced' : 'offline');
  } catch {
    setState('offline');
  } finally {
    isSyncing = false;
  }
}

// ── Fetch analytics data ──────────────────────────────────────────────────────

export interface GameStats {
  labels: string[];
  raw_time: number[];
  raw_errors: number[];
  moving_avg_time: number[];
  moving_avg_errors: number[];
}

export interface AnalyticsData {
  attention_needed: boolean;
  MEMORY_MATCH: GameStats;
  DAILY_SEQUENCE: GameStats;
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await fetch(`${API_URL}/analytics`, {
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<AnalyticsData>;
}

// ── Local analytics (no backend needed) ──────────────────────────────────────

/**
 * Builds the same AnalyticsData shape entirely from localStorage sessions.
 * Used when the backend is unavailable — the dashboard always shows real data.
 */
export function buildLocalAnalytics(): AnalyticsData {
  const sessions = getSessions();

  function statsFor(gameId: 'MEMORY_MATCH' | 'DAILY_SEQUENCE'): GameStats {
    const gameSessions = sessions
      .filter(s => s.game === gameId)
      .slice(-10);                      // last 10, same window as backend

    if (gameSessions.length === 0) {
      return { labels: [], raw_time: [], raw_errors: [], moving_avg_time: [], moving_avg_errors: [] };
    }

    const labels        = gameSessions.map((_, i) => `#${i + 1}`);
    const raw_time      = gameSessions.map(s => s.time_taken_sec);
    const raw_errors    = gameSessions.map(s => s.error_count);

    // 3-session moving average
    const movingAvg = (arr: number[]) =>
      arr.map((_, i) => {
        const window = arr.slice(Math.max(0, i - 2), i + 1);
        return Math.round((window.reduce((a, b) => a + b, 0) / window.length) * 10) / 10;
      });

    return {
      labels,
      raw_time,
      raw_errors,
      moving_avg_time:   movingAvg(raw_time),
      moving_avg_errors: movingAvg(raw_errors),
    };
  }

  // Attention flag: last 3 sessions (any game) all have error_count > 4
  const recent3 = sessions.slice(-3);
  const attention_needed = recent3.length === 3 && recent3.every(s => s.error_count > 4);

  return {
    attention_needed,
    MEMORY_MATCH:   statsFor('MEMORY_MATCH'),
    DAILY_SEQUENCE: statsFor('DAILY_SEQUENCE'),
  };
}

// ── Auto-triggers ─────────────────────────────────────────────────────────────

window.addEventListener('online',  () => syncPendingSessions());
window.addEventListener('offline', () => setState('offline'));

// Kick off sync on page load if there are pending sessions
(function initialSync() {
  if (!navigator.onLine) {
    setState('offline');
  } else if (getUnsyncedCount() > 0) {
    syncPendingSessions();
  } else {
    setState('synced');
  }
})();
