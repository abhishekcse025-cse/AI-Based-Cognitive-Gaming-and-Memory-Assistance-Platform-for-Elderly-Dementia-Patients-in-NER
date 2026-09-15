import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type SyncState, subscribeSyncState } from '../services/syncService';

interface SyncIndicatorProps {
  /** Kept for backward compatibility — triggers a re-check after game saves */
  refreshTrigger?: number;
}

/**
 * Live sync status badge.
 *
 * 🔄 Syncing...       — actively POSTing to backend
 * 🟢 Synced           — all sessions confirmed by server
 * 🟠 Offline (X saved) — sessions queued, no network / server down
 */
export function SyncIndicator({ refreshTrigger = 0 }: SyncIndicatorProps) {
  const [state,   setState]   = useState<SyncState>('idle');
  const [count,   setCount]   = useState(0);

  useEffect(() => {
    const unsub = subscribeSyncState((s, c) => {
      setState(s);
      setCount(c);
    });
    return unsub;
  }, [refreshTrigger]); // re-subscribe when refreshTrigger changes (game just saved)

  const config = {
    syncing: {
      icon: '🔄',
      label: 'Syncing...',
      bg: 'rgba(124,92,252,0.1)',
      border: 'rgba(124,92,252,0.25)',
      color: 'rgb(91,53,234)',
    },
    synced: {
      icon: '🟢',
      label: 'Synced',
      bg: 'rgba(16,185,129,0.1)',
      border: 'rgba(16,185,129,0.25)',
      color: 'rgb(5,150,105)',
    },
    offline: {
      icon: '🟠',
      label: `Offline (${count} saved)`,
      bg: 'rgba(249,115,22,0.1)',
      border: 'rgba(249,115,22,0.25)',
      color: 'rgb(194,65,12)',
    },
    idle: {
      icon: '🟢',
      label: 'Synced',
      bg: 'rgba(16,185,129,0.1)',
      border: 'rgba(16,185,129,0.25)',
      color: 'rgb(5,150,105)',
    },
  } as const satisfies Record<SyncState, { icon: string; label: string; bg: string; border: string; color: string }>;

  const c = config[state];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state + count}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        role="status"
        aria-live="polite"
        aria-label={c.label}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: c.bg,
          border: `1.5px solid ${c.border}`,
          color: c.color,
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        <span aria-hidden="true">{c.icon}</span>
        {c.label}
      </motion.div>
    </AnimatePresence>
  );
}
