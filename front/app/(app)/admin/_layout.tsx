import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Sidebar, SidebarItem } from '../../../components/layout';

export default function AdminLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'ADMIN';

  const sidebarItems: SidebarItem[] = [
    {
      id: 'users',
      label: 'User Management',
      icon: 'people',
      path: '/admin',
    },
    {
      id: 'announcements',
      label: 'Create Announcement',
      icon: 'megaphone',
      path: '/announcements/create',
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
      {isAdmin && (
        <Sidebar
          title="Admin"
          subtitle="Control Panel"
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
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
