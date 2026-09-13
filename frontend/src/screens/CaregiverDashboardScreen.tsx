import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAppTheme } from '../theme/ThemeContext';
import { sessionStore } from '../services/sessionStore';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  isUsingMockApi,
  setUseMockApi,
} from '../config/env';
import { GameSessionRecord, QueuedAttempt, PatientProfile } from '../types/api';
import { retryQueuedAttempt, submitGameAttempt } from '../api/adaptiveDifficulty';
import { Ionicons } from '@expo/vector-icons';
import { soundManager } from '../services/audioCue';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CaregiverDashboard'>;

export const CaregiverDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDarkMode, toggleTheme } = useAppTheme();

  // State
  const [patients, setPatients] = useState<PatientProfile[]>(sessionStore.getPatients());
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    sessionStore.getActivePatient().id
  );
  const [sessions, setSessions] = useState<GameSessionRecord[]>([]);
  const [queue, setQueue] = useState<QueuedAttempt[]>([]);

  // Config editing state
  const [useMock, setUseMockState] = useState<boolean>(isUsingMockApi());
  const [apiUrl, setApiUrlState] = useState<string>(getApiBaseUrl());
  const [isRetryingSync, setIsRetryingSync] = useState(false);

  // Sync state from store
  const refreshData = () => {
    setPatients([...sessionStore.getPatients()]);
    setSessions(sessionStore.getSessions(selectedPatientId));
    setQueue([...sessionStore.getQueue()]);
  };

  useEffect(() => {
    refreshData();
    const unsub = sessionStore.subscribe(() => {
      refreshData();
    });
    return unsub;
  }, [selectedPatientId]);

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleToggleMock = () => {
    soundManager.playTap();
    const nextVal = !useMock;
    setUseMockApi(nextVal);
    setUseMockState(nextVal);
  };

  const handleSaveApiUrl = () => {
    soundManager.playSuccess();
    setApiBaseUrl(apiUrl);
    Alert.alert('Configuration Saved', `API Base URL set to: ${apiUrl}`);
  };

  const handleRetryQueueItem = async (item: QueuedAttempt) => {
    setIsRetryingSync(true);
    const success = await retryQueuedAttempt(item.id, item.payload);
    setIsRetryingSync(false);
    if (success) {
      soundManager.playSuccess();
      Alert.alert('Sync Succeeded', 'Queued attempt synced with backend!');
    } else {
      soundManager.playMistake();
      Alert.alert('Sync Failed', 'Could not reach backend at ' + apiUrl);
    }
  };

  // Interactive Button: Simulate a test session directly from the dashboard!
  const handleSimulateAttempt = async (perf: 'good' | 'average' | 'poor') => {
    soundManager.playTap();
    const isMemory = Math.random() > 0.5;
    const testMoves = perf === 'good' ? 4 : perf === 'average' ? 8 : 14;
    const testErrors = perf === 'good' ? 0 : perf === 'average' ? 2 : 5;

    await submitGameAttempt({
      patient_id: selectedPatient.id,
      game_type: isMemory ? 'memory_match' : 'sequence',
      current_difficulty: isMemory
        ? selectedPatient.currentMemoryDifficulty
        : selectedPatient.currentSequenceDifficulty,
      total_moves: testMoves,
      errors_made: testErrors,
      time_taken_seconds: 22.0,
      completed: true,
    });
  };

  // Metrics summary
  const totalSessions = sessions.length;
  const completedCount = sessions.filter((s) => s.completed).length;
  const completionRate =
    totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const avgMoves =
    totalSessions > 0
      ? (
          sessions.reduce((acc, s) => acc + s.total_moves, 0) / totalSessions
        ).toFixed(1)
      : '0';
  const avgErrors =
    totalSessions > 0
      ? (
          sessions.reduce((acc, s) => acc + s.errors_made, 0) / totalSessions
        ).toFixed(1)
      : '0';

  const chartSessions = [...sessions].reverse().slice(-8);

  const diffToNumeric = (d: string) => {
    if (d === 'easy') return 1;
    if (d === 'medium') return 2;
    return 3;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Caregiver Top Header with Day/Night Switch */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderThick }]}>
        <Pressable
          onPress={() => {
            soundManager.playTap();
            navigation.navigate('Login');
          }}
          style={[styles.backBtn, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={[styles.backBtnText, { color: colors.primary }]}>Exit to App</Text>
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Caregiver Portal
        </Text>

        <Pressable
          onPress={toggleTheme}
          style={[
            styles.dayNightBtn,
            {
              backgroundColor: isDarkMode ? '#334155' : '#FEF3C7',
              borderColor: isDarkMode ? '#94A3B8' : '#D97706',
            },
          ]}
        >
          <Ionicons
            name={isDarkMode ? 'sunny' : 'moon'}
            size={18}
            color={isDarkMode ? '#FDE047' : '#B45309'}
          />
          <Text style={[styles.dayNightText, { color: isDarkMode ? '#FFF' : '#78350F' }]}>
            {isDarkMode ? 'Night' : 'Day'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Switcher */}
        <View style={styles.patientTabsRow}>
          {patients.map((p) => {
            const isSelected = p.id === selectedPatientId;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  soundManager.playTap();
                  setSelectedPatientId(p.id);
                }}
                style={[
                  styles.patientTab,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.secondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.patientTabText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {p.name} ({p.id})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Patient Status Overview Card */}
        <View style={[styles.overviewCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
          <View style={styles.patientHeader}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: selectedPatient?.avatarColor || colors.primary },
              ]}
            >
              <Ionicons name="person" size={24} color="#FFF" />
            </View>
            <View style={styles.patientTitleBlock}>
              <Text style={[styles.overviewPatientName, { color: colors.textPrimary }]}>
                {selectedPatient?.name} (Age {selectedPatient?.age})
              </Text>
              <Text style={[styles.overviewPatientSub, { color: colors.textSecondary }]}>
                ID: {selectedPatient?.id} • Cognitive Routine Active
              </Text>
            </View>
          </View>

          <View style={styles.difficultyBadgesRow}>
            <View style={[styles.levelCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: isDarkMode ? '#475569' : '#E2E8F0' }]}>
              <Text style={[styles.levelLabel, { color: colors.textSecondary }]}>Memory Level</Text>
              <Text style={[styles.levelValue, { color: colors.textPrimary }]}>
                {selectedPatient?.currentMemoryDifficulty?.toUpperCase() || 'EASY'}
              </Text>
            </View>
            <View style={[styles.levelCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: isDarkMode ? '#475569' : '#E2E8F0' }]}>
              <Text style={[styles.levelLabel, { color: colors.textSecondary }]}>Daily Steps Level</Text>
              <Text style={[styles.levelValue, { color: colors.textPrimary }]}>
                {selectedPatient?.currentSequenceDifficulty?.toUpperCase() || 'EASY'}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
            <Text style={[styles.metricNumber, { color: colors.primary }]}>{totalSessions}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Sessions</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
            <Text style={[styles.metricNumber, { color: colors.primary }]}>{completionRate}%</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Completion</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
            <Text style={[styles.metricNumber, { color: colors.primary }]}>{avgMoves}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Avg Moves</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
            <Text style={[styles.metricNumber, { color: colors.primary }]}>{avgErrors}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Avg Errors</Text>
          </View>
        </View>

        {/* Quick Simulation Row (Interactive Feature) */}
        <View style={[styles.simulationPanel, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
          <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
            ⚡ Quick Test Actions (Add Simulated Session):
          </Text>
          <View style={styles.simButtonsRow}>
            <Pressable
              onPress={() => handleSimulateAttempt('good')}
              style={[styles.simBtn, { backgroundColor: '#DCFCE7', borderColor: '#15803D' }]}
            >
              <Text style={[styles.simBtnText, { color: '#14532D' }]}>+ High Score (Level Up)</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSimulateAttempt('poor')}
              style={[styles.simBtn, { backgroundColor: '#FEE2E2', borderColor: '#B91C1C' }]}
            >
              <Text style={[styles.simBtnText, { color: '#7F1D1D' }]}>+ High Errors (Level Down)</Text>
            </Pressable>
          </View>
        </View>

        {/* Difficulty Progression Chart */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Difficulty Progression
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
              Last {chartSessions.length} Sessions
            </Text>
          </View>

          <View style={[styles.chartCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
            {chartSessions.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No session data recorded yet.
              </Text>
            ) : (
              <View>
                <View style={[styles.chartBarsContainer, { borderBottomColor: colors.borderThick }]}>
                  {chartSessions.map((item, idx) => {
                    const levelNum = diffToNumeric(item.difficulty);
                    const heightPct = levelNum === 1 ? '35%' : levelNum === 2 ? '65%' : '100%';
                    const barColor =
                      levelNum === 1
                        ? '#10B981'
                        : levelNum === 2
                        ? '#F59E0B'
                        : '#EF4444';

                    return (
                      <View key={item.id} style={styles.chartColumn}>
                        <View style={[styles.barTrack, { backgroundColor: isDarkMode ? '#0F172A' : '#F3F4F6' }]}>
                          <View
                            style={[
                              styles.barFill,
                              { height: heightPct, backgroundColor: barColor },
                            ]}
                          />
                        </View>
                        <Text style={[styles.chartBarLabel, { color: colors.textPrimary }]}>#{idx + 1}</Text>
                        <Text style={[styles.chartTypeLabel, { color: colors.textSecondary }]}>
                          {item.game_type === 'memory_match' ? 'Mem' : 'Seq'}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Legend */}
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={[styles.legendText, { color: colors.textPrimary }]}>Easy</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={[styles.legendText, { color: colors.textPrimary }]}>Medium</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={[styles.legendText, { color: colors.textPrimary }]}>Hard</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Past Sessions List */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Session History</Text>
          {sessions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No recorded games for this patient.
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {sessions.map((sess) => (
                <View key={sess.id} style={[styles.sessionItemCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
                  <View style={styles.sessionHeaderRow}>
                    <View style={styles.sessionTypeBadge}>
                      <Ionicons
                        name={sess.game_type === 'memory_match' ? 'grid' : 'list'}
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={[styles.sessionTypeText, { color: colors.textPrimary }]}>
                        {sess.game_type === 'memory_match'
                          ? 'Memory Match'
                          : 'Daily Sequencing'}
                      </Text>
                    </View>

                    <Text style={[styles.sessionDateText, { color: colors.textSecondary }]}>
                      {new Date(sess.timestamp).toLocaleDateString()}{' '}
                      {new Date(sess.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View style={[styles.sessionStatsRow, { backgroundColor: isDarkMode ? '#0F172A' : '#F9FAFB' }]}>
                    <View style={styles.sessionStatCol}>
                      <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Difficulty</Text>
                      <Text style={[styles.subStatVal, { color: colors.textPrimary }]}>
                        {sess.difficulty.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.sessionStatCol}>
                      <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Status</Text>
                      <Text
                        style={[
                          styles.subStatVal,
                          { color: sess.completed ? '#15803D' : '#B91C1C' },
                        ]}
                      >
                        {sess.completed ? 'Completed ✓' : 'Stopped ✗'}
                      </Text>
                    </View>
                    <View style={styles.sessionStatCol}>
                      <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Moves / Errors</Text>
                      <Text style={[styles.subStatVal, { color: colors.textPrimary }]}>
                        {sess.total_moves} / {sess.errors_made}
                      </Text>
                    </View>
                    <View style={styles.sessionStatCol}>
                      <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Next Level</Text>
                      <Text style={[styles.subStatVal, { color: colors.textPrimary }]}>
                        {sess.next_difficulty.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Offline Attempt Queue Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Offline Queue</Text>
            <View style={styles.queueCountBadge}>
              <Text style={styles.queueCountText}>{queue.length} pending</Text>
            </View>
          </View>

          {queue.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
              <Ionicons name="cloud-done" size={24} color="#15803D" />
              <Text style={[styles.emptyText, { color: colors.textPrimary, marginLeft: 8 }]}>
                All attempts are synced to the backend service.
              </Text>
            </View>
          ) : (
            <View style={styles.queueList}>
              {queue.map((item) => (
                <View key={item.id} style={[styles.queueItemCard, { backgroundColor: colors.cardBackground }]}>
                  <View style={styles.queueItemInfo}>
                    <Text style={[styles.queueItemTitle, { color: colors.textPrimary }]}>
                      {item.payload.game_type} • {item.payload.current_difficulty}
                    </Text>
                    <Text style={styles.queueItemReason}>
                      Reason: {item.lastError || 'Network offline'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRetryQueueItem(item)}
                    disabled={isRetryingSync}
                    style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.retryBtnText}>Retry Sync</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Backend Configuration Panel */}
        <View style={[styles.configContainer, { backgroundColor: colors.cardBackground, borderColor: colors.borderThick }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Backend Integration Settings
          </Text>
          <Text style={[styles.configHint, { color: colors.textSecondary }]}>
            Easily swap between the local Mock API and your live FastAPI backend.
          </Text>

          <View style={styles.mockToggleRow}>
            <View style={styles.mockToggleTextCol}>
              <Text style={[styles.mockToggleTitle, { color: colors.textPrimary }]}>Use Mock API</Text>
              <Text style={[styles.mockToggleSubtitle, { color: colors.textSecondary }]}>
                {useMock
                  ? 'Active: Returning local adaptive calculations'
                  : 'Inactive: Sending real POST requests to backend'}
              </Text>
            </View>
            <Pressable
              onPress={handleToggleMock}
              style={[
                styles.toggleSwitch,
                useMock ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  useMock ? styles.thumbOn : styles.thumbOff,
                ]}
              />
            </Pressable>
          </View>

          <View style={styles.urlInputRow}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>API Base URL (FastAPI):</Text>
            <View style={styles.inputGroup}>
              <TextInput
                value={apiUrl}
                onChangeText={setApiUrlState}
                placeholder="http://localhost:8000"
                placeholderTextColor="#9CA3AF"
                style={[styles.urlInput, { backgroundColor: isDarkMode ? '#0F172A' : '#F9FAFB', color: colors.textPrimary, borderColor: colors.borderThick }]}
                autoCapitalize="none"
              />
              <Pressable onPress={handleSaveApiUrl} style={[styles.saveUrlBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.saveUrlBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 64,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  dayNightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  dayNightText: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  patientTabsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  patientTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  patientTabText: {
    fontSize: 14,
    fontWeight: '800',
  },
  overviewCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientTitleBlock: {
    marginLeft: 12,
  },
  overviewPatientName: {
    fontSize: 18,
    fontWeight: '800',
  },
  overviewPatientSub: {
    fontSize: 13,
    marginTop: 2,
  },
  difficultyBadgesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  levelCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  levelValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  simulationPanel: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  simBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  simBtnText: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  chartSubtitle: {
    fontSize: 12,
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  chartColumn: {
    alignItems: 'center',
    width: 32,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: 80,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  chartBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  chartTypeLabel: {
    fontSize: 9,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyList: {
    gap: 10,
  },
  sessionItemCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionTypeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sessionDateText: {
    fontSize: 12,
  },
  sessionStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 8,
  },
  sessionStatCol: {
    alignItems: 'center',
  },
  subStatLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  subStatVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  queueCountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  queueCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  queueList: {
    gap: 8,
  },
  queueItemCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueItemInfo: {
    flex: 1,
  },
  queueItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  queueItemReason: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  retryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  configContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginTop: 6,
  },
  configHint: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  mockToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  mockToggleTextCol: {
    flex: 1,
  },
  mockToggleTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  mockToggleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#10B981',
  },
  toggleOff: {
    backgroundColor: '#6B7280',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
  urlInputRow: {},
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  saveUrlBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveUrlBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
