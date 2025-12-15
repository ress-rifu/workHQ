import React from 'react';
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, spacing, radius } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
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
}) => {
  const { colors, isDark } = useTheme();
  const isDisabled = disabled || loading;

  const getBackgroundColor = (pressed: boolean) => {
    if (isDisabled) return colors.border;
    
    switch (variant) {
      case 'primary':
        return pressed ? colors.primaryDark : colors.primary;
      case 'secondary':
        return pressed 
          ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)') 
          : colors.backgroundTertiary;
      case 'outline':
        return pressed ? colors.primaryContainer : 'transparent';
      case 'ghost':
        return pressed 
          ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') 
          : 'transparent';
      case 'danger':
        return pressed ? colors.errorLight : colors.error;
      default:
        return colors.primary;
    }
  };

  const textColor = (() => {
    if (isDisabled) return colors.textTertiary;
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
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
  })();

  const fontSize = size === 'sm' ? Typography.fontSize.sm : size === 'lg' ? Typography.fontSize.lg : Typography.fontSize.base;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? (isDisabled ? colors.border : colors.primary) : 'transparent',
          paddingVertical: size === 'sm' ? 10 : size === 'lg' ? 16 : 12,
          paddingHorizontal: size === 'sm' ? 20 : size === 'lg' ? 32 : 24,
          minHeight: size === 'sm' ? 40 : size === 'lg' ? 56 : 48,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
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
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            numberOfLines={1}
            style={[
              styles.text,
              { color: textColor, fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
    includeFontPadding: false,
  },
  textWithIcon: {
    marginLeft: spacing.xs,
  },
});



