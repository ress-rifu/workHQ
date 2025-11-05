import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  touchableProps?: Omit<TouchableOpacityProps, 'style' | 'onPress'>;
}

export function Card({
  children,
  style,
  padding = 'md',
  shadow = 'md',
  onPress,
  touchableProps,
}: CardProps) {
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing[padding],
    borderWidth: 1,
    borderColor: colors.border,
  };

  const shadowStyle = shadow !== 'none' ? Shadows[shadow] : {};

  const combinedStyle = [cardStyle, shadowStyle, style];

  if (onPress) {
    return (
      <TouchableOpacity
        {...touchableProps}
        onPress={onPress}
        style={combinedStyle}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={combinedStyle}>{children}</View>;
}



