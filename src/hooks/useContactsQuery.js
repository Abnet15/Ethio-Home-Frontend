import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services/contactService';

// Query keys factory
export const contactKeys = {
  all: ['contacts'],
  lists: () => [...contactKeys.all, 'list'],
  list: (params = {}) => [...contactKeys.lists(), params],
  details: () => [...contactKeys.all, 'detail'],
  detail: (id) => [...contactKeys.details(), id],
  stats: () => [...contactKeys.all, 'stats'],
  departments: () => [...contactKeys.all, 'departments'],
  faqs: (params = {}) => [...contactKeys.all, 'faqs', params],
  myContacts: (userId) => [...contactKeys.all, 'my', userId],
};

// Hook to fetch all contacts (admin only)
export const useContactsQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: async () => {
      const result = await contactService.getAllContacts(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch contacts');
      }
      return result.data?.data?.contacts || result.data?.contacts || [];
    },
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

// Hook to fetch a single contact
export const useContactQuery = (id, options = {}) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await contactService.getContact(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch contact');
      }
      return result.data?.data?.data || result.data?.data || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Hook to fetch contact statistics
export const useContactStatsQuery = (options = {}) => {
  return useQuery({
    queryKey: contactKeys.stats(),
    queryFn: async () => {
      const result = await contactService.getContactStats();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch contact stats');
      }
      return result.data?.data || result.data || {};
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Hook to fetch contact departments
export const useContactDepartmentsQuery = (options = {}) => {
  return useQuery({
    queryKey: contactKeys.departments(),
    queryFn: async () => {
      const result = await contactService.getContactDepartments();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch departments');
      }
      return result.data?.data?.departments || result.data?.departments || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Hook to fetch contact FAQs
export const useContactFAQsQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: contactKeys.faqs(params),
    queryFn: async () => {
      const result = await contactService.getContactFAQs(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch FAQs');
      }
      return result.data?.data?.faqs || result.data?.faqs || [];
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Mutation to submit contact form
export const useSubmitContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contactData) => {
      const result = await contactService.submitContact(contactData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit contact form');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
};

// Mutation to update contact status
export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updateData }) => {
      const result = await contactService.updateContactStatus(id, updateData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update contact');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(contactKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
};

// Mutation to add note to contact
export const useAddContactNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, noteData }) => {
      const result = await contactService.addNote(id, noteData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to add note');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(contactKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};

// Mutation to delete contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const result = await contactService.deleteContact(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete contact');
      }
      return result;
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: contactKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() });
    },
  });
};

// Mutation to assign contact to employee
export const useAssignContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, assignmentData }) => {
      const result = await contactService.assignContact(id, assignmentData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to assign contact');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(contactKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};



