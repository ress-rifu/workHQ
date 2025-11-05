import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
  onPress,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  // Size styles
  const sizeStyles = {
    sm: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      minHeight: 36,
    },
    md: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      minHeight: 44,
    },
    lg: {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      minHeight: 52,
    },
  };

  const textSizeStyles = {
    sm: {
      fontSize: Typography.fontSize.sm,
    },
    md: {
      fontSize: Typography.fontSize.base,
    },
    lg: {
      fontSize: Typography.fontSize.lg,
    },
  };

  // Variant styles
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled ? colors.border : colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: isDisabled ? colors.borderLight : colors.backgroundTertiary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDisabled ? colors.border : colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: isDisabled ? colors.border : colors.error,
        };
      default:
        return {};
    }
  };

  const getTextColor = (): string => {
    if (isDisabled) {
      return colors.textTertiary;
    }
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return colors.text;
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        sizeStyles[size],
        getVariantStyles(),
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              textSizeStyles[size],
              { color: getTextColor() },
              icon && styles.textWithIcon,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: Spacing.xs,
  },
});



