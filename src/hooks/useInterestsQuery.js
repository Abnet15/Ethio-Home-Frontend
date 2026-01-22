import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interestService } from '../services/interestService';

// Query keys factory
export const interestKeys = {
  all: ['interests'],
  lists: () => [...interestKeys.all, 'list'],
  buyerList: (params = {}) => [...interestKeys.lists(), 'buyer', params],
  sellerList: (ownerId) => [...interestKeys.lists(), 'seller', ownerId],
  details: () => [...interestKeys.all, 'detail'],
  detail: (id) => [...interestKeys.details(), id],
};

// Hook to fetch buyer's interests (current user)
export const useBuyerInterestsQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: interestKeys.buyerList(params),
    queryFn: async () => {
      const result = await interestService.getBuyerInterests();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch interests');
      }
      // Handle various response shapes
      const data = result.data?.data;
      const interests = data?.data?.data || data?.data?.interests || data?.data || data?.interests || data || [];
      return Array.isArray(interests) ? interests : [];
    },
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

// Hook to fetch seller's interests
export const useSellerInterestsQuery = (ownerId, options = {}) => {
  return useQuery({
    queryKey: interestKeys.sellerList(ownerId),
    queryFn: async () => {
      if (!ownerId) return [];
      const result = await interestService.getSellerInterests(ownerId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch seller interests');
      }
      // Handle various response shapes
      const data = result.data?.data;
      const interests = data?.data?.data || data?.data?.interests || data?.data || data?.interests || data || [];
      return Array.isArray(interests) ? interests : [];
    },
    enabled: !!ownerId,
    staleTime: 60 * 1000,
    ...options,
  });
};

// Hook to fetch a single interest
export const useInterestQuery = (id, options = {}) => {
  return useQuery({
    queryKey: interestKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await interestService.getInterest(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch interest');
      }
      return result.data?.data?.data || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Mutation to submit interest
export const useSubmitInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ propertyId, interestData }) => {
      const result = await interestService.submitInterest(propertyId, interestData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit interest');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
    },
  });
};

// Mutation to update interest
export const useUpdateInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, interestData }) => {
      const result = await interestService.updateInterest(id, interestData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update interest');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(interestKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
      queryClient.invalidateQueries({ queryKey: interestKeys.sellerList() });
    },
  });
};

// Mutation to delete interest
export const useDeleteInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const result = await interestService.deleteInterest(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete interest');
      }
      return result;
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: interestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
    },
  });
};

// Mutation to update interest status
export const useUpdateInterestStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ interestId, status, additionalData = {} }) => {
      const result = await interestService.updateInterestStatus(interestId, status, additionalData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update interest status');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(interestKeys.detail(variables.interestId), data);
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
      queryClient.invalidateQueries({ queryKey: interestKeys.sellerList() });
    },
  });
};

// Mutation to schedule visit
export const useScheduleVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ interestId, visitDate }) => {
      const result = await interestService.scheduleVisit(interestId, visitDate);
      if (!result.success) {
        throw new Error(result.error || 'Failed to schedule visit');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(interestKeys.detail(variables.interestId), data);
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
      queryClient.invalidateQueries({ queryKey: interestKeys.sellerList() });
    },
  });
};

// Mutation to mark as contacted
export const useMarkInterestAsContacted = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (interestId) => {
      const result = await interestService.markAsContacted(interestId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark as contacted');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, interestId) => {
      queryClient.setQueryData(interestKeys.detail(interestId), data);
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
      queryClient.invalidateQueries({ queryKey: interestKeys.sellerList() });
    },
  });
};

// Mutation to reject interest
export const useRejectInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (interestId) => {
      const result = await interestService.rejectInterest(interestId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject interest');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, interestId) => {
      queryClient.setQueryData(interestKeys.detail(interestId), data);
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
      queryClient.invalidateQueries({ queryKey: interestKeys.sellerList() });
    },
  });
};

// Mutation to mark visit as completed
export const useMarkVisitCompleted = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (interestId) => {
      const result = await interestService.markVisitCompleted(interestId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark visit as completed');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, interestId) => {
      queryClient.setQueryData(interestKeys.detail(interestId), data);
      queryClient.invalidateQueries({ queryKey: interestKeys.buyerList() });
      queryClient.invalidateQueries({ queryKey: interestKeys.sellerList() });
    },
  });
};



