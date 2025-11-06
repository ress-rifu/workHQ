import { api } from './api';

export interface SalaryStructure {
  employeeId: string;
  employeeCode: string;
  department?: string;
  designation?: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  effectiveFrom: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  year: number;
  salaryMonth: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  createdAt: string;
  employee?: {
    employeeCode: string;
    department?: string;
    designation?: string;
    user: {
      fullName: string;
      email: string;
    };
  };
}

export interface PayrollStats {
  year: number;
  totalPayslips: number;
  totalEarnings: number;
  totalDeductions: number;
  totalNetPay: number;
  averageNetPay: number;
}

export const payrollService = {
  /**
   * Get salary structure
   */
  async getSalaryStructure() {
    return apiRequest<SalaryStructure>('/payroll/salary');
  },

  /**
   * Get all payslips
   */
  async getPayslips(limit?: number) {
    const endpoint = limit ? `/payroll/payslips?limit=${limit}` : '/payroll/payslips';
    return apiRequest<Payslip[]>(endpoint);
  },

  /**
   * Get single payslip by ID
   */
  async getPayslipById(id: string) {
    return apiRequest<Payslip>(`/payroll/payslips/${id}`);
  },

  /**
   * Get payroll statistics
   */
  async getStats() {
    return apiRequest<PayrollStats>('/payroll/stats');
  },

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Get month name
   */
  getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1] || '';
  },

  /**
   * Get short month name
   */
  getShortMonthName(month: number): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[month - 1] || '';
  },
};

