import { motion } from 'framer-motion';
import { useTimeOfDayGreeting } from '../../hooks/useTimeOfDayGreeting';
import type { PatientProfile } from '../../types/types';

interface GreetingHeaderProps {
  patient: PatientProfile | null;
}

/**
 * Time-aware greeting header with current date.
 * Large typography, warm emoji, friendly subtext.
 */
export function GreetingHeader({ patient }: GreetingHeaderProps) {
  const { greeting, emoji, subtext } = useTimeOfDayGreeting();
  const name = patient?.displayName ?? 'Friend';

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="px-6 pt-8 pb-6"
    >
      {/* Date */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-medium text-[rgb(var(--color-text-secondary))] mb-3"
        style={{ fontSize: 'var(--text-base)' }}
        aria-label={`Today is ${today}`}
      >
        📅 {today}
      </motion.p>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <h1
          className="font-extrabold leading-tight text-[rgb(var(--color-text-primary))]"
          style={{ fontSize: 'var(--text-4xl)', fontFamily: 'Nunito, Inter, sans-serif' }}
        >
          {greeting}
          <span className="ml-3" aria-hidden="true">
            {emoji}
          </span>
        </h1>
        <h2
          className="font-bold mt-1 text-gradient-primary"
          style={{ fontSize: 'var(--text-3xl)', fontFamily: 'Nunito, Inter, sans-serif' }}
        >
          {name}
        </h2>
      </motion.div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-3 text-[rgb(var(--color-text-secondary))]"
        style={{ fontSize: 'var(--text-lg)' }}
      >
        {subtext}
      </motion.p>

      {/* Prompt */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-2 font-semibold text-[rgb(var(--color-text-primary))]"
        style={{ fontSize: 'var(--text-xl)' }}
      >
        What would you like to do?
      </motion.p>
    </motion.header>
  );
}
