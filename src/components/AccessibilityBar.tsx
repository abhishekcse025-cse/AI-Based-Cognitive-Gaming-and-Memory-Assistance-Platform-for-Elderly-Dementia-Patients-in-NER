import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLanguage } from '../i18n/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

export const AccessibilityBar: React.FC = () => {
  const {
    isDarkMode,
    toggleTheme,
    colors,
    isSoundEnabled,
    toggleSound,
    isLargeFont,
    toggleFontSize,
  } = useAppTheme();

  const { currentLanguage, openLanguageModal, t } = useAppLanguage();

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
      {/* Language Selector Button */}
      <Pressable
        onPress={openLanguageModal}
        accessibilityRole="button"
        accessibilityLabel={`Current language: ${currentLanguage.nativeName}. Tap to change language.`}
        style={({ pressed }) => [
          styles.actionBtn,
          {
            backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF',
            borderColor: colors.primary,
          },
          pressed && styles.btnPressed,
        ]}
      >
        <Text style={styles.flagText}>{currentLanguage.flag}</Text>
        <Text
          style={[
            styles.btnText,
            { color: colors.primary },
          ]}
          numberOfLines={1}
        >
          {currentLanguage.nativeName}
        </Text>
      </Pressable>

      {/* Day / Night Switch */}
      <Pressable
        onPress={toggleTheme}
        accessibilityRole="button"
        accessibilityLabel={`Current mode: ${isDarkMode ? 'Night Mode' : 'Day Mode'}. Tap to toggle.`}
        style={({ pressed }) => [
          styles.actionBtn,
          {
            backgroundColor: isDarkMode ? '#334155' : '#FEF3C7',
            borderColor: isDarkMode ? '#94A3B8' : '#D97706',
          },
          pressed && styles.btnPressed,
        ]}
      >
        <Ionicons
          name={isDarkMode ? 'moon' : 'sunny'}
          size={20}
          color={isDarkMode ? '#F8FAFC' : '#B45309'}
        />
        <Text
          style={[
            styles.btnText,
            { color: isDarkMode ? '#F8FAFC' : '#78350F' },
          ]}
        >
          {isDarkMode ? t.nightMode : t.dayMode}
        </Text>
      </Pressable>

      {/* Font Size A / A+ Toggle */}
      <Pressable
        onPress={toggleFontSize}
        accessibilityRole="button"
        accessibilityLabel={`Font size: ${isLargeFont ? 'Extra Large' : 'Standard'}. Tap to toggle.`}
        style={({ pressed }) => [
          styles.actionBtn,
          {
            backgroundColor: isLargeFont ? '#DBEAFE' : colors.secondary,
            borderColor: isLargeFont ? colors.primary : colors.borderThick,
          },
          pressed && styles.btnPressed,
        ]}
      >
        <Text style={[styles.fontIconText, { color: colors.textPrimary }]}>
          {isLargeFont ? 'A+' : 'A'}
        </Text>
        <Text style={[styles.btnText, { color: colors.textPrimary }]}>
          {isLargeFont ? t.largeFont : t.regularFont}
        </Text>
      </Pressable>

      {/* Sound On / Off Toggle */}
      <Pressable
        onPress={toggleSound}
        accessibilityRole="button"
        accessibilityLabel={`Sound is ${isSoundEnabled ? 'On' : 'Off'}. Tap to toggle.`}
        style={({ pressed }) => [
          styles.actionBtn,
          {
            backgroundColor: isSoundEnabled ? '#DCFCE7' : '#FEE2E2',
            borderColor: isSoundEnabled ? '#15803D' : '#B91C1C',
          },
          pressed && styles.btnPressed,
        ]}
      >
        <Ionicons
          name={isSoundEnabled ? 'volume-high' : 'volume-mute'}
          size={20}
          color={isSoundEnabled ? '#15803D' : '#B91C1C'}
        />
        <Text
          style={[
            styles.btnText,
            { color: isSoundEnabled ? '#14532D' : '#7F1D1D' },
          ]}
        >
          {isSoundEnabled ? t.soundOn : t.mute}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  btnPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  flagText: {
    fontSize: 18,
    marginRight: 4,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 4,
  },
  fontIconText: {
    fontSize: 18,
    fontWeight: '900',
  },
});
