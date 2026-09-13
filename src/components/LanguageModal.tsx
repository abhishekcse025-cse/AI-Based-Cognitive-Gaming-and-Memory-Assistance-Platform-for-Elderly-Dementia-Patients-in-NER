import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { Ionicons } from '@expo/vector-icons';

export const LanguageModal: React.FC = () => {
  const { colors, typography, isDarkMode } = useAppTheme();
  const {
    currentLanguage,
    changeLanguage,
    isLanguageModalVisible,
    closeLanguageModal,
    t,
  } = useAppLanguage();

  return (
    <Modal
      visible={isLanguageModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeLanguageModal}
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
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.borderThick }]}>
            <View style={styles.headerTitleBlock}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary, fontSize: typography.title }]}>
                🌐 {t.selectLanguage}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary, fontSize: typography.subtext }]}>
                Indian State & International Languages
              </Text>
            </View>
            <Pressable
              onPress={closeLanguageModal}
              style={[
                styles.closeIconBtn,
                { backgroundColor: colors.secondary, borderColor: colors.borderThick },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close language selector"
            >
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Language Options Grid / List */}
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            <Text style={[styles.groupHeading, { color: colors.primary }]}>
              🇮🇳 Indian Regional Languages (राज्यों की भाषाएं)
            </Text>

            <View style={styles.grid}>
              {SUPPORTED_LANGUAGES.filter((l) => l.flag === '🇮🇳').map((lang) => {
                const isSelected = lang.code === currentLanguage.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => changeLanguage(lang.code)}
                    accessibilityRole="button"
                    accessibilityLabel={`${lang.nativeName}, ${lang.name}, ${lang.region}`}
                    style={({ pressed }) => [
                      styles.langCard,
                      {
                        backgroundColor: isSelected
                          ? isDarkMode ? '#1E3A8A' : '#EFF6FF'
                          : isDarkMode ? '#0F172A' : '#F9FAFB',
                        borderColor: isSelected ? colors.primary : colors.borderThick,
                        borderWidth: isSelected ? 4 : 2,
                      },
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <View style={styles.langHeaderRow}>
                      <Text style={styles.flagText}>{lang.flag}</Text>
                      <Text style={[styles.langNativeName, { color: colors.textPrimary, fontSize: 24 }]}>
                        {lang.nativeName}
                      </Text>
                    </View>
                    <Text style={[styles.langEnglishName, { color: colors.textSecondary }]}>
                      {lang.name}
                    </Text>
                    <Text style={[styles.langRegion, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                      {lang.region}
                    </Text>

                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.groupHeading, { color: colors.primary, marginTop: 24 }]}>
              🌍 International Languages
            </Text>

            <View style={styles.grid}>
              {SUPPORTED_LANGUAGES.filter((l) => l.flag !== '🇮🇳').map((lang) => {
                const isSelected = lang.code === currentLanguage.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => changeLanguage(lang.code)}
                    accessibilityRole="button"
                    accessibilityLabel={`${lang.nativeName}, ${lang.name}`}
                    style={({ pressed }) => [
                      styles.langCard,
                      {
                        backgroundColor: isSelected
                          ? isDarkMode ? '#1E3A8A' : '#EFF6FF'
                          : isDarkMode ? '#0F172A' : '#F9FAFB',
                        borderColor: isSelected ? colors.primary : colors.borderThick,
                        borderWidth: isSelected ? 4 : 2,
                      },
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <View style={styles.langHeaderRow}>
                      <Text style={styles.flagText}>{lang.flag}</Text>
                      <Text style={[styles.langNativeName, { color: colors.textPrimary, fontSize: 22 }]}>
                        {lang.nativeName}
                      </Text>
                    </View>
                    <Text style={[styles.langEnglishName, { color: colors.textSecondary }]}>
                      {lang.name}
                    </Text>
                    <Text style={[styles.langRegion, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                      {lang.region}
                    </Text>

                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Close button */}
          <View style={styles.footerRow}>
            <Pressable
              onPress={closeLanguageModal}
              style={[
                styles.doneBtn,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.borderThick,
                },
              ]}
            >
              <Text style={styles.doneBtnText}>DONE / बंद करें</Text>
            </Pressable>
          </View>
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
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 4,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 2,
    marginBottom: 12,
  },
  headerTitleBlock: {
    flex: 1,
  },
  modalTitle: {
    fontWeight: '900',
  },
  modalSubtitle: {
    fontWeight: '600',
    marginTop: 2,
  },
  closeIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  listContainer: {
    maxHeight: 460,
  },
  groupHeading: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  langCard: {
    width: '48%',
    minHeight: 88,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.85,
  },
  langHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 24,
    marginRight: 8,
  },
  langNativeName: {
    fontWeight: '900',
  },
  langEnglishName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  langRegion: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
  },
  footerRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  doneBtn: {
    width: '100%',
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
});
