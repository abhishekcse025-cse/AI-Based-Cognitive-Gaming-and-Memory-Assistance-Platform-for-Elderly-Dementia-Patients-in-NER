import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface VisualFeedbackBadgeProps {
  status: 'correct' | 'incorrect' | 'info';
  message: string;
}

export const VisualFeedbackBadge: React.FC<VisualFeedbackBadgeProps> = ({
  status,
  message,
}) => {
  const isCorrect = status === 'correct';
  const isIncorrect = status === 'incorrect';

  const bgColor = isCorrect
    ? theme.colors.successBg
    : isIncorrect
    ? theme.colors.alertBg
    : '#EFF6FF';

  const borderColor = isCorrect
    ? theme.colors.successBorder
    : isIncorrect
    ? theme.colors.alertBorder
    : theme.colors.primary;

  const textColor = isCorrect
    ? theme.colors.successText
    : isIncorrect
    ? theme.colors.alertText
    : theme.colors.primary;

  const iconName = isCorrect
    ? 'checkmark-circle'
    : isIncorrect
    ? 'close-circle'
    : 'information-circle';

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.iconWrapper}>
        <Ionicons name={iconName} size={36} color={textColor} />
      </View>
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.layout.borderRadius,
    borderWidth: 3,
    marginVertical: 12,
  },
  iconWrapper: {
    marginRight: 14,
  },
  text: {
    fontSize: theme.typography.bodyLarge,
    fontWeight: '800',
    flexShrink: 1,
  },
});
