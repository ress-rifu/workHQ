import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Pressable, PressableProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  pressableProps?: Omit<PressableProps, 'style' | 'onPress'>;
}

export const Card = React.memo(function Card({
  children,
  style,
  padding = 'lg', // Default to generous spacing
  shadow = 'sm',
  onPress,
  pressableProps,
}: CardProps) {
  const { colors, isDark } = useTheme();

  const getCardStyle = (pressed: boolean): ViewStyle[] => {
    const cardStyle: ViewStyle = {
      backgroundColor: pressed && onPress 
        ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')
        : colors.card,
      borderRadius: radius.lg,
      padding: spacing[padding],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: pressed && onPress ? colors.border : colors.borderLight,
      transform: [{ scale: pressed && onPress ? 0.995 : 1 }],
    };

    const depthStyle = getDepthStyle(shadow, colors, pressed && !!onPress);

    return [cardStyle, depthStyle, style as ViewStyle];
  };

  if (onPress) {
    return (
      <Pressable
        {...pressableProps}
        onPress={onPress}
        style={({ pressed }) => getCardStyle(pressed)}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={getCardStyle(false)}>{children}</View>;
});

function getDepthStyle(
  shadow: NonNullable<CardProps['shadow']>,
  colors: ReturnType<typeof useTheme>['colors'],
  pressed: boolean
): ViewStyle {
  switch (shadow) {
    case 'none':
      return {};
    case 'sm':
      return {
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: pressed ? colors.primary : colors.border,
      };
    case 'md':
      return {
        borderWidth: 1,
        borderColor: pressed ? colors.primary : colors.border,
      };
    case 'lg':
      return {
        borderWidth: 1,
        borderColor: pressed ? colors.primary : colors.primaryLight,
      };
    case 'xl':
      return {
        borderWidth: 1.5,
        borderColor: colors.primary,
      };
    default:
      return {};
  }
}



