import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../services/messageService';

// Query keys factory
export const messageKeys = {
  all: ['messages'],
  lists: () => [...messageKeys.all, 'list'],
  list: (params = {}) => [...messageKeys.lists(), params],
  details: () => [...messageKeys.all, 'detail'],
  detail: (id) => [...messageKeys.details(), id],
  myMessages: () => [...messageKeys.all, 'my'],
  sent: () => [...messageKeys.all, 'sent'],
  received: () => [...messageKeys.all, 'received'],
  stats: () => [...messageKeys.all, 'stats'],
  templates: () => [...messageKeys.all, 'templates'],
  thread: (threadId) => [...messageKeys.all, 'thread', threadId],
  unreadCount: () => [...messageKeys.all, 'unreadCount'],
};

// Hook to fetch all messages (admin/employee)
export const useAllMessagesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: messageKeys.list(params),
    queryFn: async () => {
      const result = await messageService.getAllMessages(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch messages');
      }
      return result.data?.data?.messages || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

// Hook to fetch current user's messages
export const useMyMessagesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...messageKeys.myMessages(), params],
    queryFn: async () => {
      const result = await messageService.getMyMessages(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch messages');
      }
      return result.data?.data?.messages || [];
    },
    staleTime: 30 * 1000,
    ...options,
  });
};

// Hook to fetch sent messages
export const useSentMessagesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...messageKeys.sent(), params],
    queryFn: async () => {
      const result = await messageService.getSentMessages(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sent messages');
      }
      return result.data?.data?.messages || [];
    },
    staleTime: 30 * 1000,
    ...options,
  });
};

// Hook to fetch received messages
export const useReceivedMessagesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...messageKeys.received(), params],
    queryFn: async () => {
      const result = await messageService.getReceivedMessages(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch received messages');
      }
      return result.data?.data?.messages || [];
    },
    staleTime: 30 * 1000,
    ...options,
  });
};

// Hook to fetch a single message
export const useMessageQuery = (id, options = {}) => {
  return useQuery({
    queryKey: messageKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await messageService.getMessage(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch message');
      }
      return result.data?.data?.data || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Hook to fetch message statistics
export const useMessageStatsQuery = (options = {}) => {
  return useQuery({
    queryKey: messageKeys.stats(),
    queryFn: async () => {
      const result = await messageService.getMessageStats();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch message stats');
      }
      return result.data?.data || {};
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Hook to fetch message templates
export const useMessageTemplatesQuery = (options = {}) => {
  return useQuery({
    queryKey: messageKeys.templates(),
    queryFn: async () => {
      const result = await messageService.getMessageTemplates();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch templates');
      }
      return result.data?.data?.templates || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Hook to fetch thread messages
export const useThreadMessagesQuery = (threadId, options = {}) => {
  return useQuery({
    queryKey: messageKeys.thread(threadId),
    queryFn: async () => {
      if (!threadId) return [];
      const result = await messageService.getThreadMessages(threadId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch thread messages');
      }
      return result.data?.data?.messages || [];
    },
    enabled: !!threadId,
    staleTime: 30 * 1000,
    ...options,
  });
};

// Hook to fetch unread message count
export const useUnreadMessageCountQuery = (options = {}) => {
  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: async () => {
      const result = await messageService.getUnreadCount();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch unread count');
      }
      return result.data?.data?.count || 0;
    },
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    ...options,
  });
};

// Mutation to create a message
export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageData) => {
      const result = await messageService.createMessage(messageData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messageKeys.myMessages() });
      queryClient.invalidateQueries({ queryKey: messageKeys.sent() });
      queryClient.invalidateQueries({ queryKey: messageKeys.received() });
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
    },
  });
};

// Mutation to create property message
export const useCreatePropertyMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (propertyMessageData) => {
      const result = await messageService.createPropertyMessage(propertyMessageData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send property message');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messageKeys.myMessages() });
    },
  });
};

// Mutation to update a message
export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updateData }) => {
      const result = await messageService.updateMessage(id, updateData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update message');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(messageKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
    },
  });
};

// Mutation to delete a message
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const result = await messageService.deleteMessage(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete message');
      }
      return result;
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: messageKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
    },
  });
};

// Mutation to mark message as read
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const result = await messageService.markAsRead(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark message as read');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(messageKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
    },
  });
};

// Mutation to toggle archive status
export const useToggleMessageArchive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const result = await messageService.toggleArchive(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle archive status');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(messageKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
    },
  });
};

// Mutation to send bulk message
export const useSendBulkMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bulkMessageData) => {
      const result = await messageService.sendBulkMessage(bulkMessageData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send bulk message');
      }
      return result.data?.data || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messageKeys.sent() });
    },
  });
};

// Mutation to create message template
export const useCreateMessageTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateData) => {
      const result = await messageService.createMessageTemplate(templateData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create template');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.templates() });
    },
  });
};

// Mutation to reply to a message
export const useReplyToMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ messageId, replyData }) => {
      const result = await messageService.replyToMessage(messageId, replyData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send reply');
      }
      return result.data?.data?.data || null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.thread(variables.messageId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messageKeys.myMessages() });
    },
  });
};





