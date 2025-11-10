import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

// Query keys
export const payrollKeys = {
  all: ['payroll'] as const,
  salary: () => [...payrollKeys.all, 'salary'] as const,
  payslips: (filters?: any) => [...payrollKeys.all, 'payslips', filters] as const,
  stats: () => [...payrollKeys.all, 'stats'] as const,
  detail: (id: string) => [...payrollKeys.all, 'detail', id] as const,
};

// Fetch salary structure
export function useSalary() {
  return useQuery({
    queryKey: payrollKeys.salary(),
    queryFn: async () => {
      const response = await api.get('/payroll/salary');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // Salary doesn't change often, stay fresh for 1 hour
  });
}

// Fetch payslips
export function usePayslips(year?: number) {
  return useQuery({
    queryKey: payrollKeys.payslips({ year }),
    queryFn: async () => {
      const params = year ? `?year=${year}` : '';
      const response = await api.get(`/payroll/payslips${params}`);
      return response.data;
    },
  });
}

// Fetch payroll stats
export function usePayrollStats() {
  return useQuery({
    queryKey: payrollKeys.stats(),
    queryFn: async () => {
      const response = await api.get('/payroll/stats');
      return response.data;
    },
  });
}

// Fetch single payslip
export function usePayslip(id: string) {
  return useQuery({
    queryKey: payrollKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/payroll/payslips/${id}`);
      return response.data;
    },
    enabled: !!id, // Only fetch if id is provided
  });
}

