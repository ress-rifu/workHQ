import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Screen } from '../../components/layout';
import { Card, Avatar, Badge } from '../../components/ui';
import { Typography, Spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  return (
    <Screen scrollable safe padding={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Avatar name={user?.email || 'User'} size="lg" />
            <View style={styles.userDetails}>
              <Text style={styles.greeting}>Good Morning 👋</Text>
              <Text style={styles.userName}>{user?.email || 'Welcome'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: Spacing.md,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  statusValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Spacing.md,
  },
  activityCard: {
    minHeight: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.sm,
  },
});



