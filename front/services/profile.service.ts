import { api } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'HR' | 'EMPLOYEE';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

export interface Employee {
  id: string;
  userId: string;
  employeeCode: string;
  department?: string;
  designation?: string;
  joinDate: string;
  salary?: number;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  balanceDays: number;
  leaveType: {
    id: string;
    name: string;
    maxPerYear?: number;
    isPaid: boolean;
  };
}

export interface ProfileStats {
  leaveBalances: LeaveBalance[];
  attendanceThisMonth: number;
  pendingLeaves: number;
  totalLeaveBalance: number;
}

export interface UpdateProfileData {
  fullName?: string;
  avatarUrl?: string;
  department?: string;
  designation?: string;
}

export const profileService = {
  /**
   * Get user profile
   */
  async getProfile() {
    return api.get<User>('/profile');
  },

  /**
   * Get profile statistics
   */
  async getProfileStats() {
    return api.get<ProfileStats>('/profile/stats');
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData) {
    return api.put<User>('/profile', data);
  },
};

