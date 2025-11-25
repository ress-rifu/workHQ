import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

export default function HRLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const { profile } = useAuth();

  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

  // Redirect employees away from HR section
  useEffect(() => {
    if (profile && !isHROrAdmin) {
      router.replace('/');
    }
  }, [profile, isHROrAdmin, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

