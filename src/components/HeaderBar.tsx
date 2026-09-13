import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { soundManager } from '../services/audioCue';

interface HeaderBarProps {
  title: string;
  patientName?: string;
  onEndGame?: () => void;
  onBack?: () => void;
  endGameLabel?: string;
  showThemeToggle?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  patientName,
  onEndGame,
  onBack,
  endGameLabel = 'End Game',
  showThemeToggle = true,
}) => {
  const { colors, typography, isDarkMode, toggleTheme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderBottomColor: colors.borderThick,
        },
      ]}
    >
      <View style={styles.leftSection}>
        {onBack ? (
          <Pressable
            onPress={() => {
              soundManager.playTap();
              onBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Go Back"
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.borderThick,
              },
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="arrow-back" size={30} color={colors.textPrimary} />
            <Text style={[styles.navButtonText, { color: colors.textPrimary, fontSize: typography.body }]}>
              Back
            </Text>
          </Pressable>
        ) : patientName ? (
          <View
            style={[
              styles.patientBadge,
              {
                backgroundColor: isDarkMode ? '#1E3A8A' : '#EEF2FF',
                borderColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="person-circle" size={28} color={colors.primary} />
            <Text
              style={[
                styles.patientBadgeText,
                { color: colors.textPrimary, fontSize: typography.subtext },
              ]}
              numberOfLines={1}
            >
              {patientName}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.centerSection}>
        <Text
          style={[
            styles.titleText,
            { color: colors.textPrimary, fontSize: typography.title },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {showThemeToggle && (
          <Pressable
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${isDarkMode ? 'Day' : 'Night'} Mode`}
            style={({ pressed }) => [
              styles.themeToggleBtn,
              {
                backgroundColor: isDarkMode ? '#334155' : '#FEF3C7',
                borderColor: isDarkMode ? '#94A3B8' : '#D97706',
              },
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons
              name={isDarkMode ? 'sunny' : 'moon'}
              size={22}
              color={isDarkMode ? '#FDE047' : '#B45309'}
            />
          </Pressable>
        )}

        {onEndGame ? (
          <Pressable
            onPress={() => {
              soundManager.playTap();
              onEndGame();
            }}
            accessibilityRole="button"
            accessibilityLabel={`${endGameLabel}, Finish current activity`}
            style={({ pressed }) => [
              styles.navButton,
              styles.endGameButton,
              {
                backgroundColor: colors.dangerBg,
                borderColor: colors.dangerBorder,
              },
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="stop-circle" size={26} color={colors.dangerText} />
            <Text
              style={[
                styles.endGameText,
                { color: colors.dangerText, fontSize: typography.subtext },
              ]}
            >
              {endGameLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 84,
    borderBottomWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  leftSection: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  titleText: {
    fontWeight: '900',
    textAlign: 'center',
  },
  patientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  patientBadgeText: {
    fontWeight: '800',
    marginLeft: 6,
  },
  navButton: {
    minHeight: 52,
    minWidth: 64,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endGameButton: {},
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  navButtonText: {
    fontWeight: '700',
    marginLeft: 6,
  },
  endGameText: {
    fontWeight: '800',
    marginLeft: 4,
  },
});
