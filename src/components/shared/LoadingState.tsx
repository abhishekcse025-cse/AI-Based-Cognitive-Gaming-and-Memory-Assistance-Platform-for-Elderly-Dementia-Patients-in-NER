import React from 'react';
import { motion } from 'framer-motion';

// ─── Loading State ────────────────────────────────────────────────────────────

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Just a moment…' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="flex flex-col items-center justify-center gap-6 py-16 px-8"
    >
      {/* Animated orb loader */}
      <motion.div
        className="w-16 h-16 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--color-mira)) 0%, rgb(var(--color-primary)) 100%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }}
      />
      <p
        className="text-center font-medium text-[rgb(var(--color-text-secondary))]"
        style={{ fontSize: 'var(--text-lg)' }}
      >
        {message}
      </p>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  emoji = '🌸',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 px-8 text-center">
      <span className="text-6xl" role="img" aria-hidden="true">
        {emoji}
      </span>
      <div className="space-y-2">
        <h3
          className="font-bold text-[rgb(var(--color-text-primary))]"
          style={{ fontSize: 'var(--text-2xl)' }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="text-[rgb(var(--color-text-secondary))] max-w-xs mx-auto"
            style={{ fontSize: 'var(--text-lg)' }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went a bit sideways. Let's try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-5 py-16 px-8 text-center"
    >
      <span className="text-6xl" role="img" aria-hidden="true">
        🌿
      </span>
      <div className="space-y-2">
        <h3
          className="font-bold text-[rgb(var(--color-text-primary))]"
          style={{ fontSize: 'var(--text-xl)' }}
        >
          {message}
        </h3>
        <p
          className="text-[rgb(var(--color-text-secondary))]"
          style={{ fontSize: 'var(--text-base)' }}
        >
          You can give it another go whenever you're ready.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 h-16 px-8 rounded-2xl bg-[rgb(var(--color-primary))] text-white font-semibold text-lg hover:opacity-90 transition-opacity active:scale-95"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
