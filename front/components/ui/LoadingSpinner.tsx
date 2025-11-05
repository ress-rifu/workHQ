import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({ size = 'large', fullScreen = false, style }: LoadingSpinnerProps) {
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }, style]}>
        <ActivityIndicator size={size} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});



