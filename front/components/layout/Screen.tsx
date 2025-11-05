import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/theme';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  safe?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  padding?: boolean;
  keyboardAvoiding?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  safe = true,
  style,
  contentContainerStyle,
  padding = true,
  keyboardAvoiding = true,
}: ScreenProps) {
  const { colors, isDark } = useTheme();

  const screenStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const paddingStyle = padding ? { padding: Layout.screenPadding } : {};

  const Wrapper = safe ? SafeAreaView : View;

  const content = scrollable ? (
    <ScrollView
      style={[screenStyle, style]}
      contentContainerStyle={[paddingStyle, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[screenStyle, paddingStyle, style]}>{children}</View>
  );

  return (
    <Wrapper style={screenStyle} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
});



