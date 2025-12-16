import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// Query keys
export const leaveKeys = {
  all: ['leave'] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  balances: () => [...leaveKeys.all, 'balances'] as const,
  applications: (status?: string) => [...leaveKeys.all, 'applications', status] as const,
  detail: (id: string) => [...leaveKeys.all, 'detail', id] as const,
};

// Fetch leave types (deduplicated by name)
export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: async () => {
      const response = await api.get('/leave/types');
      // Deduplicate leave types by name
      const seen = new Set<string>();
      const uniqueTypes = (response.data || []).filter((type: any) => {
        if (seen.has(type.name)) {
          return false;
        }
        seen.add(type.name);
        return true;
      });
      return uniqueTypes;
    },
    staleTime: 1000 * 60 * 60, // Leave types don't change often, stay fresh for 1 hour
  });
}

// Fetch leave balances (deduplicated by leave type name)
export function useLeaveBalances() {
  return useQuery({
    queryKey: leaveKeys.balances(),
    queryFn: async () => {
      const response = await api.get('/leave/balances');
      // Deduplicate balances by leave type name
      const seen = new Set<string>();
      const uniqueBalances = (response.data || []).filter((balance: any) => {
        if (seen.has(balance.leaveType.name)) {
          return false;
        }
        seen.add(balance.leaveType.name);
        return true;
      });
      return uniqueBalances;
    },
  });
}

// Fetch leave applications
export function useLeaveApplications(status?: string) {
  return useQuery({
    queryKey: leaveKeys.applications(status),
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const response = await api.get(`/leave/applications${params}`);
      return response.data;
    },
  });
}

// Apply for leave mutation
export function useApplyLeave() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason?: string;
    }) => {
      const response = await api.post('/leave/apply', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.balances() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.applications() });
    },
  });
}

// Cancel leave mutation
export function useCancelLeave() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leaveId: string) => {
      const response = await api.put(`/leave/${leaveId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.applications() });
    },
  });
}

