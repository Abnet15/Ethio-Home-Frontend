import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../services/propertyService';

// Query keys factory
export const propertyKeys = {
  all: ['properties'],
  lists: () => [...propertyKeys.all, 'list'],
  list: (filters = {}) => [...propertyKeys.lists(), filters],
  details: () => [...propertyKeys.all, 'detail'],
  detail: (id) => [...propertyKeys.details(), id],
  stats: () => [...propertyKeys.all, 'stats'],
};

// Hook to fetch properties list with filters
export const usePropertiesQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: propertyKeys.list(filters),
    queryFn: async () => {
      const result = await propertyService.getProperties(filters);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch properties');
      }
      // Backend shape: { status, results, pageNumber, pages, data: { data: [...] } }
      return {
        properties: result.data?.data?.data || [],
        pagination: {
          page: result.data?.pageNumber || 1,
          totalPages: result.data?.pages || 1,
          total: result.data?.results || 0,
          limit: result.data?.limit || 12,
        },
      };
    },
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

// Hook to fetch a single property by ID
export const usePropertyQuery = (id, options = {}) => {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await propertyService.getProperty(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch property');
      }
      // Backend shape: { status, data: { data: { ...property } } }
      return result.data?.data?.data || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Hook to fetch property statistics
export const usePropertyStatsQuery = (options = {}) => {
  return useQuery({
    queryKey: propertyKeys.stats(),
    queryFn: async () => {
      const result = await propertyService.getPropertyStats();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch property stats');
      }
      return result.data?.data || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Mutation to create a property
export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (propertyData) => {
      const result = await propertyService.createProperty(propertyData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create property');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: () => {
      // Invalidate properties list to refetch
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.stats() });
    },
  });
};

// Mutation to update a property
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, propertyData }) => {
      const result = await propertyService.updateProperty(id, propertyData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update property');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      // Update the specific property in cache
      queryClient.setQueryData(propertyKeys.detail(variables.id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
};

// Mutation to delete a property
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const result = await propertyService.deleteProperty(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete property');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: propertyKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.stats() });
    },
  });
};

// Mutation to verify a property
export const useVerifyProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (propertyId) => {
      const result = await propertyService.verifyProperty(propertyId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to verify property');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, propertyId) => {
      // Update the property in cache
      queryClient.setQueryData(propertyKeys.detail(propertyId), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
};

// Mutation to reject a property
export const useRejectProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (propertyId) => {
      const result = await propertyService.rejectProperty(propertyId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject property');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, propertyId) => {
      // Update the property in cache
      queryClient.setQueryData(propertyKeys.detail(propertyId), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
};

