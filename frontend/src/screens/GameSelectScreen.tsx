import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLanguage } from '../i18n/LanguageContext';
import { sessionStore } from '../services/sessionStore';
import { HeaderBar } from '../components/HeaderBar';
import { AccessibilityBar } from '../components/AccessibilityBar';
import { Ionicons } from '@expo/vector-icons';
import { soundManager } from '../services/audioCue';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GameSelect'>;

export const GameSelectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, typography, isDarkMode } = useAppTheme();
  const { t, speakTextInLanguage } = useAppLanguage();
  const [patient, setPatient] = useState(sessionStore.getActivePatient());

  useEffect(() => {
    const unsub = sessionStore.subscribe(() => {
      setPatient(sessionStore.getActivePatient());
    });
    return unsub;
  }, []);

  const handleLaunchMemory = () => {
    soundManager.playTap();
    navigation.navigate('MemoryMatch');
  };

  const handleLaunchSequence = () => {
    soundManager.playTap();
    navigation.navigate('DailySequencing');
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleReadAloud = () => {
    speakTextInLanguage(
      `${t.chooseGame}. ${t.tapToStartPlaying}. 1: ${t.memoryMatchTitle}. 2: ${t.dailyStepsTitle}.`
    );
  };

  const getDifficultyBadge = (level: string) => {
    let color = '#047857';
    let bg = '#DCFCE7';
    if (level === 'medium') {
      color = '#B45309';
      bg = '#FEF3C7';
    } else if (level === 'hard') {
      color = '#B91C1C';
      bg = '#FEE2E2';
    }
    return { color, bg, label: level.toUpperCase() };
  };

  const memBadge = getDifficultyBadge(patient.currentMemoryDifficulty);
  const seqBadge = getDifficultyBadge(patient.currentSequenceDifficulty);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <HeaderBar
        title={t.chooseGame}
        patientName={patient.name}
        onBack={handleBackToLogin}
      />
      <AccessibilityBar />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionBox}>
          <Text style={[styles.heading, { color: colors.textPrimary, fontSize: typography.headline }]}>
            {t.chooseGame}
          </Text>
          <Text style={[styles.subtext, { color: colors.textSecondary, fontSize: typography.bodyLarge }]}>
            {t.tapToStartPlaying}
          </Text>

          <Pressable
            onPress={handleReadAloud}
            style={({ pressed }) => [
              styles.readAloudBtn,
              {
                backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF',
                borderColor: colors.primary,
              },
              pressed && styles.cardPressed,
            ]}
          >
            <Ionicons name="volume-high" size={22} color={colors.primary} />
            <Text style={[styles.readAloudText, { color: colors.primary }]}>
              {t.read}
            </Text>
          </Pressable>
        </View>

        {/* Game 1: Memory Match Card */}
        <Pressable
          onPress={handleLaunchMemory}
          accessibilityRole="button"
          accessibilityLabel={`${t.memoryMatchTitle}, ${patient.currentMemoryDifficulty}`}
          style={({ pressed }) => [
            styles.gameCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderThick,
            },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={[styles.gameIconBox, { backgroundColor: isDarkMode ? '#1E3A8A' : '#DBEAFE', borderColor: colors.borderThick }]}>
            <Ionicons name="grid" size={48} color={colors.primary} />
          </View>
          <View style={styles.gameDetails}>
            <View style={styles.titleBadgeRow}>
              <Text style={[styles.gameTitle, { color: colors.textPrimary, fontSize: typography.title }]}>
                {t.memoryMatchTitle}
              </Text>
              <View style={[styles.diffBadge, { backgroundColor: memBadge.bg }]}>
                <Text style={[styles.diffText, { color: memBadge.color }]}>
                  {memBadge.label}
                </Text>
              </View>
            </View>
            <Text style={[styles.gameDescription, { color: colors.textSecondary, fontSize: typography.body }]}>
              {t.memoryMatchDesc}
            </Text>
            <View
              style={[
                styles.playNowPrompt,
                {
                  backgroundColor: isDarkMode ? '#1E3A8A' : '#EEF2FF',
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.playNowText, { color: colors.primary, fontSize: typography.bodyLarge }]}>
                {t.tapToPlay}
              </Text>
              <Ionicons name="arrow-forward-circle" size={32} color={colors.primary} />
            </View>
          </View>
        </Pressable>

        {/* Game 2: Daily Sequencing Card */}
        <Pressable
          onPress={handleLaunchSequence}
          accessibilityRole="button"
          accessibilityLabel={`${t.dailyStepsTitle}, ${patient.currentSequenceDifficulty}`}
          style={({ pressed }) => [
            styles.gameCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderThick,
            },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={[styles.gameIconBox, { backgroundColor: isDarkMode ? '#78350F' : '#FEF3C7', borderColor: colors.borderThick }]}>
            <Ionicons name="list" size={48} color={isDarkMode ? '#FDE047' : '#B45309'} />
          </View>
          <View style={styles.gameDetails}>
            <View style={styles.titleBadgeRow}>
              <Text style={[styles.gameTitle, { color: colors.textPrimary, fontSize: typography.title }]}>
                {t.dailyStepsTitle}
              </Text>
              <View style={[styles.diffBadge, { backgroundColor: seqBadge.bg }]}>
                <Text style={[styles.diffText, { color: seqBadge.color }]}>
                  {seqBadge.label}
                </Text>
              </View>
            </View>
            <Text style={[styles.gameDescription, { color: colors.textSecondary, fontSize: typography.body }]}>
              {t.dailyStepsDesc}
            </Text>
            <View
              style={[
                styles.playNowPrompt,
                {
                  backgroundColor: isDarkMode ? '#1E3A8A' : '#EEF2FF',
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.playNowText, { color: colors.primary, fontSize: typography.bodyLarge }]}>
                {t.tapToPlay}
              </Text>
              <Ionicons name="arrow-forward-circle" size={32} color={colors.primary} />
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  instructionBox: {
    marginBottom: 20,
    marginTop: 6,
  },
  heading: {
    fontWeight: '900',
  },
  subtext: {
    fontWeight: '600',
    marginTop: 6,
  },
  readAloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 10,
  },
  readAloudText: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 6,
  },
  gameCard: {
    borderRadius: 24,
    borderWidth: 3,
    padding: 20,
    marginBottom: 24,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.85,
  },
  gameIconBox: {
    width: 76,
    height: 76,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gameDetails: {
    width: '100%',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTitle: {
    fontWeight: '900',
  },
  diffBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  diffText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  gameDescription: {
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 16,
  },
  playNowPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  playNowText: {
    fontWeight: '800',
  },
});
