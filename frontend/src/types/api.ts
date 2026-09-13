export type GameType = 'memory_match' | 'sequence';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type PerformanceRating = 'good' | 'average' | 'poor';

export interface AdaptiveDifficultyRequest {
  patient_id: string;
  game_type: GameType;
  current_difficulty: DifficultyLevel;
  total_moves: number;
  errors_made: number;
  time_taken_seconds: number;
  completed: boolean;
}

export interface AdaptiveDifficultyResponse {
  performance: PerformanceRating;
  next_difficulty: DifficultyLevel;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  avatarColor: string;
  currentMemoryDifficulty: DifficultyLevel;
  currentSequenceDifficulty: DifficultyLevel;
}

export interface GameSessionRecord {
  id: string;
  timestamp: string; // ISO date string
  patient_id: string;
  patient_name: string;
  game_type: GameType;
  difficulty: DifficultyLevel;
  total_moves: number;
  errors_made: number;
  time_taken_seconds: number;
  completed: boolean;
  performance: PerformanceRating;
  next_difficulty: DifficultyLevel;
  synced_to_backend: boolean;
}

export interface QueuedAttempt {
  id: string;
  payload: AdaptiveDifficultyRequest;
  timestamp: string;
  retryCount: number;
  lastError?: string;
}
