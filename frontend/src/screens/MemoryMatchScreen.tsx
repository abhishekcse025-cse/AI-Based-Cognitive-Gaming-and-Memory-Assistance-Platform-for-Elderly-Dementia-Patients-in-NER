import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLanguage } from '../i18n/LanguageContext';
import { sessionStore } from '../services/sessionStore';
import { submitGameAttempt } from '../api/adaptiveDifficulty';
import { generateMemoryDeck, MEMORY_CONFIGS } from '../games/memoryMatch/config';
import { MemoryCardItem } from '../games/memoryMatch/types';
import { HeaderBar } from '../components/HeaderBar';
import { AccessibilityBar } from '../components/AccessibilityBar';
import { GentleFeedbackModal } from '../components/GentleFeedbackModal';
import { soundManager } from '../services/audioCue';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyLevel, PerformanceRating } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MemoryMatch'>;

export const MemoryMatchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, typography, isDarkMode } = useAppTheme();
  const { t, speakTextInLanguage } = useAppLanguage();
  const activePatient = sessionStore.getActivePatient();
  const currentDiff = activePatient.currentMemoryDifficulty;

  const [deck, setDeck] = useState<MemoryCardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [isProcessingMatch, setIsProcessingMatch] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  // Attempt tracking metrics
  const [totalMoves, setTotalMoves] = useState(0);
  const [errorsMade, setErrorsMade] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  // Gentle feedback & API state
  const [modalVisible, setModalVisible] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiPerformance, setApiPerformance] = useState<PerformanceRating | null>(null);
  const [nextDiff, setNextDiff] = useState<DifficultyLevel | null>(null);
  const [lastAttemptCompleted, setLastAttemptCompleted] = useState(true);
  const [finalTimeSeconds, setFinalTimeSeconds] = useState(0);

  // Initialize round
  const startNewRound = () => {
    const freshDeck = generateMemoryDeck(currentDiff);
    setDeck(freshDeck);
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setIsProcessingMatch(false);
    setIsPeeking(false);
    setTotalMoves(0);
    setErrorsMade(0);
    startTimeRef.current = Date.now();
    setModalVisible(false);
    setApiPerformance(null);
    setNextDiff(null);
  };

  useEffect(() => {
    startNewRound();
  }, [currentDiff]);

  // Card click handler
  const handleCardPress = (index: number) => {
    if (isProcessingMatch || isPeeking) return;
    if (flippedIndices.includes(index)) return;
    if (matchedPairIds.includes(deck[index].pairId)) return;

    soundManager.playTap();

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setTotalMoves((prev) => prev + 1);
      setIsProcessingMatch(true);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = deck[firstIdx];
      const secondCard = deck[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH!
        setTimeout(() => {
          soundManager.playSuccess();
          const newMatched = [...matchedPairIds, firstCard.pairId];
          setMatchedPairIds(newMatched);
          setFlippedIndices([]);
          setIsProcessingMatch(false);

          // Check if all pairs matched
          const requiredPairs = MEMORY_CONFIGS[currentDiff].numPairs;
          if (newMatched.length === requiredPairs) {
            handleGameEnd(true);
          }
        }, 350);
      } else {
        // NO MATCH
        setErrorsMade((prev) => prev + 1);
        setTimeout(() => {
          soundManager.playMistake();
        }, 150);

        setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessingMatch(false);
        }, 850);
      }
    }
  };

  // Peek Clue / Hint Button
  const handlePeekClue = () => {
    if (isProcessingMatch || isPeeking) return;
    soundManager.playSuccess();
    speakTextInLanguage(t.peekClue);
    setIsPeeking(true);

    setTimeout(() => {
      setIsPeeking(false);
    }, 1400);
  };

  // Read Help
  const handleReadHelp = () => {
    speakTextInLanguage(
      `${t.memoryMatchTitle}. ${t.tapTwoCardsHint}`
    );
  };

  // Submit attempt through API
  const handleGameEnd = async (completed: boolean) => {
    const elapsedSeconds = Math.max(1, (Date.now() - startTimeRef.current) / 1000);
    setFinalTimeSeconds(elapsedSeconds);
    setLastAttemptCompleted(completed);
    setModalVisible(true);
    setIsApiLoading(true);

    if (completed) {
      soundManager.playVictory();
    }

    const payload = {
      patient_id: activePatient.id,
      game_type: 'memory_match' as const,
      current_difficulty: currentDiff,
      total_moves: totalMoves + (completed ? 1 : 0),
      errors_made: errorsMade,
      time_taken_seconds: parseFloat(elapsedSeconds.toFixed(1)),
      completed,
    };

    try {
      const result = await submitGameAttempt(payload);
      setApiPerformance(result.performance);
      setNextDiff(result.next_difficulty);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleNextGame = () => {
    setModalVisible(false);
    startNewRound();
  };

  const handleReturnToMenu = () => {
    setModalVisible(false);
    navigation.navigate('GameSelect');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <HeaderBar
        title={t.memoryMatchTitle}
        patientName={activePatient.name}
        onEndGame={() => handleGameEnd(false)}
        endGameLabel={t.endGame}
      />
      <AccessibilityBar />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status bar */}
        <View style={styles.statusBar}>
          <View style={[styles.statusPill, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
            <Ionicons name="sparkles" size={24} color={colors.primary} />
            <Text style={[styles.statusPillText, { color: colors.textPrimary }]}>
              {t.level}: {currentDiff.toUpperCase()}
            </Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
            <Ionicons name="checkmark-circle" size={24} color="#15803D" />
            <Text style={[styles.statusPillText, { color: colors.textPrimary }]}>
              {t.pairs}: {matchedPairIds.length} / {MEMORY_CONFIGS[currentDiff].numPairs}
            </Text>
          </View>
        </View>

        {/* Action Controls Row */}
        <View style={styles.controlsRow}>
          <Pressable
            onPress={handlePeekClue}
            disabled={isPeeking || isProcessingMatch}
            accessibilityRole="button"
            accessibilityLabel={t.peekClue}
            style={({ pressed }) => [
              styles.controlBtn,
              {
                backgroundColor: isDarkMode ? '#78350F' : '#FEF3C7',
                borderColor: isDarkMode ? '#FDE047' : '#B45309',
              },
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name="eye" size={20} color={isDarkMode ? '#FDE047' : '#B45309'} />
            <Text style={[styles.controlBtnText, { color: isDarkMode ? '#FFFBEB' : '#78350F' }]}>
              {t.peekClue}
            </Text>
          </Pressable>

          <Pressable
            onPress={startNewRound}
            accessibilityRole="button"
            accessibilityLabel={t.newCards}
            style={({ pressed }) => [
              styles.controlBtn,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.borderThick,
              },
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name="refresh" size={20} color={colors.textPrimary} />
            <Text style={[styles.controlBtnText, { color: colors.textPrimary }]}>
              {t.newCards}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleReadHelp}
            accessibilityRole="button"
            accessibilityLabel={t.guide}
            style={({ pressed }) => [
              styles.controlBtn,
              {
                backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF',
                borderColor: colors.primary,
              },
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name="volume-high" size={20} color={colors.primary} />
            <Text style={[styles.controlBtnText, { color: colors.primary }]}>
              {t.guide}
            </Text>
          </Pressable>
        </View>

        {/* Cards Grid */}
        <View style={styles.cardGrid}>
          {deck.map((card, index) => {
            const isFlipped =
              isPeeking ||
              flippedIndices.includes(index) ||
              matchedPairIds.includes(card.pairId);
            const isMatched = matchedPairIds.includes(card.pairId);

            return (
              <Pressable
                key={card.id}
                onPress={() => handleCardPress(index)}
                disabled={isMatched || isProcessingMatch || isPeeking}
                accessibilityRole="button"
                accessibilityLabel={
                  isFlipped
                    ? `${card.title}, ${isMatched ? 'matched' : 'open'}`
                    : `Card ${index + 1}`
                }
                style={[
                  styles.cardBase,
                  {
                    borderColor: isMatched
                      ? '#15803D'
                      : colors.borderThick,
                    borderWidth: isMatched ? 4 : 3,
                  },
                  isFlipped ? styles.cardOpen : styles.cardClosed,
                ]}
              >
                {isFlipped ? (
                  <View
                    style={[
                      styles.cardContent,
                      { backgroundColor: card.color },
                    ]}
                  >
                    <Ionicons
                      name={card.iconName as any}
                      size={54}
                      color={card.textColor}
                    />
                    <Text
                      style={[styles.cardTitle, { color: card.textColor }]}
                      numberOfLines={1}
                    >
                      {card.title}
                    </Text>
                    {isMatched && (
                      <View style={styles.matchBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={[styles.cardBack, { backgroundColor: isDarkMode ? '#020617' : '#1E293B' }]}>
                    <Ionicons name="help" size={54} color="#FFFFFF" />
                    <Text style={styles.cardBackPrompt}>TAP</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Tactile hint prompt */}
        <View
          style={[
            styles.hintContainer,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6',
              borderColor: colors.borderThick,
            },
          ]}
        >
          <Text style={[styles.hintText, { color: colors.textPrimary, fontSize: typography.body }]}>
            {t.tapTwoCardsHint}
          </Text>
        </View>
      </ScrollView>

      {/* Gentle feedback modal */}
      <GentleFeedbackModal
        visible={modalVisible}
        isLoading={isApiLoading}
        performance={apiPerformance}
        nextDifficulty={nextDiff}
        completed={lastAttemptCompleted}
        moves={totalMoves}
        errors={errorsMade}
        timeSeconds={finalTimeSeconds}
        onPlayNext={handleNextGame}
        onGoToMenu={handleReturnToMenu}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 500,
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
  },
  statusPillText: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 500,
    gap: 8,
    marginBottom: 16,
  },
  controlBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  controlBtnText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 4,
  },
  btnPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 520,
    gap: 16,
  },
  cardBase: {
    width: 140,
    height: 155,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  cardClosed: {},
  cardOpen: {},
  cardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackPrompt: {
    fontSize: 18,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  matchBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#15803D',
    borderRadius: 12,
  },
  hintContainer: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
  },
  hintText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
