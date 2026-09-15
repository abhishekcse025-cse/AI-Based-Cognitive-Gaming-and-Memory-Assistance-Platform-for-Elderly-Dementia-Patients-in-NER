import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings2, Volume2, VolumeX, Globe } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { TextSizeControl } from './TextSizeControl';
import { ContrastToggle } from './ContrastToggle';
import { ReducedMotionToggle } from './ReducedMotionToggle';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'as', label: 'অসমীয়া (Assamese)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];

export function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const { settings, setSoundEnabled, setLanguageCode, resetToDefaults } = useAccessibility();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Accessibility Settings"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 overflow-y-auto"
            style={{ background: 'rgb(var(--color-surface-bg))' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[rgba(var(--color-text-primary),0.08)]"
              style={{ background: 'rgb(var(--color-surface-bg))' }}>
              <div className="flex items-center gap-3">
                <Settings2
                  className="w-7 h-7 text-[rgb(var(--color-primary))]"
                  aria-hidden="true"
                />
                <h2
                  className="font-bold text-[rgb(var(--color-text-primary))]"
                  style={{ fontSize: 'var(--text-2xl)' }}
                >
                  Settings
                </h2>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close settings"
                className="h-12 w-12 rounded-xl flex items-center justify-center text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-text-primary),0.06)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-6 space-y-8">
              <TextSizeControl />
              <hr className="border-[rgba(var(--color-text-primary),0.08)]" />

              <ContrastToggle />
              <hr className="border-[rgba(var(--color-text-primary),0.08)]" />

              <ReducedMotionToggle />
              <hr className="border-[rgba(var(--color-text-primary),0.08)]" />

              {/* Sound */}
              <div className="space-y-3">
                <p
                  className="font-semibold text-[rgb(var(--color-text-primary))]"
                  style={{ fontSize: 'var(--text-lg)' }}
                >
                  Sound
                </p>
                <button
                  role="switch"
                  aria-checked={settings.soundEnabled}
                  aria-label="Toggle sound effects"
                  onClick={() => setSoundEnabled(!settings.soundEnabled)}
                  className="w-full flex items-center justify-between gap-4 rounded-2xl border-2 border-[rgba(var(--color-text-primary),0.15)] p-5 min-h-[80px] hover:border-[rgb(var(--color-primary))] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {settings.soundEnabled
                      ? <Volume2 className="w-8 h-8 text-[rgb(var(--color-primary))]" aria-hidden="true" />
                      : <VolumeX className="w-8 h-8 text-[rgb(var(--color-text-secondary))]" aria-hidden="true" />
                    }
                    <span className="font-bold text-[rgb(var(--color-text-primary))]" style={{ fontSize: 'var(--text-lg)' }}>
                      {settings.soundEnabled ? 'Sound On' : 'Sound Off'}
                    </span>
                  </div>
                  <div aria-hidden="true" className={`relative flex-shrink-0 w-14 h-8 rounded-full transition-colors duration-300 ${settings.soundEnabled ? 'bg-[rgb(var(--color-primary))]' : 'bg-[rgba(var(--color-text-primary),0.2)]'}`}>
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                  </div>
                </button>
              </div>

              <hr className="border-[rgba(var(--color-text-primary),0.08)]" />

              {/* Language */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-[rgb(var(--color-primary))]" aria-hidden="true" />
                  <p
                    className="font-semibold text-[rgb(var(--color-text-primary))]"
                    style={{ fontSize: 'var(--text-lg)' }}
                  >
                    Language
                  </p>
                </div>
                <div
                  role="listbox"
                  aria-label="Select language"
                  className="grid grid-cols-2 gap-3"
                >
                  {LANGUAGE_OPTIONS.map(({ code, label }) => {
                    const isSelected = settings.languageCode === code;
                    return (
                      <button
                        key={code}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => setLanguageCode(code)}
                        className={`flex items-center justify-center text-center rounded-xl border-2 p-4 min-h-[64px] transition-all duration-200 font-medium text-sm ${
                          isSelected
                            ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.08)] text-[rgb(var(--color-primary))]'
                            : 'border-[rgba(var(--color-text-primary),0.15)] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-[rgba(var(--color-text-primary),0.08)]" />

              {/* Reset */}
              <button
                onClick={resetToDefaults}
                className="w-full h-16 rounded-2xl border-2 border-[rgba(var(--color-text-primary),0.15)] text-[rgb(var(--color-text-secondary))] font-semibold hover:border-[rgb(var(--color-error))] hover:text-[rgb(var(--color-error))] transition-all duration-200"
                style={{ fontSize: 'var(--text-base)' }}
              >
                Reset to Defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
