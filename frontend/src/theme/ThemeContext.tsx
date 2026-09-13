import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { lightColors, darkColors, baseTypography, baseLayout } from './theme';
import { soundManager } from '../services/audioCue';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
  typography: typeof baseTypography;
  layout: typeof baseLayout;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  isLargeFont: boolean;
  toggleFontSize: () => void;
  speakText: (text: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isLargeFont, setIsLargeFont] = useState(false);

  const toggleTheme = () => {
    soundManager.playTap();
    setIsDarkMode((prev) => !prev);
  };

  const toggleSound = () => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      soundManager.setEnabled(next);
      if (next) soundManager.playSuccess();
      return next;
    });
  };

  const toggleFontSize = () => {
    soundManager.playTap();
    setIsLargeFont((prev) => !prev);
  };

  // Text-to-Speech support for read-aloud prompts
  const speakText = (text: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Slow, calm pace for elderly comprehension
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  const fontMultiplier = isLargeFont ? 1.2 : 1.0;
  const typography = {
    headline: Math.round(baseTypography.headline * fontMultiplier),
    title: Math.round(baseTypography.title * fontMultiplier),
    bodyLarge: Math.round(baseTypography.bodyLarge * fontMultiplier),
    body: Math.round(baseTypography.body * fontMultiplier),
    button: Math.round(baseTypography.button * fontMultiplier),
    subtext: Math.round(baseTypography.subtext * fontMultiplier),
  };

  const layout = {
    ...baseLayout,
    buttonHeight: isLargeFont ? 86 : baseLayout.buttonHeight,
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
        typography,
        layout,
        isSoundEnabled,
        toggleSound,
        isLargeFont,
        toggleFontSize,
        speakText,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
