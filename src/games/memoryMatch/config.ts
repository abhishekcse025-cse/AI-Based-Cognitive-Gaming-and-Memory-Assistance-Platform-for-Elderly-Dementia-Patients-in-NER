import { DifficultyLevel } from '../../types/api';
import { MemoryCardItem, MemoryDifficultyConfig } from './types';

export const MEMORY_CONFIGS: Record<DifficultyLevel, MemoryDifficultyConfig> = {
  easy: {
    difficulty: 'easy',
    numCards: 4,
    numPairs: 2,
    columns: 2,
    description: '2 Pairs • Bright & Distinct Colors',
    pairs: [
      {
        pairId: 'apple',
        title: 'Red Apple',
        iconName: 'nutrition', // distinct apple/fruit
        color: '#DC2626', // Bright Red
        textColor: '#FFFFFF',
        shapeDescription: 'Bright Red Apple',
      },
      {
        pairId: 'sun',
        title: 'Yellow Sun',
        iconName: 'sunny',
        color: '#EAB308', // Bright Yellow
        textColor: '#1A1A1A',
        shapeDescription: 'Bright Yellow Sun',
      },
    ],
  },
  medium: {
    difficulty: 'medium',
    numCards: 6,
    numPairs: 3,
    columns: 3,
    description: '3 Pairs • Familiar Nature Items',
    pairs: [
      {
        pairId: 'water',
        title: 'Blue Water',
        iconName: 'water',
        color: '#2563EB', // Blue
        textColor: '#FFFFFF',
        shapeDescription: 'Blue Water Drop',
      },
      {
        pairId: 'leaf',
        title: 'Green Leaf',
        iconName: 'leaf',
        color: '#16A34A', // Green
        textColor: '#FFFFFF',
        shapeDescription: 'Green Leaf',
      },
      {
        pairId: 'carrot',
        title: 'Orange Flower',
        iconName: 'flower',
        color: '#EA580C', // Orange
        textColor: '#FFFFFF',
        shapeDescription: 'Orange Blossom',
      },
    ],
  },
  hard: {
    difficulty: 'hard',
    numCards: 8,
    numPairs: 4,
    columns: 4,
    description: '4 Pairs • Similar Teal & Cyan Palette (Harder Shape Recall)',
    pairs: [
      {
        pairId: 'shape_circle',
        title: 'Teal Circle',
        iconName: 'ellipse',
        color: '#0F766E', // Deep Teal
        textColor: '#FFFFFF',
        shapeDescription: 'Teal Round Circle',
      },
      {
        pairId: 'shape_square',
        title: 'Teal Square',
        iconName: 'square',
        color: '#115E59', // Darker Teal
        textColor: '#FFFFFF',
        shapeDescription: 'Teal Square Box',
      },
      {
        pairId: 'shape_star',
        title: 'Cyan Star',
        iconName: 'star',
        color: '#0284C7', // Cyan Blue
        textColor: '#FFFFFF',
        shapeDescription: 'Cyan Five-Point Star',
      },
      {
        pairId: 'shape_diamond',
        title: 'Cyan Diamond',
        iconName: 'diamond',
        color: '#0891B2', // Aqua Cyan
        textColor: '#FFFFFF',
        shapeDescription: 'Aqua Diamond',
      },
    ],
  },
};

/**
 * Generates and shuffles cards for the selected difficulty
 */
export function generateMemoryDeck(difficulty: DifficultyLevel): MemoryCardItem[] {
  const cfg = MEMORY_CONFIGS[difficulty];
  const deck: MemoryCardItem[] = [];

  cfg.pairs.forEach((pair) => {
    // Card A
    deck.push({
      id: `${pair.pairId}-card-1`,
      pairId: pair.pairId,
      title: pair.title,
      iconName: pair.iconName,
      color: pair.color,
      textColor: pair.textColor,
      shapeDescription: pair.shapeDescription,
    });
    // Card B
    deck.push({
      id: `${pair.pairId}-card-2`,
      pairId: pair.pairId,
      title: pair.title,
      iconName: pair.iconName,
      color: pair.color,
      textColor: pair.textColor,
      shapeDescription: pair.shapeDescription,
    });
  });

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
