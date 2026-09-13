// Theme and Design Tokens for Cognitive Care Companion
// Tailored for elderly users (65-85) with reduced vision, motor control, or dementia.
// Supports high-contrast Day Mode and Night Mode.

export const lightColors = {
  background: '#F5F5F0',
  cardBackground: '#FFFFFF',
  cardDarkBackground: '#111827',
  
  textPrimary: '#1A1A1A',
  textSecondary: '#2B2B2B',
  textOnDark: '#FFFFFF',

  primary: '#1E40AF',
  primaryPressed: '#172554',
  primaryText: '#FFFFFF',

  secondary: '#E5E7EB',
  secondaryBorder: '#1A1A1A',
  secondaryText: '#1A1A1A',

  successBg: '#DCFCE7',
  successBorder: '#15803D',
  successText: '#14532D',

  alertBg: '#FEF3C7',
  alertBorder: '#B45309',
  alertText: '#78350F',

  dangerBg: '#FEE2E2',
  dangerBorder: '#B91C1C',
  dangerText: '#7F1D1D',

  borderThick: '#1A1A1A',
  borderMedium: '#4B5563',
  cardBorder: '#1A1A1A',
  focusHighlight: '#FACC15',
  cardFaceDown: '#1E293B',
};

export const darkColors = {
  background: '#0F172A',
  cardBackground: '#1E293B',
  cardDarkBackground: '#0B0F19',
  
  textPrimary: '#F9FAFB',
  textSecondary: '#E2E8F0',
  textOnDark: '#FFFFFF',

  primary: '#3B82F6',
  primaryPressed: '#2563EB',
  primaryText: '#FFFFFF',

  secondary: '#334155',
  secondaryBorder: '#FFFFFF',
  secondaryText: '#F8FAFC',

  successBg: '#064E3B',
  successBorder: '#34D399',
  successText: '#ECFDF5',

  alertBg: '#78350F',
  alertBorder: '#FBBF24',
  alertText: '#FFFBEB',

  dangerBg: '#7F1D1D',
  dangerBorder: '#F87171',
  dangerText: '#FEF2F2',

  borderThick: '#FFFFFF',
  borderMedium: '#94A3B8',
  cardBorder: '#FFFFFF',
  focusHighlight: '#FACC15',
  cardFaceDown: '#030712',
};

export const baseTypography = {
  headline: 34,
  title: 28,
  bodyLarge: 24,
  body: 20,
  button: 26,
  subtext: 18,
};

export const baseLayout = {
  minTapTarget: 64, // 64dp absolute minimum tap target
  buttonHeight: 76,  // Large "TV remote" button size
  cardMinHeight: 90,
  borderRadius: 16,
  borderWidth: 3,
  transitionMs: 350, // Slow, gentle transitions (300-400ms)
  spacingSm: 12,
  spacingMd: 20,
  spacingLg: 32,
};

// Default export for backwards compatibility
export const theme = {
  colors: lightColors,
  typography: baseTypography,
  layout: baseLayout,
};
