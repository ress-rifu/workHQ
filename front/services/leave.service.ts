import { api } from './api';

export interface LeaveType {
  id: string;
  name: string;
  maxPerYear?: number;
  isPaid: boolean;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  balanceDays: number;
  leaveType: LeaveType;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Leave {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  appliedAt: string;
  decidedBy?: string;
  leaveType: LeaveType;
}

export interface ApplyLeaveData {
  leaveTypeId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  reason?: string;
}

export const leaveService = {
  /**
   * Get all leave types
   */
  async getLeaveTypes() {
    return api.get<LeaveType[]>('/leave/types');
  },

  /**
   * Get leave balances for current user
   */
  async getLeaveBalances() {
    return api.get<LeaveBalance[]>('/leave/balances');
  },

  /**
   * Get leave applications for current user
   */
  async getLeaveApplications(status?: LeaveStatus) {
    const endpoint = status 
      ? `/leave/applications?status=${status}` 
      : '/leave/applications';
    return api.get<Leave[]>(endpoint);
  },

  /**
   * Get a single leave application
   */
  async getLeaveApplication(id: string) {
    return api.get<Leave>(`/leave/applications/${id}`);
  },

  /**
   * Apply for leave
   */
  async applyLeave(data: ApplyLeaveData) {
    return api.post<Leave>('/leave/apply', data);
  },

  /**
   * Cancel a leave application
   */
  async cancelLeave(id: string) {
    return api.put<Leave>(`/leave/applications/${id}/cancel`, {});
  },
};

