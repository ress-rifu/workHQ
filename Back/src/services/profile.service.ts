import { prisma } from '../utils/prisma';
import { Role } from '@prisma/client';

interface UpdateProfileData {
  fullName?: string;
  avatarUrl?: string;
  department?: string;
  designation?: string;
}

export const profileService = {
  /**
   * Get user profile with employee details
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData) {
    const { fullName, avatarUrl, department, designation } = data;

    // Update User table
    const userUpdateData: any = {};
    if (fullName !== undefined) userUpdateData.fullName = fullName;
    if (avatarUrl !== undefined) userUpdateData.avatarUrl = avatarUrl;

    const user = await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
      include: {
        employee: true,
      },
    });

    // Update Employee table if user has employee record
    if (user.employee) {
      const employeeUpdateData: any = {};
      if (department !== undefined) employeeUpdateData.department = department;
      if (designation !== undefined) employeeUpdateData.designation = designation;

      if (Object.keys(employeeUpdateData).length > 0) {
        await prisma.employee.update({
          where: { userId: userId },
          data: employeeUpdateData,
        });

        // Fetch updated user with employee
        return await prisma.user.findUnique({
          where: { id: userId },
          include: {
            employee: true,
          },
        });
      }
    }

    return user;
  },

  /**
   * Get user statistics for profile dashboard
   */
  async getProfileStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
      },
    });

    if (!user || !user.employee) {
      return null;
    }

    // Get leave balance
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: user.employee.id,
      },
      include: {
        leaveType: true,
      },
    });

    // Get attendance count (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const attendanceCount = await prisma.attendance.count({
      where: {
        employeeId: user.employee.id,
        timestamp: {
          gte: startOfMonth,
        },
        type: 'CHECKIN',
      },
    });

    // Get pending leaves count
    const pendingLeavesCount = await prisma.leave.count({
      where: {
        employeeId: user.employee.id,
        status: 'PENDING',
      },
    });

    // Calculate total leave balance
    const totalLeaveBalance = leaveBalances.reduce(
      (sum: number, balance: any) => sum + balance.balanceDays,
      0
    );

    return {
      leaveBalances,
      attendanceThisMonth: attendanceCount,
      pendingLeaves: pendingLeavesCount,
      totalLeaveBalance,
    };
  },
};

