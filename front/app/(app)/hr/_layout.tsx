import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

export default function HRLayout() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check if user is HR or ADMIN, if not redirect to home
    if (profile && profile.role !== 'HR' && profile.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [profile, router]);

  // Don't render if user doesn't have access
  if (profile && profile.role !== 'HR' && profile.role !== 'ADMIN') {
    return null;
  }

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

