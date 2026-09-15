// ─── Game Session Payload ─────────────────────────────────────────────────────

export type GameId = 'MEMORY_MATCH' | 'DAILY_SEQUENCE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameSession {
  id: number;
  game: GameId;
  time_taken_sec: number;
  error_count: number;
  difficulty: Difficulty;
  level: number;         // Adaptive engine level at time of play
  synced: 0 | 1;
}

const STORAGE_KEY = 'cogniva_sessions';

// ─── Read ─────────────────────────────────────────────────────────────────────

export function getSessions(): GameSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameSession[]) : [];
  } catch {
    return [];
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function saveSession(
  session: Omit<GameSession, 'id' | 'synced'>
): GameSession {
  const newSession: GameSession = { id: Date.now(), synced: 0, ...session };
  const updated = [...getSessions(), newSession];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* Storage quota exceeded */ }
  return newSession;
}

// ─── Mark synced ──────────────────────────────────────────────────────────────

export function markSynced(id: number): void {
  const sessions = getSessions().map(s =>
    s.id === id ? { ...s, synced: 1 as const } : s
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch { /* Silently ignore */ }
}

// ─── Count unsynced ───────────────────────────────────────────────────────────

export function getUnsyncedCount(): number {
  return getSessions().filter(s => s.synced === 0).length;
}

// ─── Clear (for testing) ──────────────────────────────────────────────────────

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}
