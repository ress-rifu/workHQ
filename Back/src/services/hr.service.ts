import { prisma } from '../utils/prisma';
import { LeaveStatus } from '@prisma/client';

export const hrService = {
  /**
   * Get all pending leave requests
   */
  async getPendingLeaveRequests() {
    const leaves = await prisma.leave.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        leaveType: true,
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return leaves;
  },

  /**
   * Get all leave requests with optional filters
   */
  async getAllLeaveRequests(status?: LeaveStatus, employeeId?: string) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        employee: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        leaveType: true,
      },
      orderBy: {
        appliedAt: 'desc',
      },
      take: 100,
    });

    return leaves;
  },

  /**
   * Get single leave request details
   */
  async getLeaveRequestById(leaveId: string) {
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        employee: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        leaveType: true,
      },
    });

    return leave;
  },

  /**
   * Approve leave request
   */
  async approveLeave(leaveId: string, remarks?: string) {
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new Error('Leave request is not pending');
    }

    // Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: 'APPROVED',
        remarks,
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        leaveType: true,
      },
    });

    // Update leave balance
    const leaveBalance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId: leave.employeeId,
        leaveTypeId: leave.leaveTypeId,
      },
    });

    if (leaveBalance) {
      await prisma.leaveBalance.update({
        where: { id: leaveBalance.id },
        data: {
          balanceDays: {
            decrement: leave.days,
          },
        },
      });
    }

    return updatedLeave;
  },

  /**
   * Reject leave request
   */
  async rejectLeave(leaveId: string, remarks?: string) {
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new Error('Leave request is not pending');
    }

    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: 'REJECTED',
        remarks,
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        leaveType: true,
      },
    });

    return updatedLeave;
  },

  /**
   * Get all employees
   */
  async getAllEmployees() {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return employees;
  },

  /**
   * Get employee details
   */
  async getEmployeeById(employeeId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    return employee;
  },

  /**
   * Update employee details
   */
  async updateEmployee(
    employeeId: string,
    data: {
      department?: string;
      designation?: string;
      salary?: number;
    }
  ) {
    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    return employee;
  },

  /**
   * Get employee attendance records
   */
  async getEmployeeAttendance(
    employeeId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = { employeeId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        location: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });

    return attendance;
  },

  /**
   * Get HR statistics
   */
  async getHRStats() {
    const [
      totalEmployees,
      pendingLeaves,
      todayAttendance,
      totalLeaveRequests,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.leave.count({
        where: { status: 'PENDING' },
      }),
      prisma.attendance.count({
        where: {
          type: 'CHECKIN',
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.leave.count({
        where: {
          appliedAt: {
            gte: new Date(new Date().setDate(1)), // This month
          },
        },
      }),
    ]);

    return {
      totalEmployees,
      pendingLeaves,
      todayAttendance,
      totalLeaveRequests,
    };
  },
};

