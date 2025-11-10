import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, AppHeader } from '../../../components/layout';
import { Card, Badge, LoadingSpinner, Button } from '../../../components/ui';
import { Typography, Spacing, radius } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { hrService, LeaveRequest } from '../../../services/hr.service';

export default function LeaveRequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();

  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await hrService.getLeaveRequestById(id as string);

      if (response.success && response.data) {
        setRequest(response.data);
      }
    } catch (err) {
      console.error('Failed to load leave request:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const handleApprove = () => {
    Alert.alert(
      'Approve Leave Request',
      'Are you sure you want to approve this leave request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              setProcessing(true);
              const response = await hrService.approveLeave(id as string);

              if (response.success) {
                Alert.alert('Success', 'Leave request approved successfully', [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert('Error', response.error || 'Failed to approve leave request');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to approve leave request');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Leave Request',
      'Are you sure you want to reject this leave request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const response = await hrService.rejectLeave(id as string);

              if (response.success) {
                Alert.alert('Success', 'Leave request rejected', [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert('Error', response.error || 'Failed to reject leave request');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to reject leave request');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!request) {
    return (
      <Screen safe={false} padding hasHeader>
        <AppHeader title="Leave Request" showBack />
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Leave request not found
          </Text>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: Spacing.lg }} />
        </View>
      </Screen>
    );
  }

  const isPending = request.status === 'PENDING';

  return (
    <Screen safe={false} padding={false} hasHeader>
      <AppHeader title="Leave Request" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <Badge label={request.status} variant={getStatusVariant(request.status)} size="lg" />
        </View>

        {/* Employee Info */}
        <Card padding="lg" shadow="md" style={styles.card}>
          <View style={styles.employeeHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {request.employee.user.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.employeeDetails}>
              <Text style={[styles.employeeName, { color: colors.text }]}>
                {request.employee.user.fullName}
              </Text>
              <Text style={[styles.employeeEmail, { color: colors.textSecondary }]}>
                {request.employee.user.email}
              </Text>
              <Text style={[styles.employeeCode, { color: colors.textSecondary }]}>
                Code: {request.employee.employeeCode}
              </Text>
            </View>
          </View>
        </Card>

        {/* Leave Details */}
        <Card padding="lg" shadow="md" style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Leave Details</Text>
          
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="bookmark" size={20} color={colors.info} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Leave Type
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {request.leaveType.name}
                {request.leaveType.isPaid ? ' (Paid)' : ' (Unpaid)'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="calendar" size={20} color={colors.success} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Start Date
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(request.startDate)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.errorLight }]}>
              <Ionicons name="calendar" size={20} color={colors.error} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                End Date
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(request.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="time" size={20} color={colors.warning} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Duration
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {request.days} working day{request.days !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="create" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Applied On
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDateTime(request.appliedAt)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Reason */}
        {request.reason && (
          <Card padding="lg" shadow="md" style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reason</Text>
            <Text style={[styles.reasonText, { color: colors.text }]}>
              {request.reason}
            </Text>
          </Card>
        )}

        {/* Decision Details (if already decided) */}
        {request.decidedAt && (
          <Card padding="lg" shadow="md" style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Decision</Text>
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.infoLight }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.info} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Decided On
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDateTime(request.decidedAt)}
                </Text>
              </View>
            </View>
            {request.remarks && (
              <>
                <Text style={[styles.remarksLabel, { color: colors.textSecondary }]}>
                  Remarks:
                </Text>
                <Text style={[styles.remarksText, { color: colors.text }]}>
                  {request.remarks}
                </Text>
              </>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        {isPending && (
          <View style={styles.actionsContainer}>
            <Button
              title="Approve"
              onPress={handleApprove}
              disabled={processing}
              loading={processing}
              variant="primary"
              icon={<Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
              fullWidth
            />
            <Button
              title="Reject"
              onPress={handleReject}
              disabled={processing}
              variant="outline"
              icon={<Ionicons name="close-circle" size={20} color={colors.primary} />}
              fullWidth
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl + Spacing.xxl,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  employeeDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  employeeName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  employeeEmail: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xs,
  },
  employeeCode: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    marginTop: 2,
  },
  reasonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  remarksLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  remarksText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  actionsContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginTop: Spacing.lg,
  },
});
