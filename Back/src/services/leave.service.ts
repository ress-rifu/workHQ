import { prisma } from '../utils/prisma';
import { LeaveStatus } from '@prisma/client';

interface ApplyLeaveData {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export const leaveService = {
  /**
   * Get all leave types
   */
  async getLeaveTypes() {
    return await prisma.leaveType.findMany({
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Get leave balances for an employee
   */
  async getLeaveBalances(employeeId: string) {
    return await prisma.leaveBalance.findMany({
      where: { employeeId },
      include: {
        leaveType: true,
      },
      orderBy: {
        leaveType: {
          name: 'asc',
        },
      },
    });
  },

  /**
   * Get leave applications for an employee
   */
  async getLeaveApplications(employeeId: string, status?: LeaveStatus) {
    const where: any = { employeeId };
    
    if (status) {
      where.status = status;
    }

    return await prisma.leave.findMany({
      where,
      include: {
        leaveType: true,
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });
  },

  /**
   * Get a single leave application
   */
  async getLeaveApplication(leaveId: string, employeeId: string) {
    return await prisma.leave.findFirst({
      where: {
        id: leaveId,
        employeeId,
      },
      include: {
        leaveType: true,
        employee: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  /**
   * Calculate number of days between two dates (excluding weekends)
   */
  calculateLeaveDays(startDate: Date, endDate: Date): number {
    let days = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Count only weekdays (Monday = 1, Friday = 5)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
  },

  /**
   * Apply for leave
   */
  async applyLeave(employeeId: string, data: ApplyLeaveData) {
    const { leaveTypeId, startDate, endDate, reason } = data;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      throw new Error('Start date cannot be in the past');
    }

    if (end < start) {
      throw new Error('End date must be after start date');
    }

    // Calculate leave days
    const days = this.calculateLeaveDays(start, end);

    if (days === 0) {
      throw new Error('No working days in the selected date range');
    }

    // Check leave balance
    const leaveBalance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        leaveTypeId,
      },
    });

    if (!leaveBalance) {
      throw new Error('Leave balance not found for this leave type');
    }

    if (leaveBalance.balanceDays < days) {
      throw new Error(
        `Insufficient leave balance. Available: ${leaveBalance.balanceDays} days, Requested: ${days} days`
      );
    }

    // Check for overlapping leaves
    const overlappingLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } },
            ],
          },
        ],
      },
    });

    if (overlappingLeaves.length > 0) {
      throw new Error('You already have a leave request for overlapping dates');
    }

    // Create leave application
    const leave = await prisma.leave.create({
      data: {
        employeeId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: 'PENDING',
      },
      include: {
        leaveType: true,
      },
    });

    return leave;
  },

  /**
   * Cancel a pending leave application
   */
  async cancelLeave(leaveId: string, employeeId: string) {
    const leave = await prisma.leave.findFirst({
      where: {
        id: leaveId,
        employeeId,
      },
    });

    if (!leave) {
      throw new Error('Leave application not found');
    }

    if (leave.status !== 'PENDING') {
      throw new Error('Only pending leave applications can be cancelled');
    }

    return await prisma.leave.update({
      where: { id: leaveId },
      data: { status: 'CANCELLED' },
      include: {
        leaveType: true,
      },
    });
  },
};

