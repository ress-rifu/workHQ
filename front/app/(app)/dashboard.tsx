import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Screen, SidebarToggle } from '../../components/layout';
import { Card, Avatar, Badge } from '../../components/ui';
import { Typography, Spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Screen safe padding={false}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {isHROrAdmin && <SidebarToggle />}
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.email?.split('@')[0] || 'Dashboard'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.notificationButton, { backgroundColor: colors.primaryLight }]}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Card style={styles.actionCard} shadow="sm">
              <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
                <Ionicons name="location" size={24} color={colors.success} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Check In</Text>
            </Card>

            <Card style={styles.actionCard} shadow="sm">
              <View style={[styles.iconCircle, { backgroundColor: colors.infoLight }]}>
                <Ionicons name="calendar" size={24} color={colors.info} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Apply Leave</Text>
            </Card>

            <Card style={styles.actionCard} shadow="sm">
              <View style={[styles.iconCircle, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="document-text" size={24} color={colors.warning} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Payslip</Text>
            </Card>

            <Card style={styles.actionCard} shadow="sm">
              <View style={[styles.iconCircle, { backgroundColor: colors.errorLight }]}>
                <Ionicons name="person" size={24} color={colors.error} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Profile</Text>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Status</Text>
          <Card padding="lg" shadow="md">
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Attendance
              </Text>
              <Badge label="Not Checked In" variant="warning" />
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Leave Balance
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>18 days</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Working Hours
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>0h 0m</Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <Card padding="md" shadow="sm" style={styles.activityCard}>
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No recent activity
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  userName: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.1,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    minWidth: '46%',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.1,
  },
  statusValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  activityCard: {
    minHeight: 160,
    borderRadius: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.1,
  },
});



