import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, Header } from '../../../components/layout';
import { Card, Button, LoadingSpinner, Divider } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { payrollService, SalaryStructure, PayrollStats } from '../../../services/payroll.service';

export default function PayrollScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [salaryStructure, setSalaryStructure] = useState<SalaryStructure | null>(null);
  const [stats, setStats] = useState<PayrollStats | null>(null);
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

      const [salaryRes, statsRes] = await Promise.all([
        payrollService.getSalaryStructure(),
        payrollService.getStats(),
      ]);

      if (salaryRes.success && salaryRes.data) {
        setSalaryStructure(salaryRes.data);
      } else {
        setError(salaryRes.error || 'Salary structure not configured');
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !salaryStructure) {
    return (
      <Screen safe>
        <Header title="Payroll" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Salary data not available'}
          </Text>
          <Button title="Retry" onPress={loadData} style={styles.retryButton} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable safe padding={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payroll</Text>
          <Text style={styles.headerSubtitle}>Salary & Payslips</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Net Salary Card */}
        <Card padding="lg" shadow="lg" style={styles.salaryCard}>
          <View style={styles.salaryHeader}>
            <View>
              <Text style={[styles.salaryLabel, { color: colors.textSecondary }]}>
                Monthly Net Salary
              </Text>
              <Text style={[styles.salaryAmount, { color: colors.primary }]}>
                {payrollService.formatCurrency(salaryStructure.netSalary)}
              </Text>
            </View>
            <View style={[styles.salaryIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="cash" size={32} color={colors.primary} />
            </View>
          </View>
        </Card>

        {/* Salary Breakdown */}
        <Card padding="lg" shadow="md" style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Salary Breakdown</Text>

          {/* Earnings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>
              <Ionicons name="add-circle" size={16} /> Earnings
            </Text>

            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                Basic Salary
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {payrollService.formatCurrency(salaryStructure.basicSalary)}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                HRA (House Rent Allowance)
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {payrollService.formatCurrency(salaryStructure.hra)}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                Other Allowances
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {payrollService.formatCurrency(salaryStructure.allowances)}
              </Text>
            </View>

            <Divider spacing="sm" />

            <View style={styles.breakdownRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Gross Salary</Text>
              <Text style={[styles.totalValue, { color: colors.success }]}>
                {payrollService.formatCurrency(salaryStructure.grossSalary)}
              </Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              <Ionicons name="remove-circle" size={16} /> Deductions
            </Text>

            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                Tax & PF
              </Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>
                {payrollService.formatCurrency(salaryStructure.deductions)}
              </Text>
            </View>
          </View>

          <Divider spacing="md" />

          {/* Net Salary */}
          <View style={[styles.netSalaryRow, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.netLabel, { color: colors.primary }]}>Net Salary</Text>
            <Text style={[styles.netValue, { color: colors.primary }]}>
              {payrollService.formatCurrency(salaryStructure.netSalary)}
            </Text>
          </View>
        </Card>

        {/* Year Statistics */}
        {stats && stats.totalPayslips > 0 && (
          <Card padding="lg" shadow="md" style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {stats.year} Statistics
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.totalPayslips}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Payslips
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {payrollService.formatCurrency(stats.totalEarnings)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Earnings
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {payrollService.formatCurrency(stats.totalDeductions)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Deductions
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {payrollService.formatCurrency(stats.totalNetPay)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Net Pay
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* View Payslips Button */}
        <Button
          title="View All Payslips"
          onPress={() => router.push('/payroll/payslips' as any)}
          fullWidth
          size="lg"
          icon={<Ionicons name="document-text-outline" size={20} color="#FFFFFF" />}
          style={styles.payslipsButton}
        />

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.backgroundTertiary }]}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Payslips are generated at the end of each month
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
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
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.xs,
  },
  content: {
    padding: Spacing.md,
  },
  salaryCard: {
    marginBottom: Spacing.md,
  },
  salaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  salaryAmount: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    marginTop: Spacing.xs,
  },
  salaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  breakdownLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },
  breakdownValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  netSalaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
  },
  netLabel: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  netValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  payslipsButton: {
    marginBottom: Spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
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


