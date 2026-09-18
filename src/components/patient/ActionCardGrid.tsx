import { motion } from 'framer-motion';
import type { PatientActionCardData, PatientActionType } from '../../types/types';
import { ActionCard } from './ActionCard';
import { useLanguage } from '../../context/LanguageContext';

// ─── Card skeleton (labels are dynamic, filled below) ────────────────────────

interface CardSkeleton {
  id: PatientActionType;
  icon: string;
  route: string;
  colorToken: string;
}

const CARD_SKELETONS: CardSkeleton[] = [
  { id: 'play',         icon: 'Gamepad2',          route: '/play',      colorToken: 'card-play' },
  { id: 'my_day',       icon: 'CalendarDays',       route: '/my-day',    colorToken: 'card-myday' },
  { id: 'reminders',    icon: 'Bell',               route: '/reminders', colorToken: 'card-reminders' },
  { id: 'family',       icon: 'Users',              route: '/family',    colorToken: 'card-family' },
  { id: 'talk_to_mira', icon: 'MessageCircleHeart', route: '/mira',      colorToken: 'card-mira' },
];

interface ActionCardGridProps {
  onCardSelect: (action: PatientActionType) => void;
}

/**
 * 2-column grid of 5 large action cards.
 * Labels are translated via LanguageContext — switching language in Settings
 * updates the cards instantly without any page reload.
 */
export function ActionCardGrid({ onCardSelect }: ActionCardGridProps) {
  const { t } = useLanguage();

  // Map dictionary key per card ID
  const labelFor = (id: PatientActionType): string => {
    switch (id) {
      case 'play':         return t('play');
      case 'my_day':       return t('myDay');
      case 'reminders':    return t('reminders');
      case 'family':       return t('family');
      case 'talk_to_mira': return t('mira');
      default:             return id;
    }
  };

  const cards: PatientActionCardData[] = CARD_SKELETONS.map(s => ({
    ...s,
    label: labelFor(s.id),
  }));

  const regularCards = cards.slice(0, 4);
  const miraCard     = cards[4];

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
