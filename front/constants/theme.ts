/**
 * Design System - Theme Constants
 * WorkHQ - Joyful, Friendly, Soft UI Theme
 */

// Global Spacing Tokens (CRITICAL - Use these everywhere!)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Global Border Radius Tokens (CRITICAL - Soft, rounded aesthetic)
export const radius = {
  sm: 8,    // Small elements like tags
  md: 16,   // Default for cards, inputs, modals
  lg: 24,   // Large containers
  xl: 32,   // Extra large
  full: 999, // Pill-shaped buttons
};

// Joyful Tonal Palettes - Warm, Vibrant, Optimistic
export const TonalPalettes = {
  // Primary: Warm Coral - Friendly and inviting
  primary: {
    0: '#000000',
    10: '#3D0D00',
    20: '#621A00',
    30: '#8C2600',
    40: '#B83500',
    50: '#E54600',
    60: '#FF6B3D',
    70: '#FF9166',
    80: '#FFB598',
    90: '#FFD9C9',
    95: '#FFEDE6',
    99: '#FFFBFA',
    100: '#FFFFFF',
  },
  // Secondary: Sunny Amber - Warm and energetic
  secondary: {
    0: '#000000',
    10: '#2D1B00',
    20: '#4A2F00',
    30: '#684500',
    40: '#8A5C00',
    50: '#B07500',
    60: '#D68F00',
    70: '#FAAB00',
    80: '#FFC947',
    90: '#FFE392',
    95: '#FFF2C7',
    99: '#FFFBF0',
    100: '#FFFFFF',
  },
  // Tertiary: Soft Lavender - Gentle and calming
  tertiary: {
    0: '#000000',
    10: '#1F1147',
    20: '#352666',
    30: '#4D3C86',
    40: '#6654A1',
    50: '#806DBD',
    60: '#9B87D9',
    70: '#B7A3F5',
    80: '#D4C5FF',
    90: '#EADDFF',
    95: '#F6EDFF',
    99: '#FFFBFF',
    100: '#FFFFFF',
  },
  // Neutral: Warm Soft Grey - Comfortable, not sterile
  neutral: {
    0: '#000000',
    10: '#1F1B16',
    15: '#2A2620', // Added for dark mode backgrounds
    20: '#34302A',
    25: '#3F3B35', // Added for dark mode borders
    30: '#4B4640',
    40: '#635D56',
    50: '#7C766F',
    60: '#968F88',
    70: '#B1AAA2',
    80: '#CCC5BD',
    85: '#D7D0C8', // Added for light mode borders
    90: '#E9E1D9',
    92: '#EEE7DF', // Added for light mode borders
    95: '#F7F0E7',
    99: '#FFFBF7',
    100: '#FFFFFF',
  },
  // Error: Clear Red - Not harsh, but clear
  error: {
    0: '#000000',
    10: '#410001',
    20: '#680003',
    30: '#930006',
    40: '#BA1B1B',
    50: '#DD3730',
    60: '#FF5449',
    70: '#FF897A',
    80: '#FFB4A9',
    90: '#FFDAD4',
    95: '#FFEDE9',
    99: '#FFFBFF',
    100: '#FFFFFF',
  },
  // Success: Fresh Green - Optimistic growth
  success: {
    0: '#000000',
    10: '#002204',
    20: '#00390A',
    30: '#005313',
    40: '#006E1C',
    50: '#008A26',
    60: '#22A846',
    70: '#4BC668',
    80: '#6FE485',
    90: '#8DFFA3',
    95: '#C6FFCB',
    99: '#F5FFF6',
    100: '#FFFFFF',
  },
  // Warning: Bright Orange - Attention without alarm
  warning: {
    0: '#000000',
    10: '#2D1600',
    20: '#4A2800',
    30: '#683C00',
    40: '#895100',
    50: '#AB6800',
    60: '#CF8000',
    70: '#F49A00',
    80: '#FFB945',
    90: '#FFD88E',
    95: '#FFEDC4',
    99: '#FFFBF7',
    100: '#FFFFFF',
  },
};

// Semantic Color Mappings - Light Mode (Joyful & Bright)
const lightModeColors = {
  // Primary - Warm Coral
  primary: TonalPalettes.primary[50],
  primaryContainer: TonalPalettes.primary[95],
  onPrimary: TonalPalettes.primary[100],
  onPrimaryContainer: TonalPalettes.primary[10],
  
  // Backgrounds - Warm and soft
  background: TonalPalettes.neutral[99],
  backgroundSecondary: TonalPalettes.neutral[95],
  backgroundTertiary: TonalPalettes.neutral[90],
  onBackground: TonalPalettes.neutral[30], // Softer, not pure black
  
  // Surface (Cards, Containers)
  surface: TonalPalettes.neutral[100],
  surfaceVariant: TonalPalettes.neutral[95],
  onSurface: TonalPalettes.neutral[30],
  onSurfaceVariant: TonalPalettes.neutral[40],
  
  // Text - Softer for readability
  text: TonalPalettes.neutral[30],
  textSecondary: TonalPalettes.neutral[50],
  textTertiary: TonalPalettes.neutral[60],
  
  // UI Elements
  border: TonalPalettes.neutral[85],
  borderLight: TonalPalettes.neutral[92],
  card: TonalPalettes.neutral[100],
  shadow: 'rgba(255, 107, 61, 0.08)', // Warm shadow
  
  // Status - Vibrant and clear
  success: TonalPalettes.success[60],
  successLight: TonalPalettes.success[95],
  onSuccess: TonalPalettes.success[10],
  warning: TonalPalettes.warning[60],
  warningLight: TonalPalettes.warning[95],
  onWarning: TonalPalettes.warning[10],
  error: TonalPalettes.error[60],
  errorLight: TonalPalettes.error[95],
  onError: TonalPalettes.error[10],
  info: TonalPalettes.tertiary[60],
  infoLight: TonalPalettes.tertiary[95],
  onInfo: TonalPalettes.tertiary[10],
  
  // Interactive
  overlay: 'rgba(63, 51, 46, 0.5)', // Warm overlay
  ripple: 'rgba(255, 107, 61, 0.15)',
  
  // Legacy support
  primaryDark: TonalPalettes.primary[40],
  primaryLight: TonalPalettes.primary[70],
};

// Semantic Color Mappings - Dark Mode (Soft & Deep, not harsh black)
const darkModeColors = {
  // Primary - Brighter in dark mode
  primary: TonalPalettes.primary[70],
  primaryContainer: TonalPalettes.primary[30],
  onPrimary: TonalPalettes.primary[10],
  onPrimaryContainer: TonalPalettes.primary[95],
  
  // Backgrounds - Warm deep tones, not pure black
  background: TonalPalettes.neutral[10],
  backgroundSecondary: TonalPalettes.neutral[15],
  backgroundTertiary: TonalPalettes.neutral[20],
  onBackground: TonalPalettes.neutral[90],
  
  // Surface (Cards, Containers)
  surface: TonalPalettes.neutral[15],
  surfaceVariant: TonalPalettes.neutral[20],
  onSurface: TonalPalettes.neutral[90],
  onSurfaceVariant: TonalPalettes.neutral[75],
  
  // Text - Soft whites
  text: TonalPalettes.neutral[90],
  textSecondary: TonalPalettes.neutral[70],
  textTertiary: TonalPalettes.neutral[60],
  
  // UI Elements
  border: TonalPalettes.neutral[30],
  borderLight: TonalPalettes.neutral[25],
  card: TonalPalettes.neutral[15],
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Status - Vibrant in dark mode
  success: TonalPalettes.success[70],
  successLight: TonalPalettes.success[25],
  onSuccess: TonalPalettes.success[10],
  warning: TonalPalettes.warning[70],
  warningLight: TonalPalettes.warning[25],
  onWarning: TonalPalettes.warning[10],
  error: TonalPalettes.error[70],
  errorLight: TonalPalettes.error[25],
  onError: TonalPalettes.error[10],
  info: TonalPalettes.tertiary[70],
  infoLight: TonalPalettes.tertiary[25],
  onInfo: TonalPalettes.tertiary[10],
  
  // Interactive
  overlay: 'rgba(0, 0, 0, 0.6)',
  ripple: 'rgba(255, 145, 102, 0.15)',
  
  // Legacy support
  primaryDark: TonalPalettes.primary[60],
  primaryLight: TonalPalettes.primary[80],
};

export const Colors = {
  light: lightModeColors,
  dark: darkModeColors,
};

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Legacy exports for backward compatibility
export const Spacing = spacing;
export const BorderRadius = radius;

// Soft, diffused shadows for joyful theme
export const Shadows = {
  sm: {
    shadowColor: '#FF6B3D', // Warm shadow color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#FF6B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  lg: {
    shadowColor: '#FF6B3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#FF6B3D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
};

export const Layout = {
  screenPadding: Spacing.md,
  maxContentWidth: 600,
  headerHeight: 60,
  tabBarHeight: 60,
};

export const Animation = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Type exports for TypeScript
export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;

