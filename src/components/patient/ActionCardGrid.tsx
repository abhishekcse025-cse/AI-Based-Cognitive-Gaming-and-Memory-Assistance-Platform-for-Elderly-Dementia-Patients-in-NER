import { motion } from 'framer-motion';
import type { PatientActionCardData, PatientActionType } from '../../types/types';
import { ActionCard } from './ActionCard';

// ─── Action Card Data ─────────────────────────────────────────────────────────

const ACTION_CARDS: PatientActionCardData[] = [
  {
    id: 'play',
    label: 'Play',
    icon: 'Gamepad2',
    route: '/play',
    colorToken: 'card-play',
  },
  {
    id: 'my_day',
    label: 'My Day',
    icon: 'CalendarDays',
    route: '/my-day',
    colorToken: 'card-myday',
  },
  {
    id: 'reminders',
    label: 'Reminders',
    icon: 'Bell',
    route: '/reminders',
    colorToken: 'card-reminders',
  },
  {
    id: 'family',
    label: 'Family',
    icon: 'Users',
    route: '/family',
    colorToken: 'card-family',
  },
  {
    id: 'talk_to_mira',
    label: 'Talk to MIRA',
    icon: 'MessageCircleHeart',
    route: '/mira',
    colorToken: 'card-mira',
  },
];

interface ActionCardGridProps {
  onCardSelect: (action: PatientActionType) => void;
}

/**
 * 2-column grid of 5 large action cards.
 * Last card (Talk to MIRA) spans full width for visual emphasis.
 * Cards animate in with staggered entrance.
 */
export function ActionCardGrid({ onCardSelect }: ActionCardGridProps) {
  const regularCards = ACTION_CARDS.slice(0, 4);
  const miraCard = ACTION_CARDS[4];

  return (
    <section
      aria-label="Available actions"
      className="px-5 pb-6 space-y-4"
    >
      {/* 2-column grid for first 4 cards */}
      <div className="grid grid-cols-2 gap-4">
        {regularCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.1 + index * 0.08,
              duration: 0.45,
              ease: 'easeOut' as const,
            }}
          >
            <ActionCard data={card} onSelect={onCardSelect} />
          </motion.div>
        ))}
      </div>

      {/* Full-width MIRA card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: 0.1 + 4 * 0.08,
          duration: 0.45,
          ease: 'easeOut' as const,
        }}
      >
        <ActionCard data={miraCard} onSelect={onCardSelect} />
      </motion.div>
    </section>
  );
}
