import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, AppHeader } from '../../../components/layout';
import { Card, Badge, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing, radius } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { hrService, LeaveRequest, HRStats } from '../../../services/hr.service';

export default function HRLeaveRequestsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<HRStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [requestsRes, statsRes] = await Promise.all([
        filter === 'PENDING' 
          ? hrService.getPendingLeaveRequests()
          : hrService.getLeaveRequests(),
        hrService.getHRStats(),
      ]);

      if (requestsRes.success && requestsRes.data) {
        setLeaveRequests(requestsRes.data);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load HR data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [filter]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Check if user is HR or ADMIN
  if (profile?.role !== 'HR' && profile?.role !== 'ADMIN') {
    return (
      <Screen safe padding>
        <View style={styles.centerContent}>
          <Ionicons name="lock-closed" size={48} color={colors.textSecondary} />
          <Text style={[styles.noAccessText, { color: colors.text }]}>
            Access Denied
          </Text>
          <Text style={[styles.noAccessSubtext, { color: colors.textSecondary }]}>
            You need HR or Admin privileges to access this section
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safe={false} padding={false} hasHeader>
      <AppHeader
        title="Leave Requests"
        subtitle="Manage applications"
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <Card padding="md" shadow="sm" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="time" size={24} color={colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.pendingLeaves}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Pending
              </Text>
            </Card>

            <Card padding="md" shadow="sm" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                <Ionicons name="people" size={24} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalEmployees}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Employees
              </Text>
            </Card>

            <Card padding="md" shadow="sm" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.infoLight }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.info} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.todayAttendance}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
            </Card>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'PENDING' && { backgroundColor: colors.primary },
              filter !== 'PENDING' && { backgroundColor: colors.card },
            ]}
            onPress={() => setFilter('PENDING')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'PENDING' ? { color: '#FFFFFF' } : { color: colors.textSecondary },
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'ALL' && { backgroundColor: colors.primary },
              filter !== 'ALL' && { backgroundColor: colors.card },
            ]}
            onPress={() => setFilter('ALL')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'ALL' ? { color: '#FFFFFF' } : { color: colors.textSecondary },
              ]}
            >
              All Requests
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leave Requests List */}
        <View style={styles.content}>
          {leaveRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No leave requests
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {filter === 'PENDING'
                  ? 'All leave requests have been processed'
                  : 'No leave requests found'}
              </Text>
            </View>
          ) : (
            leaveRequests.map((request) => (
              <Card
                key={request.id}
                padding="md"
                shadow="sm"
                style={styles.requestCard}
                onPress={() => router.push(`/hr/${request.id}` as any)}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.employeeInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {request.employee.user.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.employeeDetails}>
                      <Text style={[styles.employeeName, { color: colors.text }]}>
                        {request.employee.user.fullName}
                      </Text>
                      <Text style={[styles.employeeCode, { color: colors.textSecondary }]}>
                        {request.employee.employeeCode}
                      </Text>
                    </View>
                  </View>
                  <Badge label={request.status} variant={getStatusVariant(request.status)} />
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {request.days} day{request.days !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="bookmark-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {request.leaveType.name}
                    </Text>
                  </View>
                </View>

                {request.reason && (
                  <>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.reasonLabel, { color: colors.textSecondary }]}>
                      Reason:
                    </Text>
                    <Text style={[styles.reasonText, { color: colors.text }]} numberOfLines={2}>
                      {request.reason}
                    </Text>
                  </>
                )}

                <View style={styles.actionIndicator}>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxxl + Spacing.xxl,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  content: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  requestCard: {
    marginBottom: Spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  employeeDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  employeeName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
  },
  employeeCode: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  requestDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  reasonLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  reasonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  actionIndicator: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    marginTop: -10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  noAccessText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginTop: Spacing.lg,
  },
  noAccessSubtext: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
