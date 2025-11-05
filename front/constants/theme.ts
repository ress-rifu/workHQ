/**
 * Design System - Theme Constants
 * WorkHQ - Modern HR Management System
 */

export const Colors = {
  light: {
    // Primary Colors
    primary: '#4F46E5', // Indigo
    primaryDark: '#4338CA',
    primaryLight: '#818CF8',
    
    // Background
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    
    // Text
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    
    // UI Elements
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    card: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Status Colors
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    
    // Interactive
    overlay: 'rgba(0, 0, 0, 0.5)',
    ripple: 'rgba(79, 70, 229, 0.12)',
  },
  dark: {
    // Primary Colors
    primary: '#818CF8', // Lighter Indigo for dark mode
    primaryDark: '#6366F1',
    primaryLight: '#A5B4FC',
    
    // Background
    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',
    
    // Text
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    
    // UI Elements
    border: '#374151',
    borderLight: '#4B5563',
    card: '#1F2937',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    // Status Colors
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    error: '#F87171',
    errorLight: '#7F1D1D',
    info: '#60A5FA',
    infoLight: '#1E3A8A',
    
    // Interactive
    overlay: 'rgba(0, 0, 0, 0.7)',
    ripple: 'rgba(129, 140, 248, 0.12)',
  },
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

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
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

