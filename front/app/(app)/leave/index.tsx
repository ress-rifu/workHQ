import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Screen, SidebarToggle } from '../../../components/layout';
import { Card, Badge, Button, Divider, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { leaveService, LeaveBalance, Leave } from '../../../services/leave.service';

export default function LeaveScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile } = useAuth();
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';
  
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [applications, setApplications] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Execute both requests in parallel with error handling
      const results = await Promise.allSettled([
        leaveService.getLeaveBalances(),
        leaveService.getLeaveApplications(),
      ]);

      const [balancesRes, applicationsRes] = results;

      if (balancesRes.status === 'fulfilled' && balancesRes.value.success) {
        setBalances(balancesRes.value.data || []);
      }

      if (applicationsRes.status === 'fulfilled' && applicationsRes.value.success) {
        setApplications(applicationsRes.value.data || []);
      }

      // Set error only if both requests failed
      if (balancesRes.status === 'rejected' && applicationsRes.status === 'rejected') {
        setError('Failed to load leave data. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleCancelLeave = async (leaveId: string) => {
    Alert.alert(
      'Cancel Leave',
      'Are you sure you want to cancel this leave application?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await leaveService.cancelLeave(leaveId);
              
              if (response.success) {
                Alert.alert('Success', 'Leave cancelled successfully');
                loadData();
              } else {
                Alert.alert('Error', response.error || 'Failed to cancel leave');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <Screen safe>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <Button title="Retry" onPress={loadData} style={styles.retryButton} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safe padding={false}>
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <SidebarToggle />
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Leave</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Manage time off</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: colors.border }]}
            onPress={() => router.push('/leave/apply' as any)}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Leave Balances */}
          <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Leave Balance</Text>
          
          {balances.length === 0 ? (
            <Card padding="lg" shadow="sm">
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No leave balances found
                </Text>
              </View>
            </Card>
          ) : (
            <View style={styles.balanceGrid}>
              {balances.map((balance) => (
                <Card key={balance.id} padding="md" shadow="sm" style={styles.balanceCard}>
                  <Text style={[styles.balanceType, { color: colors.text }]}>
                    {balance.leaveType.name}
                  </Text>
                  <Text style={[styles.balanceDays, { color: colors.primary }]}>
                    {balance.balanceDays}
                  </Text>
                  <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
                    days left
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Apply Leave Button */}
        <Button
          title="Apply for Leave"
          onPress={() => router.push('/leave/apply' as any)}
          fullWidth
          size="lg"
          icon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
          style={styles.applyButton}
        />

        {/* Recent Applications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Leave Applications
          </Text>

          {applications.length === 0 ? (
            <Card padding="lg" shadow="sm">
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No leave applications yet
                </Text>
              </View>
            </Card>
          ) : (
            applications.map((leave) => (
              <Card 
                key={leave.id} 
                padding="md" 
                shadow="sm" 
                style={styles.leaveCard}
                onPress={() => router.push(`/leave/${leave.id}` as any)}
              >
                <View style={styles.leaveHeader}>
                  <View style={styles.leaveInfo}>
                    <Text style={[styles.leaveType, { color: colors.text }]}>
                      {leave.leaveType.name}
                    </Text>
                    <Text style={[styles.leaveDuration, { color: colors.textSecondary }]}>
                      {leave.days} {leave.days === 1 ? 'day' : 'days'}
                    </Text>
                  </View>
                  <Badge label={leave.status} variant={getStatusColor(leave.status) as any} />
                </View>

                <Divider spacing="sm" />

                <View style={styles.leaveDates}>
                  <View style={styles.dateItem}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                  {leave.reason && (
                    <Text style={[styles.leaveReason, { color: colors.textSecondary }]} numberOfLines={1}>
                      {leave.reason}
                    </Text>
                  )}
                </View>

                {leave.status === 'PENDING' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelLeave(leave.id)}
                  >
                    <Text style={[styles.cancelText, { color: colors.error }]}>
                      Cancel Request
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            ))
          )}
        </View>
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    paddingBottom: 160,
    paddingTop: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  balanceCard: {
    flex: 1,
    minWidth: '46%',
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 16,
  },
  balanceType: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  balanceDays: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
  },
  balanceLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 4,
    opacity: 0.7,
  },
  applyButton: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 16,
    height: 56,
  },
  leaveCard: {
    marginBottom: 20,
    borderRadius: 16,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leaveInfo: {
    flex: 1,
  },
  leaveType: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
  },
  leaveDuration: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 4,
  },
  leaveDates: {
    marginTop: 12,
    gap: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  leaveReason: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 8,
    fontStyle: 'italic',
  },
  cancelButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  cancelText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 8,
    letterSpacing: 0.1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    lineHeight: 28,
  },
  retryButton: {
    minWidth: 160,
    borderRadius: 16,
    height: 52,
  },
});



