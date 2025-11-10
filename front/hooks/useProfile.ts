import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
  stats: () => [...profileKeys.all, 'stats'] as const,
};

// Fetch profile
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const response = await api.get('/profile');
      return response.data;
    },
  });
}

// Fetch profile stats
export function useProfileStats() {
  return useQuery({
    queryKey: profileKeys.stats(),
    queryFn: async () => {
      const response = await api.get('/profile/stats');
      return response.data;
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      fullName?: string;
      avatarUrl?: string;
      department?: string;
      designation?: string;
    }) => {
      const response = await api.put('/profile', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate profile queries to refetch
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

