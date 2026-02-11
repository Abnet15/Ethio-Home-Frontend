import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitService } from '../services/visitService';
import { interestKeys } from './useInterestsQuery';

// Query keys factory
export const visitKeys = {
  all: ['visits'],
  lists: () => [...visitKeys.all, 'list'],
  list: (params = {}) => [...visitKeys.lists(), params],
  details: () => [...visitKeys.all, 'detail'],
  detail: (id) => [...visitKeys.details(), id],
};

// Hook to fetch scheduled visits (uses interest service)
export const useScheduledVisitsQuery = (options = {}) => {
  return useQuery({
    queryKey: visitKeys.list(),
    queryFn: async () => {
      const result = await visitService.getScheduledVisits();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch scheduled visits');
      }
      // Handle various response shapes
      const data = result.data?.data;
      const visits = data?.data?.data || data?.data?.interests || data?.data || data?.interests || data || [];
      // Filter for scheduled visits (visitScheduled: true or status: 'schedule')
      return Array.isArray(visits) 
        ? visits.filter(v => v.visitScheduled || v.status === 'schedule' || v.visitDate)
        : [];
    },
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

// Mutation to schedule a visit
export const useScheduleVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (visitData) => {
      const result = await visitService.scheduleVisit(visitData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to schedule visit');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
    },
  });
};

// Mutation to update visit
export const useUpdateVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ visitId, updateData }) => {
      const result = await visitService.updateVisit(visitId, updateData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update visit');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(visitKeys.detail(variables.visitId), data);
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
    },
  });
};

// Mutation to cancel visit
export const useCancelVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (visitId) => {
      const result = await visitService.cancelVisit(visitId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel visit');
      }
      return result;
    },
    onSuccess: (_, visitId) => {
      queryClient.removeQueries({ queryKey: visitKeys.detail(visitId) });
      queryClient.invalidateQueries({ queryKey: visitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
    },
  });
};







