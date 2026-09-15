import { motion } from 'framer-motion';
import type { MiraFloatingButtonProps } from '../../types/types';
import { MiraAvatarOrb } from './MiraAvatarOrb';
import { MiraStatusRing } from './MiraStatusRing';

const STATE_ARIA_LABELS = {
  idle: 'Talk to MIRA',
  listening: 'MIRA is listening',
  processing: 'MIRA is thinking',
  speaking: 'MIRA is speaking',
  error: 'MIRA had an issue — tap to retry',
};

/**
 * Persistent floating action button for MIRA.
 * Mounted once in AppShell — persists across all screens.
 * Shows distinct visual states via MiraAvatarOrb + MiraStatusRing.
 */
export function MiraFloatingButton({ state, onActivate }: MiraFloatingButtonProps) {
  const isActive = state !== 'idle';

  return (
    <motion.div
      className="fixed bottom-24 right-4 z-30"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: 0.6, damping: 18, stiffness: 280 }}
    >
      <motion.button
        onClick={onActivate}
        aria-label={STATE_ARIA_LABELS[state]}
        aria-pressed={isActive}
        whileTap={{ scale: 0.92 }}
        className="relative flex items-center justify-center"
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          outline: 'none',
        }}
      >
        {/* Outer glow ring */}
        {isActive && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-[-8px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Status ring SVG */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{ inset: -12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <MiraStatusRing state={state} size={80} />
        </div>

        {/* Orb */}
        <MiraAvatarOrb state={state} size={60} />
      </motion.button>

      {/* State label */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-center"
      >
        <span
          className="inline-block px-3 py-1 rounded-full text-white font-semibold"
          style={{
            background: 'rgba(124,92,252,0.85)',
            fontSize: '11px',
            letterSpacing: '0.02em',
            backdropFilter: 'blur(8px)',
          }}
        >
          MIRA
        </span>
      </motion.div>
    </motion.div>
  );
}
