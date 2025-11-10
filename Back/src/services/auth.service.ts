import { supabaseAdmin } from '../utils/supabase';
import prisma from '../utils/prisma';
import { Role } from '@prisma/client';

interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
  employeeCode?: string;
  department?: string;
  designation?: string;
  joinDate?: Date;
  salary?: number;
}

interface UserResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    avatarUrl: string | null;
    employee?: {
      id: string;
      employeeCode: string;
      department: string | null;
      designation: string | null;
      joinDate: Date;
      salary: number | null;
    };
  };
  message: string;
}

/**
 * Create a new user in Supabase Auth and database
 */
export const createUser = async (input: CreateUserInput): Promise<UserResponse> => {
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: input.fullName,
        role: input.role || Role.EMPLOYEE
      }
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    // Create user in database
    const dbUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: input.email,
        fullName: input.fullName,
        role: input.role || Role.EMPLOYEE,
        avatarUrl: null
      }
    });

    // Create employee record if employee code provided
    let employee;
    if (input.employeeCode) {
      employee = await prisma.employee.create({
        data: {
          userId: dbUser.id,
          employeeCode: input.employeeCode,
          department: input.department || null,
          designation: input.designation || null,
          joinDate: input.joinDate || new Date(),
          salary: input.salary || null
        }
      });
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        role: dbUser.role,
        avatarUrl: dbUser.avatarUrl,
        employee: employee ? {
          id: employee.id,
          employeeCode: employee.employeeCode,
          department: employee.department,
          designation: employee.designation,
          joinDate: employee.joinDate,
          salary: employee.salary
        } : undefined
      },
      message: 'User created successfully'
    };
  } catch (error: any) {
    console.error('Create user error:', error);
    throw new Error(error.message || 'Failed to create user');
  }
};

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string) => {
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

  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, data: {
  fullName?: string;
  avatarUrl?: string;
}) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
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

  return user;
};

/**
 * Delete user (soft delete by setting inactive)
 */
export const deleteUser = async (userId: string) => {
  // Delete from Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  
  if (error) {
    throw new Error(`Failed to delete auth user: ${error.message}`);
  }

  // Delete from database
  await prisma.user.delete({
    where: { id: userId }
  });

  return { message: 'User deleted successfully' };
};

