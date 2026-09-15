import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff } from 'lucide-react';
import type { MiraSessionState } from '../../types/types';
import { MiraAvatarOrb } from './MiraAvatarOrb';
import { MiraTranscriptBubble } from './MiraTranscriptBubble';
import { MiraErrorToast } from './MiraErrorToast';
import { useMira } from '../../context/MiraContext';

// Demo responses — replaced by real API in future phases
const DEMO_RESPONSES: Record<string, string> = {
  default: "Good morning! I'm here to help. You can ask me about your day, your reminders, or just have a chat.",
  morning: "Good morning! You have your memory game at 10:00 and your medicine reminder at 12:30. Would you like to start your day?",
  day: "Today looks like a wonderful day. Your memory game is at 10:00, and your family video call is scheduled for 3:00 PM.",
  reminder: "You have a medicine reminder at 12:30 PM and a hydration reminder at 2:00 PM. Shall I remind you again closer to the time?",
  game: "Wonderful! Would you like to start a Memory Match game? It's a great way to keep the mind engaged.",
  family: "Your family circle includes Meera, Rohan, and Priya. Would you like to see a family memory or send a message?",
};

const STATE_LABELS: Record<string, string> = {
  idle: "Tap the microphone to speak",
  listening: "Listening… speak whenever you're ready",
  processing: "Just a moment, thinking…",
  speaking: "Here's what I found for you",
  error: "Let's try that again",
};

interface MiraPanelProps {
  isOpen: boolean;
  session: MiraSessionState;
  onClose: () => void;
}

/**
 * Expanded MIRA conversational panel.
 * Slides up from the bottom on activation.
 * Full dialog with focus trap and escape-key support.
 */
export function MiraPanel({ isOpen, session, onClose }: MiraPanelProps) {
  const { activate, setResponseText, setErrorMessage } = useMira();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Simulate MIRA response after transcript arrives
  useEffect(() => {
    if (session.state === 'processing' && session.transcript) {
      const transcript = session.transcript.toLowerCase();
      const key = Object.keys(DEMO_RESPONSES).find(k => transcript.includes(k)) ?? 'default';
      setTimeout(() => {
        setResponseText(DEMO_RESPONSES[key]);
      }, 1500);
    }
  }, [session.state, session.transcript, setResponseText]);

  const isListening = session.state === 'listening';
  const statusLabel = STATE_LABELS[session.state] ?? 'Ready';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mira-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="mira-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Talk to MIRA"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] overflow-hidden"
            style={{
              background: 'rgb(var(--color-surface-bg))',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
              <div className="w-10 h-1.5 rounded-full bg-[rgba(var(--color-text-primary),0.15)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <MiraAvatarOrb state={session.state} size={52} />
                </div>
                <div>
                  <h2
                    className="font-bold text-gradient-primary"
                    style={{ fontSize: 'var(--text-2xl)' }}
                  >
                    MIRA
                  </h2>
                  <p
                    className="text-[rgb(var(--color-text-secondary))]"
                    style={{ fontSize: 'var(--text-sm)' }}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {statusLabel}
                  </p>
                </div>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close MIRA"
                className="h-12 w-12 rounded-xl flex items-center justify-center text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-text-primary),0.06)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conversation area */}
            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 min-h-[180px]">
              {/* Welcome message */}
              {!session.transcript && !session.responseText && session.state === 'listening' && (
                <MiraTranscriptBubble
                  text="Hello! I'm listening. What would you like to talk about?"
                  speaker="mira"
                  state={session.state}
                />
              )}

              {/* User transcript */}
              <MiraTranscriptBubble
                text={session.transcript}
                speaker="user"
                state={session.state}
              />

              {/* MIRA thinking indicator */}
              {session.state === 'processing' && !session.responseText && (
                <MiraTranscriptBubble
                  text=" "
                  speaker="mira"
                  state="processing"
                />
              )}

              {/* MIRA response */}
              <MiraTranscriptBubble
                text={session.responseText}
                speaker="mira"
                state={session.state}
              />

              {/* Error toast */}
              <MiraErrorToast
                message={session.errorMessage}
                onDismiss={() => setErrorMessage('')}
                onRetry={activate}
              />
            </div>

            {/* Microphone button */}
            <div className="px-6 pb-8 pt-4">
              <button
                onClick={isListening ? onClose : activate}
                aria-label={isListening ? 'Stop listening' : 'Start speaking to MIRA'}
                aria-pressed={isListening}
                className="w-full flex items-center justify-center gap-4 rounded-3xl font-bold transition-all duration-300 active:scale-95"
                style={{
                  minHeight: 'var(--touch-comfortable)',
                  fontSize: 'var(--text-xl)',
                  background: isListening
                    ? 'rgb(var(--color-error))'
                    : 'rgb(var(--color-primary))',
                  color: 'white',
                  boxShadow: isListening
                    ? '0 8px 30px rgba(239,68,68,0.35)'
                    : 'var(--shadow-float)',
                }}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-7 h-7" aria-hidden="true" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-7 h-7" aria-hidden="true" />
                    Speak to MIRA
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
