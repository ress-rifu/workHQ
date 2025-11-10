import React, { useMemo, useRef } from 'react';
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Pressable,
  Animated,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, spacing, radius } from '../../constants/theme';

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

export const Button = React.memo(function Button({
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isDisabled = disabled || loading;

  // Bouncy press animation using React Native's built-in Animated
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  // Memoize size styles with new spacing tokens
  const sizeStyle = useMemo(() => {
    const sizes = {
      sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        minHeight: 40,
      },
      md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        minHeight: 48,
      },
      lg: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xxl,
        minHeight: 56,
      },
    };
    return sizes[size];
  }, [size]);

  const textSizeStyle = useMemo(() => {
    const sizes = {
      sm: { fontSize: Typography.fontSize.sm },
      md: { fontSize: Typography.fontSize.base },
      lg: { fontSize: Typography.fontSize.lg },
    };
    return sizes[size];
  }, [size]);

  // Memoize variant styles
  const variantStyles = useMemo((): ViewStyle => {
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
  }, [variant, isDisabled, colors]);

  const textColor = useMemo((): string => {
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
  }, [variant, isDisabled, colors]);

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      <Pressable
        {...props}
        onPress={onPress}
        onPressIn={isDisabled ? undefined : handlePressIn}
        onPressOut={isDisabled ? undefined : handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          sizeStyle,
          variantStyles,
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
                textSizeStyle,
                { color: textColor },
                icon && styles.textWithIcon,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full, // Pill-shaped buttons!
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: Typography.fontFamily.bold, // Bold for friendly confidence
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: spacing.xs,
  },
});



