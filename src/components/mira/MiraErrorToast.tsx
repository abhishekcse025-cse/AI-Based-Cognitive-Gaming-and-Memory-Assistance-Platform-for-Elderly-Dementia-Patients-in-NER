import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface MiraErrorToastProps {
  message: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

/**
 * Friendly, non-technical error toast for MIRA voice errors.
 * Auto-dismisses after 6 seconds if not interacted with.
 */
export function MiraErrorToast({ message, onDismiss, onRetry }: MiraErrorToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-start gap-3 p-5 rounded-2xl"
          style={{
            background: 'rgb(255, 240, 240)',
            border: '1.5px solid rgb(var(--color-error), 0.25)',
            color: 'rgb(var(--color-text-primary))',
          }}
        >
          <AlertCircle
            className="w-6 h-6 flex-shrink-0 mt-0.5"
            style={{ color: 'rgb(var(--color-error))' }}
            aria-hidden="true"
          />
          <div className="flex-1 space-y-3">
            <p style={{ fontSize: 'var(--text-base)', lineHeight: '1.5' }}>{message}</p>
            {onRetry && (
              <button
                onClick={() => { onRetry(); onDismiss(); }}
                className="flex items-center gap-2 font-semibold"
                style={{
                  color: 'rgb(var(--color-primary))',
                  fontSize: 'var(--text-base)',
                  minHeight: '44px',
                }}
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Try again
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
