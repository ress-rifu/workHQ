/**
 * HR Service - Leave Request Management
 */

import { api } from './api';

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedAt: string;
  decidedAt: string | null;
  remarks: string | null;
  employee: {
    id: string;
    employeeCode: string;
    user: {
      fullName: string;
      email: string;
    };
  };
  leaveType: {
    id: string;
    name: string;
    maxPerYear: number;
    isPaid: boolean;
  };
}

export interface HRStats {
  totalEmployees: number;
  pendingLeaves: number;
  todayAttendance: number;
  totalLeaveRequests: number;
}

export const hrService = {
  /**
   * Get all leave requests
   */
  async getLeaveRequests(status?: string, employeeId?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (employeeId) params.append('employeeId', employeeId);
    
    const query = params.toString();
    return api.get<LeaveRequest[]>(`/hr/leave-requests${query ? `?${query}` : ''}`);
  },

  /**
   * Get pending leave requests
   */
  async getPendingLeaveRequests() {
    return api.get<LeaveRequest[]>('/hr/leave-requests/pending');
  },

  /**
   * Get single leave request
   */
  async getLeaveRequestById(id: string) {
    return api.get<LeaveRequest>(`/hr/leave-requests/${id}`);
  },

  /**
   * Approve leave request
   */
  async approveLeave(id: string, remarks?: string) {
    return api.put(`/hr/leave-requests/${id}/approve`, { remarks });
  },

  /**
   * Reject leave request
   */
  async rejectLeave(id: string, remarks?: string) {
    return api.put(`/hr/leave-requests/${id}/reject`, { remarks });
  },

  /**
   * Get HR statistics
   */
  async getHRStats() {
    return api.get<HRStats>('/hr/stats');
  },
};

