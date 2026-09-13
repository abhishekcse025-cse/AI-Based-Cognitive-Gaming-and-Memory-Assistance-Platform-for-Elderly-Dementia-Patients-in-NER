import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLanguage } from '../i18n/LanguageContext';
import { BigButton } from './BigButton';
import { Ionicons } from '@expo/vector-icons';
import { PerformanceRating, DifficultyLevel } from '../types/api';

interface GentleFeedbackModalProps {
  visible: boolean;
  isLoading: boolean;
  performance: PerformanceRating | null;
  nextDifficulty: DifficultyLevel | null;
  completed: boolean;
  moves: number;
  errors: number;
  timeSeconds: number;
  onPlayNext: () => void;
  onGoToMenu: () => void;
}

export const GentleFeedbackModal: React.FC<GentleFeedbackModalProps> = ({
  visible,
  isLoading,
  performance,
  nextDifficulty,
  completed,
  moves,
  errors,
  timeSeconds,
  onPlayNext,
  onGoToMenu,
}) => {
  const { colors, typography, isDarkMode } = useAppTheme();
  const { t } = useAppLanguage();

  const getFeedbackContent = () => {
    if (!completed) {
      return {
        title: t.goodBreakTitle,
        message: t.goodBreakMsg,
        iconName: 'sunny' as const,
        iconColor: '#D97706',
      };
    }

    if (performance === 'good') {
      return {
        title: t.levelUpTitle,
        message: t.levelUpMsg,
        iconName: 'trophy' as const,
        iconColor: '#16A34A',
      };
    }

    if (performance === 'poor') {
      return {
        title: t.practiceTitle,
        message: t.practiceMsg,
        iconName: 'heart-circle' as const,
        iconColor: '#2563EB',
      };
    }

    // Default 'average'
    return {
      title: t.greatJobTitle,
      message: t.greatJobMsg,
      iconName: 'ribbon' as const,
      iconColor: '#0D9488',
    };
  };

  const feedback = getFeedbackContent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderThick,
            },
          ]}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textPrimary, fontSize: typography.title }]}>
                Saving your results...
              </Text>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={[styles.iconCircle, { borderColor: colors.borderThick, backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}>
                <Ionicons
                  name={feedback.iconName}
                  size={64}
                  color={feedback.iconColor}
                />
              </View>

              <Text style={[styles.titleText, { color: colors.textPrimary, fontSize: typography.headline }]}>
                {feedback.title}
              </Text>
              <Text style={[styles.messageText, { color: colors.textSecondary, fontSize: typography.bodyLarge }]}>
                {feedback.message}
              </Text>

              <View style={[styles.statsRow, { backgroundColor: isDarkMode ? '#0F172A' : '#F8F9FA', borderColor: colors.borderThick }]}>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{moves}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.moves}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{errors}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.retries}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{Math.round(timeSeconds)}s</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.time}</Text>
                </View>
              </View>

              <View style={styles.buttonStack}>
                <BigButton
                  label={t.playNext}
                  onPress={onPlayNext}
                  variant="primary"
                  icon={<Ionicons name="play" size={32} color="#FFFFFF" />}
                />
                <BigButton
                  label={t.backToGames}
                  onPress={onGoToMenu}
                  variant="secondary"
                  icon={<Ionicons name="home" size={28} color={colors.textPrimary} />}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    borderWidth: 4,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontWeight: '800',
    marginTop: 20,
    textAlign: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  messageText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  buttonStack: {
    width: '100%',
  },
});
