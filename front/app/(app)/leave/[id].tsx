import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Screen, SidebarToggle } from '../../../components/layout';
import { Card, Badge, Button, Divider, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { leaveService, Leave } from '../../../services/leave.service';

export default function LeaveDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { profile } = useAuth();
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';
  
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadLeaveDetails();
    }
  }, [id]);

  const loadLeaveDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await leaveService.getLeaveApplication(id as string);

      if (response.success && response.data) {
        setLeave(response.data);
      } else {
        setError(response.error || 'Failed to load leave details');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = () => {
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
              setCancelling(true);
              const response = await leaveService.cancelLeave(id as string);
              
              if (response.success) {
                Alert.alert(
                  'Success',
                  'Leave cancelled successfully',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.back(),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.error || 'Failed to cancel leave');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred');
            } finally {
              setCancelling(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time';
      case 'REJECTED':
        return 'close-circle';
      case 'CANCELLED':
        return 'ban';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !leave) {
    return (
      <Screen safe padding={false}>
        <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {isHROrAdmin ? (
                <SidebarToggle />
              ) : (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={[styles.iconButton, { borderColor: colors.border }]}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
              )}
              <View>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Leave</Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Leave Details</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Leave application not found'}
          </Text>
          <Button title="Go Back" onPress={() => router.back()} style={styles.retryButton} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable safe padding={false}>
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {isHROrAdmin ? (
              <SidebarToggle />
            ) : (
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.iconButton, { borderColor: colors.border }]}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Leave</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Leave Details</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status Card */}
      <Card padding="lg" shadow="md" style={styles.card}>
        <View style={styles.statusHeader}>
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor:
                  leave.status === 'APPROVED'
                    ? colors.successLight
                    : leave.status === 'PENDING'
                    ? colors.warningLight
                    : leave.status === 'REJECTED'
                    ? colors.errorLight
                    : colors.backgroundTertiary,
              },
            ]}
          >
            <Ionicons
              name={getStatusIcon(leave.status) as any}
              size={32}
              color={
                leave.status === 'APPROVED'
                  ? colors.success
                  : leave.status === 'PENDING'
                  ? colors.warning
                  : leave.status === 'REJECTED'
                  ? colors.error
                  : colors.textTertiary
              }
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              Leave Application
            </Text>
            <Badge label={leave.status} variant={getStatusColor(leave.status) as any} />
          </View>
        </View>
      </Card>

      {/* Leave Details Card */}
      <Card padding="lg" shadow="md" style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Details</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Ionicons name="document-text" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Leave Type
            </Text>
          </View>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {leave.leaveType.name}
          </Text>
        </View>

        <Divider spacing="md" />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Duration
            </Text>
          </View>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {leave.days} {leave.days === 1 ? 'day' : 'days'}
          </Text>
        </View>

        <Divider spacing="md" />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Ionicons name="play-circle" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Start Date
            </Text>
          </View>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {new Date(leave.startDate).toLocaleDateString()}
          </Text>
        </View>

        <Divider spacing="md" />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Ionicons name="stop-circle" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              End Date
            </Text>
          </View>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {new Date(leave.endDate).toLocaleDateString()}
          </Text>
        </View>

        <Divider spacing="md" />

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Ionicons name="time" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Applied On
            </Text>
          </View>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {new Date(leave.appliedAt).toLocaleDateString()}
          </Text>
        </View>

        {leave.reason && (
          <>
            <Divider spacing="md" />
            <View style={styles.reasonSection}>
              <View style={styles.detailLeft}>
                <Ionicons name="chatbox" size={20} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Reason
                </Text>
              </View>
              <Text style={[styles.reasonText, { color: colors.text }]}>
                {leave.reason}
              </Text>
            </View>
          </>
        )}
      </Card>

      {/* Date Range Card */}
      <Card padding="lg" shadow="md" style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Date Range</Text>
        <View style={styles.dateRange}>
          <View style={styles.dateBox}>
            <Text style={[styles.dateDay, { color: colors.primary }]}>
              {new Date(leave.startDate).getDate()}
            </Text>
            <Text style={[styles.dateMonth, { color: colors.textSecondary }]}>
              {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short' })}
            </Text>
            <Text style={[styles.dateYear, { color: colors.textSecondary }]}>
              {new Date(leave.startDate).getFullYear()}
            </Text>
          </View>

          <View style={styles.dateArrow}>
            <Ionicons name="arrow-forward" size={24} color={colors.textTertiary} />
          </View>

          <View style={styles.dateBox}>
            <Text style={[styles.dateDay, { color: colors.primary }]}>
              {new Date(leave.endDate).getDate()}
            </Text>
            <Text style={[styles.dateMonth, { color: colors.textSecondary }]}>
              {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short' })}
            </Text>
            <Text style={[styles.dateYear, { color: colors.textSecondary }]}>
              {new Date(leave.endDate).getFullYear()}
            </Text>
          </View>
        </View>
      </Card>

      {/* Action Buttons */}
      {leave.status === 'PENDING' && (
        <Card padding="lg" shadow="md" style={styles.card}>
          <Button
            title="Cancel Leave Application"
            variant="danger"
            onPress={handleCancelLeave}
            loading={cancelling}
            disabled={cancelling}
            fullWidth
            size="lg"
            icon={<Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />}
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    gap: 8,
  },
  statusTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'right',
  },
  reasonSection: {
    gap: 12,
  },
  reasonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 24,
    marginTop: 6,
  },
  dateRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  dateBox: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  dateDay: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -1,
  },
  dateMonth: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
  dateYear: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    opacity: 0.7,
  },
  dateArrow: {
    paddingHorizontal: 16,
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

