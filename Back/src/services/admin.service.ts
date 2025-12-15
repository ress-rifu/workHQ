import { prisma } from '../utils/prisma';
import { supabaseAdmin } from '../utils/supabase';
import { Role } from '@prisma/client';
import { createUser } from './auth.service';

export const adminService = {
  /**
   * Create a new user (Admin only)
   * Can create EMPLOYEE or HR users
   */
  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: 'EMPLOYEE' | 'HR';
    employeeCode?: string;
    department?: string;
    designation?: string;
    joinDate?: Date;
    salary?: number;
  }) {
    // Only allow creating EMPLOYEE or HR users
    if (data.role !== 'EMPLOYEE' && data.role !== 'HR') {
      throw new Error('Only EMPLOYEE and HR users can be created');
    }

    return await createUser({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: data.role as Role,
      employeeCode: data.employeeCode,
      department: data.department,
      designation: data.designation,
      joinDate: data.joinDate,
      salary: data.salary
    });
  },

  /**
   * Get all users (Admin only)
   * Syncs Supabase Auth users with database
   */
  async getAllUsers() {
    // Get users from Supabase Auth
    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching auth users:', error);
      // Fallback to database only
      return await prisma.user.findMany({
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
              salary: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Sync auth users to database if missing
    for (const authUser of authUsers.users) {
      const existingUser = await prisma.user.findUnique({
        where: { id: authUser.id }
      });

      if (!existingUser) {
        // Create missing user in database
        const metadata = authUser.user_metadata || {};
        try {
          await prisma.user.create({
            data: {
              id: authUser.id,
              email: authUser.email || '',
              fullName: metadata.full_name || metadata.name || authUser.email?.split('@')[0] || 'Unknown',
              role: (metadata.role as Role) || 'EMPLOYEE',
              avatarUrl: metadata.avatar_url || null
            }
          });
        } catch (e) {
          // Ignore duplicate errors
          console.error('Error syncing user:', e);
        }
      }
    }

    // Now fetch all users from database with employee data
    return await prisma.user.findMany({
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
            salary: true
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
