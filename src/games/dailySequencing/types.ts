import { DifficultyLevel } from '../../types/api';

export interface SequenceStep {
  id: string;
  order: number; // 1-indexed target position in sequence
  title: string;
  description: string;
  iconName: string;
  badgeLabel: string;
}

export interface SequencePuzzleConfig {
  difficulty: DifficultyLevel;
  activityTitle: string;
  promptText: string;
  stepCount: number;
  steps: SequenceStep[];
}
