import { motion } from 'framer-motion';
import type { MiraState } from '../../types/types';

interface MiraAvatarOrbProps {
  state: MiraState;
  size?: number;
}

const STATE_COLORS: Record<MiraState, { from: string; to: string; via?: string }> = {
  idle: {
    from: 'rgb(167, 139, 250)',
    via: 'rgb(124, 92, 252)',
    to: 'rgb(91, 53, 234)',
  },
  listening: {
    from: 'rgb(96, 165, 250)',
    via: 'rgb(59, 130, 246)',
    to: 'rgb(37, 99, 235)',
  },
  processing: {
    from: 'rgb(251, 191, 36)',
    via: 'rgb(245, 158, 11)',
    to: 'rgb(217, 119, 6)',
  },
  speaking: {
    from: 'rgb(52, 211, 153)',
    via: 'rgb(16, 185, 129)',
    to: 'rgb(5, 150, 105)',
  },
  error: {
    from: 'rgb(252, 165, 165)',
    via: 'rgb(239, 68, 68)',
    to: 'rgb(220, 38, 38)',
  },
};

const IDLE_PULSE = { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] };
const LISTENING_PULSE = { scale: [1, 1.12, 1, 1.08, 1] };
const PROCESSING_ROTATE = { rotate: [0, 360] };
const SPEAKING_BOUNCE = { scale: [1, 1.08, 0.96, 1.05, 1] };
const ERROR_SHAKE = { scale: [1, 1.03, 0.97, 1] };

const getAnimation = (state: MiraState) => {
  switch (state) {
    case 'idle': return IDLE_PULSE;
    case 'listening': return LISTENING_PULSE;
    case 'processing': return PROCESSING_ROTATE;
    case 'speaking': return SPEAKING_BOUNCE;
    case 'error': return ERROR_SHAKE;
  }
};

const getTransition = (state: MiraState) => {
  switch (state) {
    case 'idle':
      return { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const };
    case 'listening':
      return { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const };
    case 'processing':
      return { duration: 1.5, repeat: Infinity, ease: 'linear' as const };
    case 'speaking':
      return { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const };
    case 'error':
      return { duration: 0.4, repeat: 2, ease: 'easeInOut' as const };
  }
};

/**
 * Animated orb representing MIRA's state.
 * Each state has a distinct color and animation pattern.
 */
export function MiraAvatarOrb({ state, size = 64 }: MiraAvatarOrbProps) {
  const colors = STATE_COLORS[state];

  return (
    <motion.div
      key={state}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${colors.from}, ${colors.via ?? colors.to} 60%, ${colors.to} 100%)`,
        boxShadow: `0 0 ${size * 0.4}px ${size * 0.15}px ${colors.from}66`,
        position: 'relative',
        overflow: 'hidden',
      }}
      animate={getAnimation(state)}
      transition={getTransition(state)}
    >
      {/* Inner highlight */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: '20%',
          width: '35%',
          height: '25%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.35)',
          filter: 'blur(2px)',
        }}
      />

      {/* Speaking wave rings */}
      {state === 'speaking' && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                inset: `-${i * 8}px`,
                borderRadius: '50%',
                border: `2px solid ${colors.from}44`,
              }}
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut' as const,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
