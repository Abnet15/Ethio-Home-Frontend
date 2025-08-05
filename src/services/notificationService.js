import api, { endpoints } from '../config/api';

// Browser notification utilities
let notificationPermission = 'default';
let unreadCount = 0;
let pollingInterval = null;
let listeners = [];

export const notificationService = {
  // Get user notifications
  getUserNotifications: async (params = {}) => {
    try {
      const response = await api.get(endpoints.notifications.list, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notifications' 
      };
    }
  },

  // Get notification statistics
  getNotificationStats: async () => {
    try {
      const response = await api.get(endpoints.notifications.stats);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch notification stats' 
      };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(endpoints.notifications.markRead(notificationId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark notification as read' 
      };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.patch(endpoints.notifications.markAllRead);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark all notifications as read' 
      };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await api.delete(endpoints.notifications.delete(notificationId));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete notification' 
      };
    }
  },

  // Request browser notification permission
  requestPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      notificationPermission = permission;
      return permission;
    }
    return 'denied';
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get(endpoints.notifications.unreadCount);
      return { success: true, data: response.data };
    } catch (error) {
      console.warn('Failed to fetch unread count, using fallback:', error.message);
      // Return a fallback response to prevent errors
      return { 
        success: true, 
        data: { 
          data: { unreadCount: 0 } 
        }
      };
    }
  },

  // Update unread count locally
  updateUnreadCount: (count) => {
    unreadCount = count;
  },

  // Start polling for new messages
  startPolling: (interval = 15000) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    pollingInterval = setInterval(async () => {
      try {
        const result = await notificationService.getUnreadCount();
        if (result.success) {
          const newCount = result.data.data.unreadCount;
          if (newCount !== unreadCount) {
            notificationService.updateUnreadCount(newCount);
            // Notify listeners
            listeners.forEach(listener => {
              listener({
                type: 'NEW_MESSAGES',
                count: newCount - unreadCount,
                totalUnread: newCount
              });
            });
          }
        }
      } catch (error) {
        console.warn('Error polling for notifications:', error.message);
        // Don't stop polling on error, just log it
      }
    }, interval);
  },

  // Stop polling
  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },

  // Add notification listener
  addListener: (listener) => {
    listeners.push(listener);
  },

  // Remove notification listener
  removeListener: (listener) => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  },

  // Show browser notification
  showBrowserNotification: (title, options = {}) => {
    if ('Notification' in window && notificationPermission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }
};

export default notificationService;
