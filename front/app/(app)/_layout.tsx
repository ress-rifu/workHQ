import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, SidebarItem } from '../../components/layout';
import { Layout, radius, spacing } from '../../constants/theme';
import { useState, useEffect } from 'react';
import { hrService } from '../../services/hr.service';

export default function AppLayout() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';
  const isAdmin = profile?.role === 'ADMIN';
  const [pendingLeaves, setPendingLeaves] = useState(0);

  useEffect(() => {
    if (isHROrAdmin) {
      loadHRStats();
    }
  }, [isHROrAdmin]);

  const loadHRStats = async () => {
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
          tabBarStyle: isHROrAdmin ? { display: 'none' } : {
            position: 'absolute',
            backgroundColor: colors.card,
            borderTopWidth: 0,
            height: Layout.tabBarHeight + insets.bottom,
            paddingBottom: insets.bottom + spacing.xs,
            paddingTop: spacing.sm,
            paddingHorizontal: spacing.md,
            marginHorizontal: spacing.lg,
            marginBottom: insets.bottom + spacing.md,
            borderRadius: radius.full,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: colors.borderLight,
          },
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



