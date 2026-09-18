import { useMemo } from 'react';
import type { DictionaryKey } from '../context/LanguageContext';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface GreetingInfo {
  greetingKey: DictionaryKey;  // dictionary key, e.g. 'greeting.morning'
  subtextKey: DictionaryKey;   // dictionary key, e.g. 'subtext.morning'
  timeOfDay: TimeOfDay;
  emoji: string;
}

/**
 * Returns the time-of-day slot and emoji.
 * Callers should pass the keys into `t()` from useLanguage() to get translated text.
 */
export function useTimeOfDayGreeting(): GreetingInfo {
  return useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        greetingKey: 'greeting.morning',
        subtextKey:  'subtext.morning',
        timeOfDay:   'morning',
        emoji:       '☀️',
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greetingKey: 'greeting.afternoon',
        subtextKey:  'subtext.afternoon',
        timeOfDay:   'afternoon',
        emoji:       '🌤️',
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greetingKey: 'greeting.evening',
        subtextKey:  'subtext.evening',
        timeOfDay:   'evening',
        emoji:       '🌙',
      };
    } else {
      return {
        greetingKey: 'greeting.night',
        subtextKey:  'subtext.night',
        timeOfDay:   'night',
        emoji:       '✨',
      };
    }
  }, []);
}
