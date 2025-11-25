import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'ADMIN';

  // Redirect non-admins away from Admin section
  useEffect(() => {
    if (profile && !isAdmin) {
      router.replace('/');
    }
  }, [profile, isAdmin, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="locations" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
