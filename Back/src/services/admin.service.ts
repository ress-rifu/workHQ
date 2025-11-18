import { prisma } from '../utils/prisma';
import { Role } from '@prisma/client';

export const adminService = {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            department: true,
            designation: true,
            joinDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, role: Role) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  },

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: string) {
    // Delete employee first if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true }
    });

    if (user?.employee) {
      await prisma.employee.delete({
        where: { id: user.employee.id }
      });
    }

    return await prisma.user.delete({
      where: { id: userId }
    });
  },

  /**
   * Get all locations
   */
  async getAllLocations() {
    return await prisma.location.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Create location
   */
  async createLocation(data: {
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
  }) {
    return await prisma.location.create({
      data
    });
  },

  /**
   * Update location
   */
  async updateLocation(id: string, data: {
    name?: string;
    latitude?: number;
    longitude?: number;
    radiusMeters?: number;
  }) {
    return await prisma.location.update({
      where: { id },
      data
    });
  },

  /**
   * Delete location
   */
  async deleteLocation(id: string) {
    return await prisma.location.delete({
      where: { id }
    });
  },

  /**
   * Get all attendance (for viewing check-ins)
   */
  async getAllAttendance(filters?: {
    startDate?: Date;
    endDate?: Date;
    employeeId?: string;
  }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    return await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                role: true
              }
            }
          }
        },
        location: true
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
  }
};
