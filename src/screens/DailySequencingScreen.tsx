import React, { useState, useEffect, useRef } from 'react';
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
import { sessionStore } from '../services/sessionStore';
import { submitGameAttempt } from '../api/adaptiveDifficulty';
import { SEQUENCE_CONFIGS } from '../games/dailySequencing/config';
import { SequenceStep } from '../games/dailySequencing/types';
import { HeaderBar } from '../components/HeaderBar';
import { AccessibilityBar } from '../components/AccessibilityBar';
import { BigButton } from '../components/BigButton';
import { GentleFeedbackModal } from '../components/GentleFeedbackModal';
import { soundManager } from '../services/audioCue';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyLevel, PerformanceRating } from '../types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailySequencing'>;

export const DailySequencingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, typography, speakText, isDarkMode } = useAppTheme();
  const activePatient = sessionStore.getActivePatient();
  const currentDiff = activePatient.currentSequenceDifficulty;
  const config = SEQUENCE_CONFIGS[currentDiff];

  // Placed steps in sequence order: array of SequenceStep | null
  const [placedSlots, setPlacedSlots] = useState<(SequenceStep | null)[]>([]);
  // Available pool of steps to pick from
  const [availableSteps, setAvailableSteps] = useState<SequenceStep[]>([]);
  // Verification feedback state
  const [slotCheckResults, setSlotCheckResults] = useState<(boolean | null)[]>([]);
  // Hint highlight step id
  const [hintedStepId, setHintedStepId] = useState<string | null>(null);

  // Metrics
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
    const freshSteps = [...config.steps];
    for (let i = freshSteps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [freshSteps[i], freshSteps[j]] = [freshSteps[j], freshSteps[i]];
    }

    setAvailableSteps(freshSteps);
    setPlacedSlots(new Array(config.stepCount).fill(null));
    setSlotCheckResults(new Array(config.stepCount).fill(null));
    setHintedStepId(null);
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

  // Tap an available item to place into next empty slot
  const handleSelectStep = (step: SequenceStep) => {
    soundManager.playTap();
    setTotalMoves((prev) => prev + 1);
    setHintedStepId(null);

    const firstEmptyIdx = placedSlots.findIndex((s) => s === null);
    if (firstEmptyIdx === -1) return;

    const newPlaced = [...placedSlots];
    newPlaced[firstEmptyIdx] = step;
    setPlacedSlots(newPlaced);

    setAvailableSteps((prev) => prev.filter((s) => s.id !== step.id));
    setSlotCheckResults(new Array(config.stepCount).fill(null));
  };

  // Tap a placed slot to remove it back to available pool
  const handleRemoveFromSlot = (index: number) => {
    const step = placedSlots[index];
    if (!step) return;

    soundManager.playTap();
    const newPlaced = [...placedSlots];
    newPlaced[index] = null;
    setPlacedSlots(newPlaced);

    setAvailableSteps((prev) => [...prev, step]);
    setSlotCheckResults(new Array(config.stepCount).fill(null));
  };

  // Interactive Button: Undo Last Step
  const handleUndoLast = () => {
    // Find last non-null slot
    for (let i = placedSlots.length - 1; i >= 0; i--) {
      if (placedSlots[i] !== null) {
        handleRemoveFromSlot(i);
        break;
      }
    }
  };

  // Interactive Button: Reset All Slots
  const handleResetSlots = () => {
    soundManager.playTap();
    setAvailableSteps([...config.steps]);
    setPlacedSlots(new Array(config.stepCount).fill(null));
    setSlotCheckResults(new Array(config.stepCount).fill(null));
    setHintedStepId(null);
  };

  // Interactive Button: Suggest Next Step (Hint)
  const handleSuggestNext = () => {
    const nextSlotIdx = placedSlots.findIndex((s) => s === null);
    if (nextSlotIdx === -1) {
      speakText('All steps are already placed! Tap Check My Steps to verify.');
      return;
    }

    const targetOrder = nextSlotIdx + 1;
    const targetStep = config.steps.find((s) => s.order === targetOrder);

    if (targetStep) {
      soundManager.playSuccess();
      setHintedStepId(targetStep.id);
      speakText(`Hint for Step ${targetOrder}: Look for ${targetStep.title}.`);
      setTimeout(() => {
        setHintedStepId(null);
      }, 3000);
    }
  };

  // Interactive Button: Read Task Aloud
  const handleReadAloud = () => {
    speakText(
      `Activity: ${config.activityTitle}. ${config.promptText}. Tap each step to arrange them in order.`
    );
  };

  // Check sequence order
  const handleCheckSequence = () => {
    let allCorrect = true;
    const checks: boolean[] = [];

    placedSlots.forEach((step, index) => {
      const targetOrder = index + 1;
      const isCorrect = step !== null && step.order === targetOrder;
      checks.push(isCorrect);
      if (!isCorrect) allCorrect = false;
    });

    setSlotCheckResults(checks);

    if (allCorrect) {
      soundManager.playSuccess();
      speakText('Wonderful! All steps are in perfect order.');
      setTimeout(() => {
        handleGameEnd(true);
      }, 750);
    } else {
      soundManager.playMistake();
      speakText('Some steps need adjusting. Check the marks and try swapping.');
      setErrorsMade((prev) => prev + 1);
    }
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
      game_type: 'sequence' as const,
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

  const allSlotsFilled = placedSlots.every((s) => s !== null);
  const anySlotsFilled = placedSlots.some((s) => s !== null);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <HeaderBar
        title="Daily Steps"
        patientName={activePatient.name}
        onEndGame={() => handleGameEnd(false)}
        endGameLabel="End Game"
      />
      <AccessibilityBar />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Activity Title Banner */}
        <View
          style={[
            styles.activityBanner,
            {
              backgroundColor: isDarkMode ? '#1E3A8A' : '#EEF2FF',
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.activityTitle, { color: colors.primary, fontSize: typography.title }]}>
            {config.activityTitle}
          </Text>
          <Text style={[styles.promptText, { color: colors.textPrimary, fontSize: typography.body }]}>
            {config.promptText}
          </Text>
        </View>

        {/* Action Controls Row (More interactive buttons!) */}
        <View style={styles.controlsRow}>
          <Pressable
            onPress={handleSuggestNext}
            accessibilityRole="button"
            accessibilityLabel="Suggest the next step"
            style={({ pressed }) => [
              styles.controlBtn,
              {
                backgroundColor: isDarkMode ? '#78350F' : '#FEF3C7',
                borderColor: isDarkMode ? '#FDE047' : '#B45309',
              },
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name="bulb" size={20} color={isDarkMode ? '#FDE047' : '#B45309'} />
            <Text style={[styles.controlBtnText, { color: isDarkMode ? '#FFFBEB' : '#78350F' }]}>
              💡 Hint
            </Text>
          </Pressable>

          <Pressable
            onPress={handleUndoLast}
            disabled={!anySlotsFilled}
            accessibilityRole="button"
            accessibilityLabel="Undo the last placed step"
            style={({ pressed }) => [
              styles.controlBtn,
              {
                backgroundColor: anySlotsFilled ? colors.secondary : '#D1D5DB',
                borderColor: colors.borderThick,
              },
              pressed && anySlotsFilled && styles.btnPressed,
            ]}
          >
            <Ionicons name="arrow-undo" size={20} color={colors.textPrimary} />
            <Text style={[styles.controlBtnText, { color: colors.textPrimary }]}>
              ↩️ Undo
            </Text>
          </Pressable>

          <Pressable
            onPress={handleResetSlots}
            disabled={!anySlotsFilled}
            accessibilityRole="button"
            accessibilityLabel="Clear all placed slots"
            style={({ pressed }) => [
              styles.controlBtn,
              {
                backgroundColor: anySlotsFilled ? colors.secondary : '#D1D5DB',
                borderColor: colors.borderThick,
              },
              pressed && anySlotsFilled && styles.btnPressed,
            ]}
          >
            <Ionicons name="refresh" size={20} color={colors.textPrimary} />
            <Text style={[styles.controlBtnText, { color: colors.textPrimary }]}>
              🔄 Reset
            </Text>
          </Pressable>

          <Pressable
            onPress={handleReadAloud}
            accessibilityRole="button"
            accessibilityLabel="Read task description aloud"
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
              🔊 Read
            </Text>
          </Pressable>
        </View>

        {/* Target Sequence Slots (1, 2, 3...) */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary, fontSize: typography.bodyLarge }]}>
            Your Ordered Steps:
          </Text>

          <View style={styles.slotsList}>
            {placedSlots.map((step, index) => {
              const checkResult = slotCheckResults[index];
              const hasCheck = checkResult !== null && checkResult !== undefined;

              return (
                <Pressable
                  key={`slot-${index}`}
                  onPress={() => handleRemoveFromSlot(index)}
                  disabled={!step}
                  accessibilityRole="button"
                  accessibilityLabel={`Step ${index + 1}: ${
                    step ? `${step.title}, tap to remove` : 'Empty slot'
                  }`}
                  style={[
                    styles.slotCard,
                    {
                      backgroundColor: step
                        ? colors.cardBackground
                        : isDarkMode ? '#0F172A' : '#FAFAFA',
                      borderColor: hasCheck
                        ? checkResult
                          ? '#15803D'
                          : '#B45309'
                        : step
                        ? colors.borderThick
                        : '#9CA3AF',
                      borderWidth: hasCheck ? 4 : 3,
                    },
                    !step && styles.slotCardEmpty,
                  ]}
                >
                  <View style={[styles.slotNumberBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.slotNumberText}>{index + 1}</Text>
                  </View>

                  {step ? (
                    <View style={styles.slotContent}>
                      <Ionicons
                        name={step.iconName as any}
                        size={32}
                        color={colors.primary}
                        style={styles.slotIcon}
                      />
                      <View style={styles.slotTextCol}>
                        <Text style={[styles.slotStepTitle, { color: colors.textPrimary, fontSize: typography.body }]}>
                          {step.title}
                        </Text>
                        <Text style={[styles.slotStepDesc, { color: colors.textSecondary, fontSize: typography.subtext }]}>
                          {step.description}
                        </Text>
                      </View>
                      <View style={styles.slotActionCol}>
                        {hasCheck ? (
                          <View
                            style={[
                              styles.resultBadge,
                              checkResult ? styles.resultBadgeCorrect : styles.resultBadgeIncorrect,
                            ]}
                          >
                            <Ionicons
                              name={checkResult ? 'checkmark' : 'close'}
                              size={24}
                              color="#FFFFFF"
                            />
                          </View>
                        ) : (
                          <View style={styles.removeTag}>
                            <Ionicons name="close-circle" size={26} color="#6B7280" />
                          </View>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.slotPlaceholder}>
                      <Text style={[styles.placeholderText, { color: isDarkMode ? '#94A3B8' : '#6B7280', fontSize: typography.subtext }]}>
                        (Tap a card below to place Step {index + 1})
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Primary Action Button: Check Sequence */}
        {allSlotsFilled ? (
          <View style={styles.checkActionContainer}>
            <BigButton
              label="CHECK MY STEPS"
              variant="success"
              onPress={handleCheckSequence}
              icon={<Ionicons name="checkmark-done-circle" size={40} color="#14532D" />}
            />
          </View>
        ) : null}

        {/* Available Choice Cards */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary, fontSize: typography.bodyLarge }]}>
            {availableSteps.length > 0 ? 'Cards to Place:' : 'All cards are placed above!'}
          </Text>

          <View style={styles.choicesList}>
            {availableSteps.map((step) => {
              const isHinted = step.id === hintedStepId;
              return (
                <Pressable
                  key={step.id}
                  onPress={() => handleSelectStep(step)}
                  accessibilityRole="button"
                  accessibilityLabel={`Available step: ${step.title}. Tap to place.`}
                  style={({ pressed }) => [
                    styles.choiceCard,
                    {
                      backgroundColor: isHinted
                        ? isDarkMode ? '#78350F' : '#FEF3C7'
                        : colors.cardBackground,
                      borderColor: isHinted ? '#F59E0B' : colors.borderThick,
                      borderWidth: isHinted ? 4 : 3,
                    },
                    pressed && styles.choiceCardPressed,
                  ]}
                >
                  <View style={[styles.choiceIconBox, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EEF2FF' }]}>
                    <Ionicons name={step.iconName as any} size={36} color={colors.primary} />
                  </View>
                  <View style={styles.choiceDetails}>
                    <Text style={[styles.choiceTitle, { color: colors.textPrimary, fontSize: typography.body }]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.choiceDesc, { color: colors.textSecondary, fontSize: typography.subtext }]}>
                      {step.description}
                    </Text>
                  </View>
                  <View style={styles.tapPrompt}>
                    <Text style={[styles.tapPromptText, { color: colors.primary }]}>TAP</Text>
                    <Ionicons name="add-circle" size={28} color={colors.primary} />
                  </View>
                </Pressable>
              );
            })}
          </View>
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
    paddingBottom: 48,
    alignItems: 'center',
  },
  activityBanner: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 20,
    borderWidth: 3,
    padding: 18,
    marginBottom: 14,
  },
  activityTitle: {
    fontWeight: '900',
  },
  promptText: {
    fontWeight: '700',
    marginTop: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 540,
    gap: 8,
    marginBottom: 16,
  },
  controlBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
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
  sectionBlock: {
    width: '100%',
    maxWidth: 540,
    marginBottom: 20,
  },
  sectionHeader: {
    fontWeight: '800',
    marginBottom: 10,
  },
  slotsList: {
    gap: 12,
  },
  slotCard: {
    minHeight: 76,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  slotCardEmpty: {
    borderStyle: 'dashed',
  },
  slotNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  slotNumberText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  slotContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotIcon: {
    marginRight: 10,
  },
  slotTextCol: {
    flex: 1,
  },
  slotStepTitle: {
    fontWeight: '800',
  },
  slotStepDesc: {
    fontWeight: '600',
    marginTop: 2,
  },
  slotActionCol: {
    marginLeft: 8,
  },
  slotPlaceholder: {
    flex: 1,
  },
  placeholderText: {
    fontWeight: '600',
    fontStyle: 'italic',
  },
  resultBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeCorrect: {
    backgroundColor: '#15803D',
  },
  resultBadgeIncorrect: {
    backgroundColor: '#B45309',
  },
  removeTag: {
    padding: 4,
  },
  checkActionContainer: {
    width: '100%',
    maxWidth: 540,
    marginVertical: 12,
  },
  choicesList: {
    gap: 12,
  },
  choiceCard: {
    minHeight: 76,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  choiceCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  choiceIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  choiceDetails: {
    flex: 1,
  },
  choiceTitle: {
    fontWeight: '800',
  },
  choiceDesc: {
    fontWeight: '600',
    marginTop: 2,
  },
  tapPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  tapPromptText: {
    fontSize: 16,
    fontWeight: '900',
    marginRight: 4,
  },
});
