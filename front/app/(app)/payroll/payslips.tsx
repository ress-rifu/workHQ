import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, Header } from '../../../components/layout';
import { Card, Badge, LoadingSpinner, Button } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { payrollService, Payslip } from '../../../services/payroll.service';

export default function PayslipsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await payrollService.getPayslips(12);

      if (response.success && response.data) {
        setPayslips(response.data);
      } else {
        setError(response.error || 'Failed to load payslips');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const groupPayslipsByYear = () => {
    const grouped: Record<number, Payslip[]> = {};

    payslips.forEach((payslip) => {
      if (!grouped[payslip.year]) {
        grouped[payslip.year] = [];
      }
      grouped[payslip.year].push(payslip);
    });

    // Sort years descending
    return Object.entries(grouped).sort(([a], [b]) => parseInt(b) - parseInt(a));
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <Screen safe>
        <Header title="Payslips" showBack />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <Button title="Retry" onPress={loadPayslips} style={styles.retryButton} />
        </View>
      </Screen>
    );
  }

  const groupedPayslips = groupPayslipsByYear();

  return (
    <Screen scrollable safe>
      <Header title="Payslips" showBack />

      {payslips.length === 0 ? (
        <Card padding="lg" shadow="sm">
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No payslips available yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Payslips will appear here once generated
            </Text>
          </View>
        </Card>
      ) : (
        groupedPayslips.map(([year, yearPayslips]) => (
          <View key={year} style={styles.yearSection}>
            <Text style={[styles.yearTitle, { color: colors.text }]}>{year}</Text>

            {yearPayslips.map((payslip) => (
              <TouchableOpacity
                key={payslip.id}
                onPress={() => router.push(`/payroll/${payslip.id}` as any)}
                activeOpacity={0.7}
              >
                <Card padding="md" shadow="sm" style={styles.payslipCard}>
                  <View style={styles.payslipHeader}>
                    <View style={styles.payslipInfo}>
                      <Text style={[styles.payslipMonth, { color: colors.text }]}>
                        {payrollService.getMonthName(payslip.salaryMonth)}
                      </Text>
                      <Text style={[styles.payslipDate, { color: colors.textSecondary }]}>
                        {new Date(payslip.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.payslipAmount}>
                      <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                        Net Pay
                      </Text>
                      <Text style={[styles.amountValue, { color: colors.primary }]}>
                        {payrollService.formatCurrency(payslip.netSalary)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.payslipDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar" size={16} color={colors.textTertiary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {payslip.workingDays} working days
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {payslip.presentDays} present
                      </Text>
                    </View>

                    {payslip.leaveDays > 0 && (
                      <View style={styles.detailItem}>
                        <Ionicons name="time" size={16} color={colors.warning} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                          {payslip.leaveDays} leave
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.viewButton}>
                    <Text style={[styles.viewButtonText, { color: colors.primary }]}>
                      View Details
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  yearSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  yearTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  payslipCard: {
    marginBottom: 20,
    borderRadius: 16,
  },
  payslipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  payslipInfo: {
    flex: 1,
  },
  payslipMonth: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.3,
  },
  payslipDate: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 4,
    opacity: 0.7,
  },
  payslipAmount: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  amountValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 4,
  },
  payslipDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  viewButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.7,
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



