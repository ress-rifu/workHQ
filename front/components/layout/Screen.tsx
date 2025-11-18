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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout, spacing } from '../../constants/theme';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  safe?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  padding?: boolean;
  keyboardAvoiding?: boolean;
  hasHeader?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  safe = true,
  style,
  contentContainerStyle,
  padding = true,
  keyboardAvoiding = true,
  hasHeader = false,
}: ScreenProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Add bottom padding to account for absolute-positioned tab bar
  const tabBarSpacing = Layout.tabBarHeight + insets.bottom + spacing.md + spacing.xl;
  
  // Add top padding if there's a fixed header (AppHeader is ~80px with safe area)
  const headerSpacing = hasHeader ? Layout.headerHeight + insets.top + spacing.md : 0;

  const basePadding = padding ? Layout.screenPadding : 0;

  const screenStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const paddingStyle: ViewStyle = padding
    ? {
        paddingHorizontal: basePadding,
      }
    : {};

  const viewPaddingTop = basePadding + headerSpacing;
  const viewPaddingBottom = basePadding + tabBarSpacing;
  
  const scrollContentStyle: ViewStyle = scrollable 
    ? { 
        paddingBottom: viewPaddingBottom,
        paddingTop: viewPaddingTop,
      }
    : { paddingTop: viewPaddingTop };

  const Wrapper = safe ? SafeAreaView : View;

  const content = scrollable ? (
    <ScrollView
      style={[screenStyle, style]}
      contentContainerStyle={[paddingStyle, scrollContentStyle, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        screenStyle,
        paddingStyle,
        style,
        {
          paddingTop: viewPaddingTop,
          paddingBottom: viewPaddingBottom,
        },
      ]}
    >
      {children}
    </View>
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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



