import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  touchableProps?: Omit<TouchableOpacityProps, 'style' | 'onPress'>;
}

export const Card = React.memo(function Card({
  children,
  style,
  padding = 'lg', // Default to generous spacing
  shadow = 'sm',
  onPress,
  touchableProps,
}: CardProps) {
  const { colors } = useTheme();

  const combinedStyle = useMemo(() => {
    const cardStyle: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: radius.lg, // Soft, rounded corners
      padding: spacing[padding],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderLight,
    };

    const depthStyle = getDepthStyle(shadow, colors);

    return [cardStyle, depthStyle, style];
  }, [colors, padding, shadow, style]);

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
});

function getDepthStyle(
  shadow: NonNullable<CardProps['shadow']>,
  colors: ReturnType<typeof useTheme>['colors']
): ViewStyle {
  switch (shadow) {
    case 'none':
      return {};
    case 'sm':
      return {
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: colors.border,
      };
    case 'md':
      return {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceVariant,
      };
    case 'lg':
      return {
        borderWidth: 1,
        borderColor: colors.primaryLight,
        backgroundColor: colors.surfaceVariant,
      };
    case 'xl':
      return {
        borderWidth: 1.5,
        borderColor: colors.primary,
        backgroundColor: colors.backgroundSecondary,
      };
    default:
      return {};
  }
}



