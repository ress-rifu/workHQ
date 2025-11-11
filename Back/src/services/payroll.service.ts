import { prisma } from '../utils/prisma';
import { cache, cacheKeys, cacheTTL } from '../utils/cache';

export const payrollService = {
  /**
   * Get employee's salary structure
   */
  async getSalaryStructure(employeeId: string) {
    // Cache for 15 minutes (rarely changes)
    const cacheKey = cacheKeys.salaryStructure(employeeId);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Get employee details including salary
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        employeeCode: true,
        department: true,
        designation: true,
        salary: true,
        joinDate: true,
      },
    });

    if (!employee || !employee.salary) {
      return null;
    }

    // Calculate salary components
    const basicSalary = employee.salary * 0.5; // 50% of total salary
    const hra = employee.salary * 0.2; // 20% HRA
    const allowances = employee.salary * 0.2; // 20% Allowances
    const deductions = employee.salary * 0.1; // 10% Deductions (PF, Tax, etc.)
    const netSalary = employee.salary - deductions;

    const result = {
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      department: employee.department,
      designation: employee.designation,
      basicSalary,
      hra,
      allowances,
      deductions,
      grossSalary: employee.salary,
      netSalary,
      effectiveFrom: employee.joinDate,
    };

    cache.set(cacheKey, result, cacheTTL.long);
    return result;
  },

  /**
   * Get employee's payslips
   */
  async getPayslips(employeeId: string, limit: number = 12) {
    // Cache for 5 minutes
    const cacheKey = cacheKeys.payslips(employeeId);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const payslips = await prisma.payslip.findMany({
      where: { employeeId },
      select: {
        id: true,
        month: true,
        year: true,
        basicSalary: true,
        hra: true,
        allowances: true,
        deductions: true,
        grossSalary: true,
        netSalary: true,
        workingDays: true,
        presentDays: true,
        leaveDays: true,
        status: true,
        createdAt: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: limit,
    });

    cache.set(cacheKey, payslips, cacheTTL.medium);
    return payslips;
  },

  /**
   * Get single payslip by ID
   */
  async getPayslipById(payslipId: string, employeeId: string) {
    const payslip = await prisma.payslip.findFirst({
      where: {
        id: payslipId,
        employeeId,
      },
      include: {
        employee: {
          select: {
            employeeCode: true,
            department: true,
            designation: true,
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return payslip;
  },

  /**
   * Calculate working days in a month
   */
  calculateWorkingDaysInMonth(year: number, month: number): number {
    const date = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= lastDay; day++) {
      date.setDate(day);
      const dayOfWeek = date.getDay();
      // Count weekdays (Monday-Friday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  },

  /**
   * Get employee attendance for a specific month
   */
  async getMonthlyAttendance(employeeId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        type: 'CHECKIN',
      },
    });

    return attendance.length;
  },

  /**
   * Get employee leaves for a specific month
   */
  async getMonthlyLeaves(employeeId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const leaves = await prisma.leave.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
    });

    // Calculate total leave days in this month
    let totalLeaveDays = 0;
    leaves.forEach((leave) => {
      const leaveStart = leave.startDate > startDate ? leave.startDate : startDate;
      const leaveEnd = leave.endDate < endDate ? leave.endDate : endDate;
      
      // Count working days between start and end
      const days = this.countWorkingDays(leaveStart, leaveEnd);
      totalLeaveDays += days;
    });

    return totalLeaveDays;
  },

  /**
   * Count working days between two dates
   */
  countWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  },

  /**
   * Generate payslip for an employee for a specific month
   * (This would typically be called by HR/Admin)
   */
  async generatePayslip(
    employeeId: string,
    year: number,
    month: number
  ) {
    // Get employee salary
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { salary: true },
    });

    if (!employee || !employee.salary) {
      throw new Error('Employee salary not configured');
    }

    // Check if payslip already exists
    const existing = await prisma.payslip.findFirst({
      where: {
        employeeId,
        year,
        month: month,
      },
    });

    if (existing) {
      throw new Error('Payslip already exists for this month');
    }

    // Calculate salary components
    const basicSalary = employee.salary * 0.5;
    const hra = employee.salary * 0.2;
    const allowances = employee.salary * 0.2;
    const deductions = employee.salary * 0.1;
    const grossSalary = employee.salary;

    // Get attendance and leave data
    const workingDays = this.calculateWorkingDaysInMonth(year, month);
    const presentDays = await this.getMonthlyAttendance(employeeId, year, month);
    const leaveDays = await this.getMonthlyLeaves(employeeId, year, month);

    // Calculate actual salary based on attendance
    const totalPaidDays = presentDays + leaveDays;
    const salaryPerDay = grossSalary / workingDays;
    const actualGrossSalary = salaryPerDay * totalPaidDays;
    const actualDeductions = (actualGrossSalary / grossSalary) * deductions;
    const netSalary = actualGrossSalary - actualDeductions;

    // Create payslip
    const payslip = await prisma.payslip.create({
      data: {
        employeeId,
        year,
        month: month,
        basicSalary: (actualGrossSalary / grossSalary) * basicSalary,
        hra: (actualGrossSalary / grossSalary) * hra,
        allowances: (actualGrossSalary / grossSalary) * allowances,
        deductions: actualDeductions,
        grossSalary: actualGrossSalary,
        netSalary,
        workingDays,
        presentDays,
        leaveDays,
      },
    });

    return payslip;
  },

  /**
   * Get payroll statistics
   */
  async getPayrollStats(employeeId: string) {
    const currentYear = new Date().getFullYear();
    
    // Get all payslips for current year
    const payslips = await prisma.payslip.findMany({
      where: {
        employeeId,
        year: currentYear,
      },
      orderBy: { month: 'asc' },
    });

    const totalEarnings = payslips.reduce((sum, p) => sum + p.grossSalary, 0);
    const totalDeductions = payslips.reduce((sum, p) => sum + p.deductions, 0);
    const totalNetPay = payslips.reduce((sum, p) => sum + p.netSalary, 0);

    return {
      year: currentYear,
      totalPayslips: payslips.length,
      totalEarnings,
      totalDeductions,
      totalNetPay,
      averageNetPay: payslips.length > 0 ? totalNetPay / payslips.length : 0,
    };
  },
};

