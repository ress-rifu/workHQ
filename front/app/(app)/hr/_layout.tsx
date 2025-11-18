import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Sidebar, SidebarItem } from '../../../components/layout';
import { hrService } from '../../../services/hr.service';

export default function HRLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState(0);

  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

  // Redirect employees away from HR section
  useEffect(() => {
    if (profile && !isHROrAdmin) {
      router.replace('/');
    }
  }, [profile, isHROrAdmin, router]);

  useEffect(() => {
    if (isHROrAdmin) {
      loadStats();
    }
  }, [isHROrAdmin]);

  const loadStats = async () => {
    try {
      const response = await hrService.getHRStats();
      if (response.success && response.data) {
        setPendingLeaves(response.data.pendingLeaves);
      }
    } catch (err) {
      console.error('Failed to load HR stats:', err);
    }
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: 'leave-requests',
      label: 'Leave Requests',
      icon: 'calendar',
      path: '/hr',
      badge: pendingLeaves,
    },
    {
      id: 'back-home',
      label: 'Back to Home',
      icon: 'home',
      path: '/',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isHROrAdmin && (
        <Sidebar
          title="HR"
          subtitle="Management"
          items={sidebarItems}
        />
      )}
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

