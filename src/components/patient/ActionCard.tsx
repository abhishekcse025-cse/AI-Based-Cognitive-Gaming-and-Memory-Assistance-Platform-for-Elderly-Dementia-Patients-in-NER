import React from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  CalendarDays,
  Bell,
  Users,
  MessageCircleHeart,
  type LucideProps,
} from 'lucide-react';
import type { ActionCardProps, PatientActionType } from '../../types/types';

// ─── Icon Map ─────────────────────────────────────────────────────────────────

type LucideIcon = React.FC<LucideProps>;

const ICON_MAP: Record<string, LucideIcon> = {
  Gamepad2,
  CalendarDays,
  Bell,
  Users,
  MessageCircleHeart,
};

// ─── Color Token Map ──────────────────────────────────────────────────────────

const COLOR_TOKEN_MAP: Record<string, { bg: string; icon: string; shadow: string }> = {
  'card-play': {
    bg: 'rgb(var(--card-play))',
    icon: 'rgb(var(--card-play-icon))',
    shadow: 'rgba(124,92,252,0.18)',
  },
  'card-myday': {
    bg: 'rgb(var(--card-myday))',
    icon: 'rgb(var(--card-myday-icon))',
    shadow: 'rgba(249,115,22,0.18)',
  },
  'card-reminders': {
    bg: 'rgb(var(--card-reminders))',
    icon: 'rgb(var(--card-reminders-icon))',
    shadow: 'rgba(16,185,129,0.18)',
  },
  'card-family': {
    bg: 'rgb(var(--card-family))',
    icon: 'rgb(var(--card-family-icon))',
    shadow: 'rgba(239,68,68,0.18)',
  },
  'card-mira': {
    bg: 'rgb(var(--card-mira))',
    icon: 'rgb(var(--card-mira-icon))',
    shadow: 'rgba(91,53,234,0.22)',
  },
};

/**
 * Single reusable large touch-target action card.
 * All 5 home screen actions use this one component with different prop data.
 * Min 160px height, tap/hover Framer Motion animations.
 */
export function ActionCard({ data, onSelect }: ActionCardProps) {
  const { id, label, icon, colorToken } = data;
  const colors = COLOR_TOKEN_MAP[colorToken] ?? COLOR_TOKEN_MAP['card-play'];
  const IconComponent = ICON_MAP[icon];

  return (
    <motion.button
      onClick={() => onSelect(id as PatientActionType)}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', damping: 20, stiffness: 320 }}
      className="relative flex flex-col items-center justify-center gap-4 rounded-3xl p-6 text-center w-full overflow-hidden"
      aria-label={`Open ${label}`}
      style={{
        minHeight: 160,
        background: colors.bg,
        boxShadow: `0 8px 32px -4px ${colors.shadow}, 0 2px 8px rgba(0,0,0,0.06)`,
      }}
    >
      {/* Icon container */}
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: 64,
          height: 64,
          color: colors.icon,
          background: `${colors.icon}18`,
        }}
        aria-hidden="true"
      >
        {IconComponent && (
          <IconComponent
            size={36}
            color={colors.icon}
            strokeWidth={1.8}
          />
        )}
      </div>

      {/* Label */}
      <span
        className="font-bold leading-tight text-[rgb(var(--color-text-primary))]"
        style={{ fontSize: 'var(--text-xl)' }}
      >
        {label}
      </span>

      {/* Decorative organic circle */}
      <div
        aria-hidden="true"
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20"
        style={{ background: colors.icon }}
      />
    </motion.button>
  );
}
