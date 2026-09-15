import { useMemo } from 'react';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface GreetingInfo {
  greeting: string;
  timeOfDay: TimeOfDay;
  emoji: string;
  subtext: string;
}

export function useTimeOfDayGreeting(): GreetingInfo {
  return useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good Morning',
        timeOfDay: 'morning',
        emoji: '☀️',
        subtext: "A wonderful day to engage your mind.",
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good Afternoon',
        timeOfDay: 'afternoon',
        emoji: '🌤️',
        subtext: "Hope your day is going well.",
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greeting: 'Good Evening',
        timeOfDay: 'evening',
        emoji: '🌙',
        subtext: "Time to relax and reflect.",
      };
    } else {
      return {
        greeting: 'Good Night',
        timeOfDay: 'night',
        emoji: '✨',
        subtext: "Restful moments matter too.",
      };
    }
  }, []);
}
