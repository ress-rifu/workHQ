import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarToggle } from './Sidebar';
import { Layout, Typography, spacing, radius } from '../../constants/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
}: AppHeaderProps) {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

  const headerHeight = Layout.headerHeight + insets.top;

  return (
    <View
      style={[
        styles.headerContainer,
        {
          height: headerHeight,
          backgroundColor: colors.background,
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View
        style={[
          styles.headerInner,
          {
            paddingTop: insets.top,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.headerBackdrop,
            {
              backgroundColor: colors.primaryLight,
              opacity: isDark ? 0.2 : 0.35,
            },
          ]}
        />
        <View
          style={[
            styles.headerAccent,
            { backgroundColor: colors.primary },
          ]}
        />
        <View style={styles.headerContent}>
          {isHROrAdmin ? (
            <SidebarToggle />
          ) : showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.iconButton, { borderColor: colors.border }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}

          <View style={styles.titleContainer}>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {rightAction ? (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={[styles.iconButton, { borderColor: colors.border }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={rightAction.icon} size={20} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerInner: {
    flex: 1,
    paddingHorizontal: Layout.screenPaddingLarge,
    paddingBottom: spacing.md,
    position: 'relative',
    justifyContent: 'center',
  },
  headerBackdrop: {
    position: 'absolute',
    left: Layout.screenPaddingLarge - 12,
    right: Layout.screenPaddingLarge - 12,
    top: spacing.sm,
    bottom: spacing.sm,
    borderRadius: radius.full,
  },
  headerAccent: {
    position: 'absolute',
    left: Layout.screenPaddingLarge,
    right: Layout.screenPaddingLarge,
    bottom: 6,
    height: 3,
    borderRadius: radius.full,
    opacity: 0.8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.8,
  },
});

