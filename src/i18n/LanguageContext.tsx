import React, { createContext, useContext, useState } from 'react';
import { Platform } from 'react-native';
import { SUPPORTED_LANGUAGES, LanguageOption } from './languages';
import { TRANSLATIONS, TranslationDict } from './translations';
import { soundManager } from '../services/audioCue';

interface LanguageContextType {
  currentLanguage: LanguageOption;
  t: TranslationDict;
  changeLanguage: (code: string) => void;
  isLanguageModalVisible: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
  speakTextInLanguage: (text: string) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(
    SUPPORTED_LANGUAGES.find((l) => l.code === 'hi') || SUPPORTED_LANGUAGES[0] // Default can be Hindi or English
  );
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  const changeLanguage = (code: string) => {
    soundManager.playTap();
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (found) {
      setCurrentLanguage(found);
    }
    setIsLanguageModalVisible(false);
  };

  const openLanguageModal = () => {
    soundManager.playTap();
    setIsLanguageModalVisible(true);
  };

  const closeLanguageModal = () => {
    soundManager.playTap();
    setIsLanguageModalVisible(false);
  };

  // Speaks text with language-specific acoustic synthesis
  const speakTextInLanguage = (text: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage.speechCode;
        utterance.rate = 0.85; // Slow, clear pace for elderly listeners
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  };

  const t = TRANSLATIONS[currentLanguage.code] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        t,
        changeLanguage,
        isLanguageModalVisible,
        openLanguageModal,
        closeLanguageModal,
        speakTextInLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useAppLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useAppLanguage must be used within a LanguageProvider');
  }
  return context;
};
