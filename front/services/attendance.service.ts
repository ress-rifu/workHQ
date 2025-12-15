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

export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  department: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface MonthlyAttendanceDay {
  date: string;
  checkIn: Attendance | null;
  checkOut: Attendance | null;
  status: 'present' | 'late' | 'absent';
  workingHours: number;
}

export interface EmployeeMonthlyAttendance {
  employee: EmployeeListItem;
  attendance: MonthlyAttendanceDay[];
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
    const queryParts: string[] = [];
    if (params?.startDate) queryParts.push(`startDate=${encodeURIComponent(params.startDate)}`);
    if (params?.endDate) queryParts.push(`endDate=${encodeURIComponent(params.endDate)}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);

    const queryString = queryParts.length > 0 ? queryParts.join('&') : '';
    const endpoint = queryString
      ? `/attendance/history?${queryString}`
      : '/attendance/history';

    return api.get<AttendanceDay[]>(endpoint);
  },

  /**
   * Get attendance statistics
   */
  async getStats(month?: number, year?: number) {
    const queryParts: string[] = [];
    if (month) queryParts.push(`month=${month}`);
    if (year) queryParts.push(`year=${year}`);

    const queryString = queryParts.length > 0 ? queryParts.join('&') : '';
    const endpoint = queryString
      ? `/attendance/stats?${queryString}`
      : '/attendance/stats';

    return api.get<AttendanceStats>(endpoint);
  },

  /**
   * Get all employees list (HR/Admin only)
   */
  async getAllEmployees() {
    return api.get<EmployeeListItem[]>('/attendance/employees');
  },

  /**
   * Get employee monthly attendance (HR/Admin only)
   */
  async getEmployeeMonthlyAttendance(employeeId: string, month?: number, year?: number) {
    const queryParts: string[] = [];
    if (month) queryParts.push(`month=${month}`);
    if (year) queryParts.push(`year=${year}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api.get<MonthlyAttendanceDay[]>(`/attendance/employee/${employeeId}/monthly${queryString}`);
  },

  /**
   * Get all employees monthly attendance (HR/Admin only)
   */
  async getAllEmployeesMonthlyAttendance(month?: number, year?: number) {
    const queryParts: string[] = [];
    if (month) queryParts.push(`month=${month}`);
    if (year) queryParts.push(`year=${year}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api.get<EmployeeMonthlyAttendance[]>(`/attendance/all/monthly${queryString}`);
  },
};

