import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Screen, SidebarToggle } from '../../../components/layout';
import { Card, Button, LoadingSpinner, Divider } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { payrollService, Payslip } from '../../../services/payroll.service';

export default function PayslipDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { profile } = useAuth();
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadPayslip();
    }
  }, [id]);

  const loadPayslip = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await payrollService.getPayslipById(id as string);

      if (response.success && response.data) {
        setPayslip(response.data);
      } else {
        setError(response.error || 'Failed to load payslip');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !payslip) {
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
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Payroll</Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Payslip Details</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Payslip not found'}
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
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Payroll</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Payslip Details</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Header Card */}
      <Card padding="lg" shadow="lg" style={styles.headerCard}>
        <View style={styles.cardHeaderContent}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="document-text" size={32} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerMonth, { color: colors.text }]}>
              {payrollService.getMonthName(payslip.salaryMonth)} {payslip.year}
            </Text>
            <Text style={[styles.headerDate, { color: colors.textSecondary }]}>
              Generated on {new Date(payslip.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <Divider spacing="md" />

        <View style={[styles.netSalaryBox, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.netLabel, { color: colors.primary }]}>Net Salary</Text>
          <Text style={[styles.netAmount, { color: colors.primary }]}>
            {payrollService.formatCurrency(payslip.netSalary)}
          </Text>
        </View>
      </Card>

      {/* Attendance Summary */}
      <Card padding="lg" shadow="md" style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Attendance Summary</Text>

        <View style={styles.attendanceGrid}>
          <View style={styles.attendanceItem}>
            <View style={[styles.attendanceIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <Ionicons name="calendar" size={24} color={colors.textSecondary} />
            </View>
            <Text style={[styles.attendanceValue, { color: colors.text }]}>
              {payslip.workingDays}
            </Text>
            <Text style={[styles.attendanceLabel, { color: colors.textSecondary }]}>
              Working Days
            </Text>
          </View>

          <View style={styles.attendanceItem}>
            <View style={[styles.attendanceIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
            <Text style={[styles.attendanceValue, { color: colors.text }]}>
              {payslip.presentDays}
            </Text>
            <Text style={[styles.attendanceLabel, { color: colors.textSecondary }]}>
              Present
            </Text>
          </View>

          <View style={styles.attendanceItem}>
            <View style={[styles.attendanceIcon, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="time" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.attendanceValue, { color: colors.text }]}>
              {payslip.leaveDays}
            </Text>
            <Text style={[styles.attendanceLabel, { color: colors.textSecondary }]}>
              Leave
            </Text>
          </View>
        </View>
      </Card>

      {/* Earnings */}
      <Card padding="lg" shadow="md" style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          <Ionicons name="add-circle" size={18} color={colors.success} /> Earnings
        </Text>

        <View style={styles.salaryRow}>
          <Text style={[styles.salaryLabel, { color: colors.text }]}>Basic Salary</Text>
          <Text style={[styles.salaryValue, { color: colors.text }]}>
            {payrollService.formatCurrency(payslip.basicSalary)}
          </Text>
        </View>

        <View style={styles.salaryRow}>
          <Text style={[styles.salaryLabel, { color: colors.text }]}>
            HRA (House Rent Allowance)
          </Text>
          <Text style={[styles.salaryValue, { color: colors.text }]}>
            {payrollService.formatCurrency(payslip.hra)}
          </Text>
        </View>

        <View style={styles.salaryRow}>
          <Text style={[styles.salaryLabel, { color: colors.text }]}>Other Allowances</Text>
          <Text style={[styles.salaryValue, { color: colors.text }]}>
            {payrollService.formatCurrency(payslip.allowances)}
          </Text>
        </View>

        <Divider spacing="sm" />

        <View style={styles.salaryRow}>
          <Text style={[styles.totalLabel, { color: colors.success }]}>Total Earnings</Text>
          <Text style={[styles.totalValue, { color: colors.success }]}>
            {payrollService.formatCurrency(payslip.grossSalary)}
          </Text>
        </View>
      </Card>

      {/* Deductions */}
      <Card padding="lg" shadow="md" style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          <Ionicons name="remove-circle" size={18} color={colors.error} /> Deductions
        </Text>

        <View style={styles.salaryRow}>
          <Text style={[styles.salaryLabel, { color: colors.text }]}>Tax & PF</Text>
          <Text style={[styles.salaryValue, { color: colors.text }]}>
            {payrollService.formatCurrency(payslip.deductions)}
          </Text>
        </View>

        <Divider spacing="sm" />

        <View style={styles.salaryRow}>
          <Text style={[styles.totalLabel, { color: colors.error }]}>Total Deductions</Text>
          <Text style={[styles.totalValue, { color: colors.error }]}>
            {payrollService.formatCurrency(payslip.deductions)}
          </Text>
        </View>
      </Card>

      {/* Net Salary Summary */}
      <Card padding="lg" shadow="lg" style={styles.card}>
        <View style={[styles.finalSummary, { backgroundColor: colors.primary }]}>
          <Text style={styles.finalLabel}>Net Salary</Text>
          <Text style={styles.finalAmount}>
            {payrollService.formatCurrency(payslip.netSalary)}
          </Text>
          <Text style={styles.finalSubtext}>
            Amount to be credited to your bank account
          </Text>
        </View>
      </Card>

      {/* Employee Info */}
      {payslip.employee && (
        <Card padding="lg" shadow="md" style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Employee Information</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {payslip.employee.user.fullName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Employee Code
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {payslip.employee.employeeCode}
            </Text>
          </View>

          {payslip.employee.department && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Department
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {payslip.employee.department}
              </Text>
            </View>
          )}

          {payslip.employee.designation && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Designation
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {payslip.employee.designation}
              </Text>
            </View>
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    marginBottom: 24,
    borderRadius: 20,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerMonth: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  headerDate: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 4,
    opacity: 0.75,
  },
  netSalaryBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  netLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.2,
  },
  netAmount: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    marginTop: 8,
    letterSpacing: -1,
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
  attendanceGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  attendanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  attendanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendanceValue: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  attendanceLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  salaryLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },
  salaryValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  totalValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  finalSummary: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  finalLabel: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.4,
  },
  finalAmount: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    marginTop: 12,
    letterSpacing: -1.2,
  },
  finalSubtext: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
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
});

