import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing } from '../../constants/theme';

interface DividerProps {
  style?: ViewStyle;
  orientation?: 'horizontal' | 'vertical';
  spacing?: keyof typeof Spacing;
}

export function Divider({ style, orientation = 'horizontal', spacing }: DividerProps) {
  const { colors } = useTheme();

  const marginValue = spacing ? Spacing[spacing] : 0;

  return (
    <View
      style={[
        {
          backgroundColor: colors.border,
        },
        orientation === 'horizontal'
          ? {
              height: 1,
              width: '100%',
              marginVertical: marginValue,
            }
          : {
              width: 1,
              height: '100%',
              marginHorizontal: marginValue,
            },
        style,
      ]}
    />
  );
}



