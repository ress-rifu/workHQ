import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Screen } from '../../components/layout';
import { Card, Avatar, Badge, LoadingSpinner } from '../../components/ui';
import { Typography, Spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { attendanceService, TodayStatus } from '../../services/attendance.service';
import { leaveService, LeaveBalance } from '../../services/leave.service';
import { profileService, ProfileStats } from '../../services/profile.service';
import { hrService, HRStats } from '../../services/hr.service';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { colors } = useTheme();

  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [hrStats, setHRStats] = useState<HRStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const promises = [
        attendanceService.getTodayStatus(),
        leaveService.getLeaveBalances(),
        profileService.getProfileStats(),
      ];

      // Add HR stats if user is HR or Admin
      if (isHROrAdmin) {
        promises.push(hrService.getHRStats());
      }

      const results = await Promise.all(promises);
      const [todayRes, balancesRes, statsRes, hrStatsRes] = results;

      if (todayRes.success && todayRes.data) {
        setTodayStatus(todayRes.data);
      }

      if (balancesRes.success && balancesRes.data) {
        setLeaveBalances(balancesRes.data);
      }

      if (statsRes.success && statsRes.data) {
        setProfileStats(statsRes.data);
      }

      if (hrStatsRes && hrStatsRes.success && hrStatsRes.data) {
        setHRStats(hrStatsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTotalLeaveBalance = () => {
    return leaveBalances.reduce((sum, balance) => sum + balance.balanceDays, 0);
  };

  const formatWorkingHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const getAttendanceStatus = () => {
    if (!todayStatus) return { label: 'Loading...', variant: 'default' as const };
    if (todayStatus.hasCheckedOut) return { label: 'Checked Out', variant: 'success' as const };
    if (todayStatus.hasCheckedIn) return { label: 'Checked In', variant: 'info' as const };
    return { label: 'Not Checked In', variant: 'warning' as const };
  };

  const attendanceStatus = getAttendanceStatus();

  return (
    <Screen scrollable safe padding={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Avatar name={user?.email || 'User'} size="lg" />
              <View style={styles.userDetails}>
                <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Welcome'}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/profile' as any)}
            >
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.quickActions}>
              {isHROrAdmin && hrStats && (
                <Card 
                  style={styles.actionCard} 
                  shadow="sm" 
                  onPress={() => router.push('/hr' as any)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors.errorLight }]}>
                    <Ionicons name="briefcase" size={24} color={colors.error} />
                  </View>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>
                    Leave Requests
                  </Text>
                  {hrStats.pendingLeaves > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.error }]}>
                      <Text style={styles.badgeText}>{hrStats.pendingLeaves}</Text>
                    </View>
                  )}
                </Card>
              )}

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/attendance' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
                  <Ionicons name="location" size={24} color={colors.success} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  {todayStatus?.hasCheckedIn ? 'Check Out' : 'Check In'}
                </Text>
              </Card>

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/leave/apply' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.infoLight }]}>
                  <Ionicons name="calendar" size={24} color={colors.info} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Apply Leave</Text>
              </Card>

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/payroll/payslips' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="document-text" size={24} color={colors.warning} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Payslips</Text>
              </Card>

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/profile' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="person" size={24} color={colors.primary} />
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
                <Badge label={attendanceStatus.label} variant={attendanceStatus.variant} />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                  Leave Balance
                </Text>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {getTotalLeaveBalance()} days
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                  Working Hours
                </Text>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {todayStatus ? formatWorkingHours(todayStatus.workingHours) : '0h 0m'}
                </Text>
              </View>
            </Card>
          </View>

          {/* Stats Cards */}
          {profileStats && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>This Month</Text>
              <View style={styles.statsGrid}>
                <Card padding="md" shadow="sm" style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {profileStats.attendanceThisMonth}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Attendance
                  </Text>
                </Card>

                <Card padding="md" shadow="sm" style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                    <Ionicons name="time" size={24} color={colors.warning} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {profileStats.pendingLeaves}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Pending
                  </Text>
                </Card>

                <Card padding="md" shadow="sm" style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.infoLight }]}>
                    <Ionicons name="calendar" size={24} color={colors.info} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {profileStats.totalLeaveBalance}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Leave Days
                  </Text>
                </Card>
              </View>
            </View>
          )}
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
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
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
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
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
    marginVertical: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});




