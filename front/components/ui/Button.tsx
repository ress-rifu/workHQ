import React from 'react';
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
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
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    backgroundColor: (() => {
      if (isDisabled) return colors.border;
      switch (variant) {
        case 'primary':
          return colors.primary;
        case 'secondary':
          return colors.backgroundTertiary;
        case 'outline':
        case 'ghost':
          return 'transparent';
        case 'danger':
          return colors.error;
        default:
          return colors.primary;
      }
    })(),
    borderWidth: variant === 'outline' ? 1.5 : 0,
    borderColor: variant === 'outline' ? (isDisabled ? colors.border : colors.primary) : 'transparent',
    paddingVertical: size === 'sm' ? 10 : size === 'lg' ? 16 : 12,
    paddingHorizontal: size === 'sm' ? 20 : size === 'lg' ? 32 : 24,
    minHeight: size === 'sm' ? 40 : size === 'lg' ? 56 : 48,
  };

  const textColor = (() => {
    if (isDisabled) return colors.textTertiary;
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
  })();

  const fontSize = size === 'sm' ? Typography.fontSize.sm : size === 'lg' ? Typography.fontSize.lg : Typography.fontSize.base;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        buttonStyle,
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
    </TouchableOpacity>
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



