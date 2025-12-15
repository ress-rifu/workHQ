import { Tabs } from 'expo-router';
import { View, StyleSheet, InteractionManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, SidebarItem } from '../../components/layout';
import { Layout, radius, spacing } from '../../constants/theme';
import { useEffect, useState } from 'react';
import { hrService } from '../../services/hr.service';
import { useQuery } from '@tanstack/react-query';

export default function AppLayout() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';
  const isAdmin = profile?.role === 'ADMIN';
  const [canFetchHRStats, setCanFetchHRStats] = useState(false);

  useEffect(() => {
    if (!isHROrAdmin) {
      setCanFetchHRStats(false);
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      setCanFetchHRStats(true);
    });

    return () => task.cancel();
  }, [isHROrAdmin]);

  const hrStatsQuery = useQuery({
    queryKey: ['hrStats'],
    enabled: isHROrAdmin && canFetchHRStats,
    queryFn: async () => {
      const res = await hrService.getHRStats();
      if (!res.success || !res.data) throw new Error(res.error || res.message || 'Failed to load HR stats');
      return res.data;
    },
  });

  const pendingLeaves = hrStatsQuery.data?.pendingLeaves ?? 0;

  const sidebarItems: SidebarItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      path: '/',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: 'location',
      path: '/attendance',
    },
    {
      id: 'leave',
      label: 'Leave',
      icon: 'calendar',
      path: '/leave',
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: 'cash',
      path: '/payroll',
    },
    ...(isHROrAdmin ? [{
      id: 'hr',
      label: 'HR Management',
      icon: 'briefcase' as const,
      path: '/hr',
      badge: pendingLeaves,
    }] : []),
    ...(isAdmin ? [{
      id: 'admin',
      label: 'Admin Panel',
      icon: 'shield-checkmark' as const,
      path: '/admin',
    }] : []),
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person',
      path: '/profile',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Sidebar
        title={isAdmin ? "Admin" : isHROrAdmin ? "HR" : "WorkHQ"}
        subtitle={isAdmin ? "Control Panel" : isHROrAdmin ? "Management" : "Employee Portal"}
        items={sidebarItems}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: { display: 'none' }, // Hide tab bar for all users
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leave"
        options={{
          title: 'Leave',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payroll"
        options={{
          title: 'Payroll',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hr"
        options={{
          title: 'HR',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
          href: isHROrAdmin ? '/hr' : null,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          ),
          href: isAdmin ? '/admin' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}



