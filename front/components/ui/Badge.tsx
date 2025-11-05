import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  style,
  textStyle,
}: BadgeProps) {
  const { colors } = useTheme();

  const sizeStyles = {
    sm: {
      paddingVertical: Spacing.xs / 2,
      paddingHorizontal: Spacing.sm,
      fontSize: Typography.fontSize.xs,
    },
    md: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
      fontSize: Typography.fontSize.sm,
    },
    lg: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      fontSize: Typography.fontSize.base,
    },
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: colors.successLight,
          color: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.warningLight,
          color: colors.warning,
        };
      case 'error':
        return {
          backgroundColor: colors.errorLight,
          color: colors.error,
        };
      case 'info':
        return {
          backgroundColor: colors.infoLight,
          color: colors.info,
        };
      default:
        return {
          backgroundColor: colors.backgroundTertiary,
          color: colors.text,
        };
    }
  };

  const variantColors = getVariantColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantColors.backgroundColor,
          paddingVertical: sizeStyles[size].paddingVertical,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: variantColors.color,
            fontSize: sizeStyles[size].fontSize,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    fontFamily: Typography.fontFamily.semibold,
  },
});



