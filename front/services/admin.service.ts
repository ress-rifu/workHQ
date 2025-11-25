import { api } from './api';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'HR' | 'EMPLOYEE';
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    department: string | null;
    designation: string | null;
    joinDate: string;
    salary: number | null;
  };
}

export interface AdminLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  createdAt: string;
}

export interface AdminAttendance {
  id: string;
  employeeId: string;
  type: 'CHECKIN' | 'CHECKOUT';
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  employee: {
    user: {
      fullName: string;
      email: string;
      role: string;
    };
  };
  location: AdminLocation | null;
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role: 'EMPLOYEE' | 'HR';
  employeeCode?: string;
  department?: string;
  designation?: string;
  joinDate?: string;
  salary?: number;
}

export const adminService = {
  /**
   * Create a new user (Admin only)
   * Can create EMPLOYEE or HR users
   */
  async createUser(data: CreateUserData) {
    return api.post<AdminUser>('/admin/users', data);
  },

  /**
   * Get all users
   */
  async getAllUsers() {
    return api.get<AdminUser[]>('/admin/users');
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: 'ADMIN' | 'HR' | 'EMPLOYEE') {
    return api.put<AdminUser>(`/admin/users/${userId}/role`, { role });
  },

  /**
   * Delete user
   */
  async deleteUser(userId: string) {
    return api.delete(`/admin/users/${userId}`);
  },

  /**
   * Get all locations
   */
  async getAllLocations() {
    return api.get<AdminLocation[]>('/admin/locations');
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
    return api.post<AdminLocation>('/admin/locations', data);
  },

  /**
   * Update location
   */
  async updateLocation(id: string, data: Partial<{
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
  }>) {
    return api.put<AdminLocation>(`/admin/locations/${id}`, data);
  },

  /**
   * Delete location
   */
  async deleteLocation(id: string) {
    return api.delete(`/admin/locations/${id}`);
  },

  /**
   * Get all attendance records
   */
  async getAllAttendance(filters?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);

    const endpoint = params.toString() ? `/admin/attendance?${params}` : '/admin/attendance';
    return api.get<AdminAttendance[]>(endpoint);
  }
};
