import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLanguage } from '../i18n/LanguageContext';
import { sessionStore } from '../services/sessionStore';
import { PatientProfile } from '../types/api';
import { BigButton } from '../components/BigButton';
import { AccessibilityBar } from '../components/AccessibilityBar';
import { Ionicons } from '@expo/vector-icons';
import { soundManager } from '../services/audioCue';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, typography, isDarkMode } = useAppTheme();
  const { t, speakTextInLanguage } = useAppLanguage();

  const [patients, setPatients] = useState<PatientProfile[]>(sessionStore.getPatients());
  const [activePatient, setActivePatient] = useState<PatientProfile>(
    sessionStore.getActivePatient()
  );

  // Dynamic user login input states
  const [customName, setCustomName] = useState('');
  const [customId, setCustomId] = useState('');

  useEffect(() => {
    const unsub = sessionStore.subscribe(() => {
      setPatients([...sessionStore.getPatients()]);
      setActivePatient(sessionStore.getActivePatient());
    });
    return unsub;
  }, []);

  const handleSelectPatientCard = (patient: PatientProfile) => {
    soundManager.playTap();
    sessionStore.setActivePatient(patient.id);
    setActivePatient(patient);
    setCustomName(patient.name);
    setCustomId(patient.id);
    speakTextInLanguage(`${patient.name}`);
  };

  const handleLoginAndPlay = () => {
    const nameToUse = customName.trim() || activePatient.name;
    const patient = sessionStore.addOrLoginPatient(nameToUse, customId.trim());
    setActivePatient(patient);
    speakTextInLanguage(`${patient.name}!`);
    navigation.navigate('GameSelect');
  };

  const handleCaregiverAccess = () => {
    soundManager.playTap();
    navigation.navigate('CaregiverDashboard');
  };

  const handleReadAloud = () => {
    speakTextInLanguage(
      `${t.appName}. ${t.typeNameToBegin}`
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Utility / Day-Night switch bar with Language Selector */}
      <AccessibilityBar />

      <View style={styles.container}>
        {/* Caregiver Portal trigger */}
        <View style={styles.subHeaderRow}>
          <View style={styles.appBadge}>
            <Ionicons name="sparkles" size={24} color={colors.primary} />
            <Text style={[styles.appBadgeText, { color: colors.primary }]}>
              {t.appName}
            </Text>
          </View>

          <Pressable
            onPress={handleCaregiverAccess}
            style={({ pressed }) => [
              styles.caregiverBtn,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.borderThick,
              },
              pressed && styles.caregiverBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t.caregiverPortal}
          >
            <Ionicons name="key" size={18} color={colors.textPrimary} />
            <Text style={[styles.caregiverBtnText, { color: colors.textPrimary }]}>
              {t.caregiverPortal}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={styles.headerBlock}>
            <Text style={[styles.mainGreeting, { color: colors.textPrimary, fontSize: typography.headline }]}>
              {t.playerLogin}
            </Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary, fontSize: typography.bodyLarge }]}>
              {t.typeNameToBegin}
            </Text>

            {/* Read Aloud Audio Prompt button */}
            <Pressable
              onPress={handleReadAloud}
              style={({ pressed }) => [
                styles.voiceHelpBtn,
                {
                  backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF',
                  borderColor: colors.primary,
                },
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t.readInstructions}
            >
              <Ionicons name="volume-high" size={24} color={colors.primary} />
              <Text style={[styles.voiceHelpText, { color: colors.primary, fontSize: typography.subtext }]}>
                {t.readInstructions}
              </Text>
            </Pressable>
          </View>

          {/* User Input Login Box */}
          <View
            style={[
              styles.loginInputCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.borderThick,
              },
            ]}
          >
            <Text style={[styles.inputLabel, { color: colors.textPrimary, fontSize: typography.body }]}>
              {t.yourName}
            </Text>
            <TextInput
              value={customName}
              onChangeText={setCustomName}
              placeholder={activePatient.name}
              placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
              style={[
                styles.textInputField,
                {
                  color: colors.textPrimary,
                  backgroundColor: isDarkMode ? '#0F172A' : '#F9FAFB',
                  borderColor: colors.borderThick,
                  fontSize: typography.bodyLarge,
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: typography.subtext, marginTop: 12 }]}>
              {t.patientIdOptional}
            </Text>
            <TextInput
              value={customId}
              onChangeText={setCustomId}
              placeholder={activePatient.id}
              placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
              style={[
                styles.textInputField,
                {
                  color: colors.textPrimary,
                  backgroundColor: isDarkMode ? '#0F172A' : '#F9FAFB',
                  borderColor: colors.borderThick,
                  fontSize: typography.body,
                },
              ]}
            />

            {/* Primary Action Button */}
            <View style={styles.actionContainer}>
              <BigButton
                label={t.loginAndPlay}
                subLabel={`${t.playingAs}: ${customName.trim() || activePatient.name}`}
                variant="primary"
                onPress={handleLoginAndPlay}
                icon={<Ionicons name="play-circle" size={44} color="#FFFFFF" />}
                style={styles.startButton}
              />
            </View>
          </View>

          {/* Or Quick Pick from Saved Profiles */}
          <View style={styles.orSection}>
            <Text style={[styles.orSectionTitle, { color: colors.textSecondary, fontSize: typography.body }]}>
              {t.orQuickPick}
            </Text>
          </View>

          <View style={styles.patientsList}>
            {patients.map((patient) => {
              const isSelected =
                (customName.trim().toLowerCase() === patient.name.toLowerCase()) ||
                (!customName.trim() && patient.id === activePatient.id);

              return (
                <Pressable
                  key={patient.id}
                  onPress={() => handleSelectPatientCard(patient)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${patient.name}, Patient ID ${patient.id}`}
                  style={[
                    styles.patientCard,
                    {
                      backgroundColor: isSelected
                        ? isDarkMode ? '#1E3A8A' : '#EFF6FF'
                        : colors.cardBackground,
                      borderColor: isSelected ? colors.primary : colors.borderThick,
                      borderWidth: isSelected ? 4 : 3,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.avatarBadge,
                      { backgroundColor: patient.avatarColor },
                    ]}
                  >
                    <Ionicons name="person" size={32} color="#FFFFFF" />
                  </View>

                  <View style={styles.patientInfo}>
                    <Text style={[styles.patientName, { color: colors.textPrimary, fontSize: typography.title }]}>
                      {patient.name}
                    </Text>
                    <Text style={[styles.patientIdText, { color: colors.textSecondary }]}>
                      ID: {patient.id}
                    </Text>
                  </View>

                  <View style={styles.selectionIndicator}>
                    {isSelected ? (
                      <View style={[styles.checkedCircle, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={[styles.uncheckedCircle, { borderColor: colors.borderThick }]} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  subHeaderRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBadgeText: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 6,
  },
  caregiverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  caregiverBtnPressed: {
    opacity: 0.8,
  },
  caregiverBtnText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  headerBlock: {
    marginTop: 4,
    marginBottom: 16,
  },
  mainGreeting: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 10,
  },
  voiceHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    marginTop: 6,
  },
  voiceHelpText: {
    fontWeight: '800',
    marginLeft: 8,
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
  },
  loginInputCard: {
    borderRadius: 20,
    borderWidth: 3,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  inputLabel: {
    fontWeight: '800',
    marginBottom: 6,
  },
  textInputField: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    fontWeight: '700',
  },
  actionContainer: {
    marginTop: 18,
  },
  startButton: {
    minHeight: 84,
  },
  orSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  orSectionTitle: {
    fontWeight: '700',
  },
  patientsList: {
    marginBottom: 24,
  },
  patientCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  avatarBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  patientInfo: {
    flex: 1,
    marginLeft: 14,
  },
  patientName: {
    fontWeight: '800',
  },
  patientIdText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  selectionIndicator: {
    marginLeft: 10,
  },
  checkedCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
  },
});
