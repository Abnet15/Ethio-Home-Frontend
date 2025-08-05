import api, { endpoints } from '../config/api';

export const messageService = {
  // Get all messages (admin/employee only)
  getAllMessages: async (params = {}) => {
    try {
      const response = await api.get(endpoints.messages.list, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch messages' 
      };
    }
  },

  // Get messages for current user (inbox)
  getMyMessages: async (params = {}) => {
    try {
      const response = await api.get(endpoints.messages.myMessages, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch your messages' 
      };
    }
  },

  // Get messages sent by current user
  getSentMessages: async (params = {}) => {
    try {
      const response = await api.get(endpoints.messages.sent, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch sent messages' 
      };
    }
  },

  // Get messages received by current user
  getReceivedMessages: async (params = {}) => {
    try {
      const response = await api.get(endpoints.messages.received, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch received messages' 
      };
    }
  },

  // Create a new message
  createMessage: async (messageData) => {
    try {
      const response = await api.post(endpoints.messages.create, messageData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send message' 
      };
    }
  },

  // Create message from property detail page
  createPropertyMessage: async (propertyMessageData) => {
    try {
      const response = await api.post(endpoints.messages.property, propertyMessageData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send property message' 
      };
    }
  },

  // Get a single message by ID
  getMessage: async (id) => {
    try {
      const response = await api.get(endpoints.messages.get(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch message' 
      };
    }
  },

  // Update a message
  updateMessage: async (id, updateData) => {
    try {
      const response = await api.patch(endpoints.messages.update(id), updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update message' 
      };
    }
  },

  // Delete a message
  deleteMessage: async (id) => {
    try {
      const response = await api.delete(endpoints.messages.delete(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete message' 
      };
    }
  },

  // Mark message as read
  markAsRead: async (id) => {
    try {
      const response = await api.patch(endpoints.messages.markRead(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark message as read' 
      };
    }
  },

  // Toggle message archive status
  toggleArchive: async (id) => {
    try {
      const response = await api.patch(endpoints.messages.archive(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to toggle archive status' 
      };
    }
  },

  // Get message statistics
  getMessageStats: async () => {
    try {
      const response = await api.get(endpoints.messages.stats);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch message statistics' 
      };
    }
  },

  // Send bulk message to multiple recipients (admin/employee only)
  sendBulkMessage: async (bulkMessageData) => {
    try {
      const response = await api.post(endpoints.messages.bulk, bulkMessageData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send bulk message' 
      };
    }
  },

  // Get message templates (admin/employee only)
  getMessageTemplates: async () => {
    try {
      const response = await api.get(endpoints.messages.templates);
      console.log("templates",response)
      return { success: true, data: response.data };
    } catch (error) {
      console.error("error",error)
      console.warn("warn",error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch message templates' 
      };
    }
  },

  // Create message template (admin/employee only)
  createMessageTemplate: async (templateData) => {
    try {
      const response = await api.post(endpoints.messages.createTemplate, templateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create message template' 
      };
    }
  },

  // Search messages
  searchMessages: async (searchTerm, params = {}) => {
    try {
      const response = await api.get(endpoints.messages.search, { 
        params: { q: searchTerm, ...params } 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to search messages' 
      };
    }
  },

  // Get thread messages
  getThreadMessages: async (threadId) => {
    try {
      const response = await api.get(endpoints.messages.thread(threadId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch thread messages' 
      };
    }
  },

  // Reply to a message
  replyToMessage: async (messageId, replyData) => {
    try {
      const response = await api.post(endpoints.messages.reply(messageId), replyData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send reply' 
      };
    }
  },

  // Mark multiple messages as read
  markMultipleAsRead: async (messageIds) => {
    try {
      const response = await api.patch(endpoints.messages.markMultipleRead, { messageIds });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark messages as read' 
      };
    }
  },

  // Get message analytics (admin/employee only)
  getMessageAnalytics: async (params = {}) => {
    try {
      const response = await api.get(endpoints.messages.analytics, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch message analytics' 
      };
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await api.get(endpoints.messages.unreadCount);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch unread count' 
      };
    }
  }
};


