// ─── COGNIVA Adaptive Engine — Clinical Staircase Algorithm ──────────────────
//
// Smooth, non-alarming difficulty progression for elderly patients.
// Levels map to Memory Match pair counts.

const LEVEL_KEY = 'cogniva_game_level';
const MIN_LEVEL = 1;
const MAX_LEVEL = 4;

/** Memory Match pairs per difficulty level */
export const PAIRS_PER_LEVEL: Record<number, number> = {
  1: 3,  // Easiest
  2: 4,  // Default
  3: 5,
  4: 6,  // Most challenging
};

/** Grid columns per pair count (safe Tailwind class strings) */
export const GRID_CLASS_FOR_PAIRS: Record<number, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-4', // 6 pairs = 12 cards → 4×3 grid
};

/** Emoji render size inside cards, scaled for readability */
export const EMOJI_CLASS_FOR_PAIRS: Record<number, string> = {
  3: 'text-5xl',
  4: 'text-4xl',
  5: 'text-3xl',
  6: 'text-3xl',
};

// ─── Level persistence ────────────────────────────────────────────────────────

export function getCurrentLevel(): number {
  try {
    const raw = localStorage.getItem(LEVEL_KEY);
    if (raw) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= MIN_LEVEL && n <= MAX_LEVEL) return n;
    }
  } catch { /* localStorage unavailable */ }
  return 2; // Default: Level 2 (4 pairs)
}

export function saveLevel(level: number): void {
  try {
    localStorage.setItem(LEVEL_KEY, String(Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level))));
  } catch { /* Silently ignore */ }
}

export function getPairsForLevel(level: number): number {
  return PAIRS_PER_LEVEL[Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level))] ?? 4;
}

// ─── Per-game evaluation ──────────────────────────────────────────────────────

export interface EvaluationResult {
  nextLevel: number;
  message: string;           // MIRA-voiced encouraging message
  levelChanged: 'up' | 'down' | 'same';
}

/**
 * Staircase evaluation — runs after every completed Memory Match game.
 *
 * Step Up:   accuracy ≥ 75% AND time < 45s  → level + 1
 *            MIRA says: "Wonderful work! Ready for a small challenge?"
 *
 * Step Down: errors > 5 OR time > 75s       → level − 1 (SILENT — never announced)
 *            MIRA says: "Great effort! Let's play another round."
 *
 * @param pairs  Number of pairs in the completed game (= totalTasks for accuracy calc)
 */
export function evaluateAndSave({
  errors,
  timeSec,
  level,
  pairs,
}: {
  errors: number;
  timeSec: number;
  level: number;
  pairs: number;
}): EvaluationResult {
  // accuracy = correct matches / total attempts
  const totalAttempts = pairs + errors;
  const accuracy = totalAttempts > 0 ? (pairs / totalAttempts) * 100 : 100;

  // ── Step Up ─────────────────────────────────────────────────────────────────
  if (accuracy >= 75 && timeSec < 45 && level < MAX_LEVEL) {
    saveLevel(level + 1);
    return {
      nextLevel: level + 1,
      message: 'Wonderful work! Ready for a small challenge?',
      levelChanged: 'up',
    };
  }

  // ── Step Down (silently — message stays warm, never hints at downgrade) ─────
  if ((errors > 5 || timeSec > 75) && level > MIN_LEVEL) {
    saveLevel(level - 1);
    return {
      nextLevel: level - 1,
      message: "Great effort! Let's play another round.",
      levelChanged: 'down',
    };
  }

  // ── No change ────────────────────────────────────────────────────────────────
  const message =
    errors === 0
      ? 'Flawless! You have an excellent memory.'
      : errors <= 2
      ? 'Wonderful! You did beautifully today.'
      : 'Well done! Every game makes your memory stronger.';

  return { nextLevel: level, message, levelChanged: 'same' };
}
