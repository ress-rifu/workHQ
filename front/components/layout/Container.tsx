import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout, Spacing } from '../../constants/theme';

interface ContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  maxWidth?: boolean;
  padding?: boolean;
}

export function Container({ children, style, maxWidth = false, padding = true }: ContainerProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
        maxWidth && { maxWidth: Layout.maxContentWidth, alignSelf: 'center', width: '100%' },
        padding && { padding: Layout.screenPadding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});



