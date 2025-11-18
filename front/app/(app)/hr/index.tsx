import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, SidebarToggle } from '../../../components/layout';
import { Card, Badge, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing, radius } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { hrService, LeaveRequest, HRStats } from '../../../services/hr.service';

export default function HRLeaveRequestsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

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
    <Screen safe padding={false} scrollable={false}>
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {isHROrAdmin && <SidebarToggle />}
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Leave Requests</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Manage applications</Text>
            </View>
          </View>
        </View>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
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
  fixedHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 48,
    gap: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  filterText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  requestCard: {
    marginBottom: 0,
    borderRadius: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.3,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
  },
  employeeCode: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 2,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  requestDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  reasonLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  reasonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 22,
  },
  actionIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.7,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  noAccessText: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  noAccessSubtext: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    opacity: 0.7,
  },
});
