import { prisma } from '../utils/prisma';
import { LeaveStatus } from '@prisma/client';
import { cache, cacheKeys, cacheTTL } from '../utils/cache';

interface ApplyLeaveData {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export const leaveService = {
  /**
   * Get all leave types (deduplicated by name)
   */
  async getLeaveTypes() {
    // Cache for 1 hour (static data)
    const cacheKey = cacheKeys.leaveTypes();
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const types = await prisma.leaveType.findMany({
      select: {
        id: true,
        name: true,
        maxPerYear: true,
        isPaid: true,
      },
      orderBy: { name: 'asc' },
      distinct: ['name'],
    });

    cache.set(cacheKey, types, cacheTTL.veryLong);
    return types;
  },

  /**
   * Get leave balances for an employee (deduplicated by leave type name)
   */
  async getLeaveBalances(employeeId: string) {
    // Cache for 5 minutes
    const cacheKey = cacheKeys.leaveBalances(employeeId);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const balances = await prisma.leaveBalance.findMany({
      where: { employeeId },
      select: {
        id: true,
        balanceDays: true,
        leaveType: {
          select: {
            id: true,
            name: true,
            maxPerYear: true,
            isPaid: true,
          },
        },
      },
      orderBy: {
        leaveType: {
          name: 'asc',
        },
      },
    });

    // Deduplicate by leave type name, keeping the first occurrence
    const seen = new Set<string>();
    const uniqueBalances = balances.filter((balance) => {
      if (seen.has(balance.leaveType.name)) {
        return false;
      }
      seen.add(balance.leaveType.name);
      return true;
    });

    cache.set(cacheKey, uniqueBalances, cacheTTL.medium);
    return uniqueBalances;
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
      select: {
        id: true,
        startDate: true,
        endDate: true,
        days: true,
        reason: true,
        status: true,
        appliedAt: true,
        decidedAt: true,
        remarks: true,
        leaveType: {
          select: {
            id: true,
            name: true,
            maxPerYear: true,
            isPaid: true,
          },
        },
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
      select: {
        id: true,
        startDate: true,
        endDate: true,
        days: true,
        reason: true,
        status: true,
        appliedAt: true,
        decidedAt: true,
        decidedBy: true,
        remarks: true,
        leaveType: {
          select: {
            id: true,
            name: true,
            maxPerYear: true,
            isPaid: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeCode: true,
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
      select: {
        id: true,
        startDate: true,
        endDate: true,
        days: true,
        reason: true,
        status: true,
        appliedAt: true,
        leaveType: {
          select: {
            id: true,
            name: true,
            maxPerYear: true,
            isPaid: true,
          },
        },
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
      select: {
        id: true,
        startDate: true,
        endDate: true,
        days: true,
        reason: true,
        status: true,
        appliedAt: true,
        leaveType: {
          select: {
            id: true,
            name: true,
            maxPerYear: true,
            isPaid: true,
          },
        },
      },
    });
  },
};

