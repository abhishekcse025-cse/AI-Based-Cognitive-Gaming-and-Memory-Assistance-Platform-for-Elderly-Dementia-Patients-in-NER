import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { LanguageModal } from './src/components/LanguageModal';
import { RootNavigator } from './src/navigation/RootNavigator';

function MainApp() {
  const { isDarkMode } = useAppTheme();
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <RootNavigator />
      <LanguageModal />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
