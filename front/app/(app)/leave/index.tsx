import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, Header } from '../../../components/layout';
import { Card, Badge, Button, Divider, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { leaveService, LeaveBalance, Leave } from '../../../services/leave.service';

export default function LeaveScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
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

      const [balancesRes, applicationsRes] = await Promise.all([
        leaveService.getLeaveBalances(),
        leaveService.getLeaveApplications(),
      ]);

      if (balancesRes.success && balancesRes.data) {
        setBalances(balancesRes.data);
      }

      if (applicationsRes.success && applicationsRes.data) {
        setApplications(applicationsRes.data);
      }

      if (!balancesRes.success || !applicationsRes.success) {
        setError(balancesRes.error || applicationsRes.error || 'Failed to load leave data');
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
    <Screen scrollable safe padding={false} 
      contentContainerStyle={{ 
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> 
      }}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Leave Management</Text>
          <Text style={styles.headerSubtitle}>Manage your time off</Text>
        </View>
      </View>

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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: Spacing.xs,
  },
  content: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  balanceCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  balanceType: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.xs,
  },
  balanceDays: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  balanceLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xs,
  },
  applyButton: {
    marginBottom: Spacing.lg,
  },
  leaveCard: {
    marginBottom: Spacing.md,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
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
    marginTop: 2,
  },
  leaveDates: {
    marginTop: Spacing.sm,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  leaveReason: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  cancelButton: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  cancelText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
});



