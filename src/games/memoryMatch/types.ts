import { DifficultyLevel } from '../../types/api';

export interface MemoryCardItem {
  id: string; // unique card id in deck
  pairId: string; // identifier shared by the two matching cards
  title: string;
  iconName: string; // Ionicons icon name
  color: string;
  textColor: string;
  shapeDescription: string;
}

export interface MemoryDifficultyConfig {
  difficulty: DifficultyLevel;
  numCards: number;
  numPairs: number;
  columns: number;
  description: string;
  pairs: Array<{
    pairId: string;
    title: string;
    iconName: string;
    color: string;
    textColor: string;
    shapeDescription: string;
  }>;
}
