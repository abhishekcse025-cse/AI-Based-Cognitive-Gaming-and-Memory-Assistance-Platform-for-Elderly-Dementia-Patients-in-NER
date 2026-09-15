import { motion } from 'framer-motion';
import type { MiraState } from '../../types/types';

interface MiraStatusRingProps {
  state: MiraState;
  size?: number;
}

const STATE_RING_COLORS: Record<MiraState, string> = {
  idle: 'rgb(167, 139, 250)',
  listening: 'rgb(96, 165, 250)',
  processing: 'rgb(251, 191, 36)',
  speaking: 'rgb(52, 211, 153)',
  error: 'rgb(239, 68, 68)',
};

/**
 * Animated SVG ring that surrounds the MIRA orb.
 * State-specific stroke dash animations convey current mode to the user.
 */
export function MiraStatusRing({ state, size = 88 }: MiraStatusRingProps) {
  const r = size / 2 - 5;
  const circumference = 2 * Math.PI * r;
  const color = STATE_RING_COLORS[state];
  const cx = size / 2;
  const cy = size / 2;

  const getStrokeDash = () => {
    switch (state) {
      case 'idle': return circumference * 0.25;
      case 'listening': return circumference * 0.6;
      case 'processing': return circumference * 0.75;
      case 'speaking': return circumference;
      case 'error': return circumference * 0.4;
    }
  };

  const ringAnimation =
    state === 'processing'
      ? { rotate: 360 }
      : state === 'listening'
      ? { rotate: [0, 15, -15, 0] as number[] }
      : {};

  const ringTransition =
    state === 'processing'
      ? { duration: 1.5, repeat: Infinity, ease: 'linear' as const }
      : state === 'listening'
      ? { duration: 1.0, repeat: Infinity, ease: 'easeInOut' as const }
      : {};

  const duration = state === 'idle' ? 2.5 : state === 'speaking' ? 0.8 : 1.2;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ position: 'absolute', inset: -(size - (size - 12)) / 2 }}
      animate={ringAnimation}
      transition={ringTransition}
    >
      {/* Track ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={`${color}22`}
        strokeWidth={3}
      />

      {/* Animated progress ring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{
          strokeDashoffset: [circumference, circumference - getStrokeDash()],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </motion.svg>
  );
}
