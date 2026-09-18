/**
 * COGNIVA Language Context — Lightweight Dictionary Engine
 *
 * Architecture decision: Rather than create a parallel language state,
 * this context reads the already-persisted `languageCode` from AccessibilityContext
 * so the existing language picker in the Settings panel instantly drives translations.
 *
 * Supported locales: 'en' (English), 'hi' (Hindi), 'as' (Assamese)
 * Falls back to 'en' for any locale not yet in the dictionary.
 *
 * Strictly translates the Patient Home Hub only (Phase 1 scope).
 * Game logic and Caregiver Dashboard are intentionally excluded.
 */

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAccessibility } from './AccessibilityContext';

// ─── Supported locales ────────────────────────────────────────────────────────

export type SupportedLocale = 'en' | 'hi' | 'as';

// ─── Dictionary ───────────────────────────────────────────────────────────────

export type DictionaryKey =
  // Greetings
  | 'greeting.morning'
  | 'greeting.afternoon'
  | 'greeting.evening'
  | 'greeting.night'
  | 'subtext.morning'
  | 'subtext.afternoon'
  | 'subtext.evening'
  | 'subtext.night'
  | 'prompt'
  // Home action cards
  | 'play'
  | 'myDay'
  | 'reminders'
  | 'family'
  | 'mira'
  // Bottom navigation
  | 'nav.home'
  | 'nav.play'
  | 'nav.mira'
  | 'nav.memories'
  | 'nav.more';

type Dictionary = Record<DictionaryKey, string>;
type LocaleDictionary = Record<SupportedLocale, Dictionary>;

const DICTIONARY: LocaleDictionary = {
  en: {
    // Greetings
    'greeting.morning':   'Good Morning',
    'greeting.afternoon': 'Good Afternoon',
    'greeting.evening':   'Good Evening',
    'greeting.night':     'Good Night',
    // Subtexts
    'subtext.morning':   'A wonderful day to engage your mind.',
    'subtext.afternoon': 'Hope your day is going well.',
    'subtext.evening':   'Time to relax and reflect.',
    'subtext.night':     'Restful moments matter too.',
    // Prompt
    'prompt': 'What would you like to do?',
    // Action cards
    'play':       'Play',
    'myDay':      'My Day',
    'reminders':  'Reminders',
    'family':     'Family',
    'mira':       'Talk to MIRA',
    // Bottom nav
    'nav.home':     'Home',
    'nav.play':     'Play',
    'nav.mira':     'MIRA',
    'nav.memories': 'Memories',
    'nav.more':     'More',
  },

  hi: {
    // Greetings
    'greeting.morning':   'शुभ प्रभात',
    'greeting.afternoon': 'शुभ दोपहर',
    'greeting.evening':   'शुभ संध्या',
    'greeting.night':     'शुभ रात्रि',
    // Subtexts
    'subtext.morning':   'अपने मन को व्यस्त रखने का एक सुंदर दिन।',
    'subtext.afternoon': 'उम्मीद है आपका दिन अच्छा जा रहा है।',
    'subtext.evening':   'आराम करने और सोचने का समय।',
    'subtext.night':     'शांतिपूर्ण पल भी ज़रूरी हैं।',
    // Prompt
    'prompt': 'आप क्या करना चाहेंगे?',
    // Action cards
    'play':       'खेलें',
    'myDay':      'मेरा दिन',
    'reminders':  'याद दिलाएं',
    'family':     'परिवार',
    'mira':       'MIRA से बात करें',
    // Bottom nav
    'nav.home':     'होम',
    'nav.play':     'खेलें',
    'nav.mira':     'MIRA',
    'nav.memories': 'यादें',
    'nav.more':     'अधिक',
  },

  as: {
    // Greetings
    'greeting.morning':   'শুভ ৰাতিপুৱা',
    'greeting.afternoon': 'শুভ দুপৰীয়া',
    'greeting.evening':   'শুভ আবেলি',
    'greeting.night':     'শুভ নিশা',
    // Subtexts
    'subtext.morning':   'আপোনাৰ মন সতেজ কৰাৰ এক সুন্দৰ দিন।',
    'subtext.afternoon': 'আশা কৰোঁ আপোনাৰ দিন ভালকৈ যাইছে।',
    'subtext.evening':   'জিৰণি আৰু চিন্তা কৰাৰ সময়।',
    'subtext.night':     'শান্তিপূৰ্ণ মুহূৰ্তও গুৰুত্বপূৰ্ণ।',
    // Prompt
    'prompt': 'আপুনি কি কৰিব বিচাৰে?',
    // Action cards
    'play':       'খেলক',
    'myDay':      'মোৰ দিন',
    'reminders':  'স্মাৰক',
    'family':     'পৰিয়াল',
    'mira':       'MIRA ৰ সৈতে কথা পাতক',
    // Bottom nav
    'nav.home':     'ঘৰ',
    'nav.play':     'খেলক',
    'nav.mira':     'MIRA',
    'nav.memories': 'স্মৃতি',
    'nav.more':     'অধিক',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface LanguageContextValue {
  locale: SupportedLocale;
  t: (key: DictionaryKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Reads `languageCode` from AccessibilityContext (already persisted via Settings panel)
 * and exposes a `t()` translate function. No new state needed.
 *
 * Must be rendered inside <AccessibilityProvider>.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { settings } = useAccessibility();

  // Resolve to a supported locale; fall back to 'en' for unsupported codes
  const locale: SupportedLocale =
    settings.languageCode === 'hi' || settings.languageCode === 'as'
      ? (settings.languageCode as SupportedLocale)
      : 'en';

  const dict = DICTIONARY[locale];

  const t = (key: DictionaryKey): string => dict[key] ?? DICTIONARY.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ locale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>');
  return ctx;
}
