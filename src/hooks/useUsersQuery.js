import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';

// Query keys factory
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (params = {}) => [...userKeys.lists(), params],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
  me: () => [...userKeys.all, 'me'],
};

// Hook to fetch current user profile
export const useMeQuery = (options = {}) => {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const result = await userService.getMe();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user profile');
      }
      return result.data?.data?.data || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Hook to fetch users list (admin/employee only)
export const useUsersQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const result = await userService.getUsers(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }
      return {
        users: result.data?.data?.data || [],
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

// Hook to fetch a single user by ID
export const useUserQuery = (id, options = {}) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await userService.getUser(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user');
      }
      return result.data?.data?.data || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Mutation to update current user profile
export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData) => {
      const result = await userService.updateMe(userData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data) => {
      // Update current user in cache
      queryClient.setQueryData(userKeys.me(), data);
    },
  });
};

// Mutation to update a user (admin/employee only)
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userData }) => {
      const result = await userService.updateUser(id, userData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Mutation to delete a user (admin only)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const result = await userService.deleteUser(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }
      return result;
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

