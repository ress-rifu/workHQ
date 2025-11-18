import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, spacing, radius } from '../../constants/theme';

export type HeaderVariant = 'default' | 'gradient' | 'transparent';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: ReactNode;
  style?: ViewStyle;
  variant?: HeaderVariant;
  large?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  style,
  variant = 'default',
  large = false,
}: HeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const getBackgroundStyle = () => {
    switch (variant) {
      case 'gradient':
        return { backgroundColor: colors.primary };
      case 'transparent':
        return { backgroundColor: 'transparent' };
      default:
        return {
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        };
    }
  };

  const getTextColor = () => {
    return variant === 'gradient' ? '#FFFFFF' : colors.text;
  };

  const getSubtitleColor = () => {
    return variant === 'gradient' ? 'rgba(255, 255, 255, 0.9)' : colors.textSecondary;
  };

  return (
    <View
      style={[
        styles.container,
        getBackgroundStyle(),
        { paddingTop: insets.top + spacing.md },
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[
                styles.iconButton,
                variant === 'gradient' && styles.iconButtonGradient,
                variant === 'transparent' && { backgroundColor: colors.card }
              ]}>
                <Ionicons 
                  name="arrow-back" 
                  size={20} 
                  color={variant === 'transparent' ? colors.text : getTextColor()} 
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.centerSection, large && styles.centerSectionLarge]}>
          {title && (
            <Text
              style={[
                large ? styles.titleLarge : styles.title,
                { color: getTextColor() },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: getSubtitleColor() },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightSection}>{rightAction}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  leftSection: {
    minWidth: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  centerSectionLarge: {
    alignItems: 'flex-start',
  },
  rightSection: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    padding: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonGradient: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  titleLarge: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginTop: spacing.xs,
  },
});



