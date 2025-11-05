import { api } from './api';

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  type: 'CHECKIN' | 'CHECKOUT';
  timestamp: string;
  latitude?: number;
  longitude?: number;
  locationId?: string;
  location?: Location;
}

export interface TodayStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkIn?: Attendance;
  checkOut?: Attendance;
  workingHours: number;
}

export interface AttendanceDay {
  date: string;
  checkIn: Attendance | null;
  checkOut: Attendance | null;
  workingHours: number;
}

export interface AttendanceStats {
  totalDays: number;
  checkIns: number;
  checkOuts: number;
  month: number;
  year: number;
}

export interface CheckInData {
  latitude: number;
  longitude: number;
  locationId: string;
}

export interface CheckOutData {
  latitude: number;
  longitude: number;
}

export const attendanceService = {
  /**
   * Get all office locations
   */
  async getLocations() {
    return api.get<Location[]>('/attendance/locations');
  },

  /**
   * Get primary office location
   */
  async getPrimaryLocation() {
    return api.get<Location>('/attendance/location/primary');
  },

  /**
   * Get today's attendance status
   */
  async getTodayStatus() {
    return api.get<TodayStatus>('/attendance/today');
  },

  /**
   * Check in
   */
  async checkIn(data: CheckInData) {
    return api.post<Attendance>('/attendance/check-in', data);
  },

  /**
   * Check out
   */
  async checkOut(data: CheckOutData) {
    return api.post<Attendance>('/attendance/check-out', data);
  },

  /**
   * Get attendance history
   */
  async getHistory(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.limit) query.append('limit', params.limit.toString());

    const endpoint = query.toString()
      ? `/attendance/history?${query.toString()}`
      : '/attendance/history';

    return api.get<AttendanceDay[]>(endpoint);
  },

  /**
   * Get attendance statistics
   */
  async getStats(month?: number, year?: number) {
    const query = new URLSearchParams();
    if (month) query.append('month', month.toString());
    if (year) query.append('year', year.toString());

    const endpoint = query.toString()
      ? `/attendance/stats?${query.toString()}`
      : '/attendance/stats';

    return api.get<AttendanceStats>(endpoint);
  },
};

