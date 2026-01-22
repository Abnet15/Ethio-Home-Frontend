import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';

// Query keys factory
export const reviewKeys = {
  all: ['reviews'],
  lists: () => [...reviewKeys.all, 'list'],
  list: (params = {}) => [...reviewKeys.lists(), params],
  details: () => [...reviewKeys.all, 'detail'],
  detail: (id) => [...reviewKeys.details(), id],
  property: (propertyId) => [...reviewKeys.all, 'property', propertyId],
  user: (userId) => [...reviewKeys.all, 'user', userId],
  stats: () => [...reviewKeys.all, 'stats'],
};

// Hook to fetch reviews list
export const useReviewsQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: async () => {
      const result = await reviewService.getReviews(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }
      return {
        reviews: result.data?.data?.data || [],
        pagination: {
          page: result.data?.pageNumber || 1,
          totalPages: result.data?.pages || 1,
          total: result.data?.results || 0,
        },
      };
    },
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

// Hook to fetch reviews for a specific property
export const usePropertyReviewsQuery = (propertyId, options = {}) => {
  return useQuery({
    queryKey: reviewKeys.property(propertyId),
    queryFn: async () => {
      if (!propertyId) return [];
      const result = await reviewService.getPropertyReviews(propertyId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch property reviews');
      }
      return result.data?.data?.data || [];
    },
    enabled: !!propertyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Hook to fetch review statistics
export const useReviewStatsQuery = (options = {}) => {
  return useQuery({
    queryKey: reviewKeys.stats(),
    queryFn: async () => {
      const result = await reviewService.getReviewStats();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch review stats');
      }
      return result.data?.data || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Mutation to create a review
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData) => {
      const result = await reviewService.createReview(reviewData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create review');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      if (variables.propertyId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.property(variables.propertyId) });
      }
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });
};

// Mutation to update a review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reviewData }) => {
      const result = await reviewService.updateReview(id, reviewData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update review');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      // Update the specific review in cache
      queryClient.setQueryData(reviewKeys.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
};

// Mutation to delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const result = await reviewService.deleteReview(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete review');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: reviewKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });
};

