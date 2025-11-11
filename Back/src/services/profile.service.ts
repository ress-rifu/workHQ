import { prisma } from '../utils/prisma';
import { Role } from '@prisma/client';
import { cache, cacheKeys, cacheTTL } from '../utils/cache';

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
    // Check cache first
    const cacheKey = cacheKeys.userProfile(userId);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            department: true,
            designation: true,
            joinDate: true,
            salary: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Cache for 5 minutes
    cache.set(cacheKey, user, cacheTTL.medium);
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
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            department: true,
            designation: true,
            joinDate: true,
            salary: true,
          },
        },
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
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
            employee: {
              select: {
                id: true,
                employeeCode: true,
                department: true,
                designation: true,
                joinDate: true,
                salary: true,
              },
            },
          },
        });

        // Invalidate cache
        cache.delete(cacheKeys.userProfile(userId));
        if (user.employee?.id) {
          cache.delete(cacheKeys.employeeStats(user.employee.id));
        }

        return updatedUser;
      }
    }

    // Invalidate cache
    cache.delete(cacheKeys.userProfile(userId));
    if (user.employee?.id) {
      cache.delete(cacheKeys.employeeStats(user.employee.id));
    }

    return user;
  },

  /**
   * Get user statistics for profile dashboard
   */
  async getProfileStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        employee: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user || !user.employee) {
      return null;
    }

    // Check cache first (1 minute cache for stats)
    const cacheKey = cacheKeys.employeeStats(user.employee.id);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Get leave balance - only fetch needed fields
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: user.employee.id,
      },
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

    const stats = {
      leaveBalances,
      attendanceThisMonth: attendanceCount,
      pendingLeaves: pendingLeavesCount,
      totalLeaveBalance,
    };

    // Cache for 1 minute (frequently changing data)
    cache.set(cacheKey, stats, cacheTTL.short);
    return stats;
  },
};

