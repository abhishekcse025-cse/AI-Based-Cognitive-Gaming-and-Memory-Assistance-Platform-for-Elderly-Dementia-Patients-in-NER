import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { soundManager } from '../services/audioCue';

interface BigButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  subLabel?: string;
  accessibilityHint?: string;
}

export const BigButton: React.FC<BigButtonProps> = ({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  subLabel,
  accessibilityHint,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const { colors, typography, layout } = useAppTheme();

  const handlePress = () => {
    if (disabled) return;
    soundManager.playTap();
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return '#6B7280';
    if (isPressed) {
      if (variant === 'primary') return colors.primaryPressed;
      if (variant === 'danger') return colors.dangerBg;
      if (variant === 'success') return colors.successBg;
      return colors.secondary;
    }
    if (variant === 'primary') return colors.primary;
    if (variant === 'danger') return colors.dangerBg;
    if (variant === 'success') return colors.successBg;
    return colors.cardBackground;
  };

  const getTextColor = () => {
    if (disabled) return '#9CA3AF';
    if (variant === 'primary') return colors.primaryText;
    if (variant === 'danger') return colors.dangerText;
    if (variant === 'success') return colors.successText;
    return colors.textPrimary;
  };

  const getBorderColor = () => {
    if (disabled) return '#6B7280';
    if (variant === 'primary') return colors.borderThick;
    if (variant === 'danger') return colors.dangerBorder;
    if (variant === 'success') return colors.successBorder;
    return colors.borderThick;
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${label}${subLabel ? `, ${subLabel}` : ''}`}
      accessibilityHint={accessibilityHint}
      style={[
        styles.buttonBase,
        {
          minHeight: layout.buttonHeight,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          transform: isPressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <View style={styles.textContainer}>
          <Text style={[styles.buttonText, { color: getTextColor(), fontSize: typography.button }, textStyle]}>
            {label}
          </Text>
          {subLabel ? (
            <Text style={[styles.subLabelText, { color: getTextColor(), fontSize: typography.subtext }]}>
              {subLabel}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    minWidth: 64,
    borderRadius: 16,
    borderWidth: 3,
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subLabelText: {
    fontWeight: '600',
    marginTop: 4,
  },
});
