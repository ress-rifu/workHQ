import { View, Text, StyleSheet, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Screen, AppHeader, SidebarToggle } from '../../../components/layout';
import { Card, Button, LoadingSpinner, Divider } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { payrollService, SalaryStructure, PayrollStats } from '../../../services/payroll.service';

export default function PayrollScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile } = useAuth();
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

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
      <Screen safe hasHeader>
        <AppHeader title="Payroll" subtitle="Your salary & earnings" />
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
    <Screen safe padding={false}>
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <SidebarToggle />
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Payroll</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Salary overview</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: colors.border }]}
            onPress={() => router.push('/payroll/payslips' as any)}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
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
  salaryCard: {
    marginBottom: 24,
    borderRadius: 20,
  },
  salaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  salaryLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.2,
  },
  salaryAmount: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    marginTop: 4,
    letterSpacing: -1,
  },
  salaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 12,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  breakdownLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },
  breakdownValue: {
    fontSize: Typography.fontSize.base,
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
    padding: 20,
    borderRadius: 16,
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
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 4,
    textAlign: 'center',
  },
  payslipsButton: {
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    flex: 1,
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


