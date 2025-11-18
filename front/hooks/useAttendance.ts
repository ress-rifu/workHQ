import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// Query keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  today: () => [...attendanceKeys.all, 'today'] as const,
  history: (filters?: any) => [...attendanceKeys.all, 'history', filters] as const,
  locations: () => [...attendanceKeys.all, 'locations'] as const,
};

// Fetch today's attendance
export function useTodayAttendance() {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: async () => {
      const response = await api.get('/attendance/today');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
}

// Fetch attendance history
export function useAttendanceHistory(month?: number, year?: number) {
  return useQuery({
    queryKey: attendanceKeys.history({ month, year }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const response = await api.get(`/attendance/history?${params.toString()}`);
      return response.data;
    },
  });
}

// Fetch locations
export function useLocations() {
  return useQuery({
    queryKey: attendanceKeys.locations(),
    queryFn: async () => {
      const response = await api.get('/attendance/locations');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // Locations don't change often, stay fresh for 1 hour
    gcTime: 1000 * 60 * 120, // Keep in cache for 2 hours
  });
}

// Check-in mutation
export function useCheckIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      latitude: number;
      longitude: number;
      locationId?: string;
    }) => {
      const response = await api.post('/attendance/check-in', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.history() });
    },
  });
}

// Check-out mutation
export function useCheckOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      latitude: number;
      longitude: number;
      locationId?: string;
    }) => {
      const response = await api.post('/attendance/check-out', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.history() });
    },
  });
}

