import { 
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Trash2,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';


const NotificationCenter = ({ showStats = true, showActions = true, maxNotifications = 10 }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await notificationService.getUserNotifications({
        limit: showAll ? 50 : maxNotifications,
        unreadOnly: false
      });
      if (result.success) {
        setNotifications(result.data.notifications || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!user?._id) return;
    
    try {
      const result = await notificationService.getNotificationStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (showStats) {
      fetchStats();
    }
  }, [user?._id, showStats]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        // Update stats
        if (stats) {
          setStats(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1)
          }));
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        // Update stats
        if (stats) {
          setStats(prev => ({
            ...prev,
            unread: 0
          }));
        }
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const result = await notificationService.deleteNotification(notificationId);
        if (result.success) {
          setNotifications(prev => 
            prev.filter(notif => notif._id !== notificationId)
          );
          // Update stats
          if (stats) {
            const deletedNotif = notifications.find(n => n._id === notificationId);
            if (deletedNotif && !deletedNotif.isRead) {
              setStats(prev => ({
                ...prev,
                unread: Math.max(0, prev.unread - 1),
                total: Math.max(0, prev.total - 1)
              }));
            } else {
              setStats(prev => ({
                ...prev,
                total: Math.max(0, prev.total - 1)
              }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconProps = { size: 20 };
    
    switch (type) {
      case 'contact_response':
        return <CheckCircle {...iconProps} className="text-green-600" />;
      case 'property_approved':
        return <CheckCircle {...iconProps} className="text-green-600" />;
      case 'property_rejected':
        return <XCircle {...iconProps} className="text-red-600" />;
      case 'message_received':
        return <AlertCircle {...iconProps} className="text-[#0B6E4F] dark:text-[#0B6E4F]" />;
      case 'subscription_expired':
        return <AlertCircle {...iconProps} className="text-orange-600" />;
      case 'payment_success':
        return <CheckCircle {...iconProps} className="text-green-600" />;
      default:
        return <Info {...iconProps} className="text-[#4B5563] dark:text-[#6B7A73]" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-[#F8F4EC] dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#F8F4EC]';
      default:
        return 'bg-[#F8F4EC] dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#F8F4EC]';
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, maxNotifications);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="notification-center">
      {/* Header with stats */}
      {showStats && stats && (
        <div className="notification-header mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">Notifications</h3>
              {stats.unread > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {stats.unread} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-[#0B6E4F] dark:text-[#0B6E4F] hover:text-[#0B6E4F] dark:text-[#0B6E4F] font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-[#4B5563] dark:text-[#6B7A73] hover:text-[#1A1A1A] dark:text-[#F8F4EC] font-medium"
              >
                {showAll ? 'Show less' : 'Show all'}
              </button>
            </div>
          </div>
          
          {/* Stats row */}
          <div className="flex items-center gap-6 mt-2 text-sm text-[#4B5563] dark:text-[#6B7A73]">
            <span>Total: {stats.total}</span>
            <span>Unread: {stats.unread}</span>
            {stats.byType && Object.keys(stats.byType).length > 0 && (
              <div className="flex items-center gap-2">
                <span>By type:</span>
                {Object.entries(stats.byType).map(([type, count]) => (
                  <span key={type} className="text-xs bg-[#F8F4EC] dark:bg-[#141A17] px-2 py-1 rounded">
                    {type}: {count.total}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="notifications-list space-y-3">
        {displayedNotifications.length === 0 ? (
          <div className="text-center py-8 text-[#4B5563] dark:text-[#6B7A73]">
            <Bell className="mx-auto h-12 w-12 text-[#4B5563] dark:text-[#A8B5AE] mb-4" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          displayedNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item p-4 rounded-lg border transition-all duration-200 ${
                notification.isRead
                  ? 'bg-[#F8F4EC] dark:bg-[#0B0F0D] border-[#E5E0D8] dark:border-[#2A342E]'
                  : 'bg-white border-[#0B6E4F]/20 dark:border-[#0B6E4F]/20 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${
                        notification.isRead ? 'text-[#1A1A1A] dark:text-[#A8B5AE]' : 'text-[#1A1A1A] dark:text-[#F8F4EC]'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        notification.isRead ? 'text-[#4B5563] dark:text-[#6B7A73]' : 'text-[#4B5563] dark:text-[#6B7A73]'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#4B5563] dark:text-[#A8B5AE]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {notification.timeAgo}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        {notification.sender && (
                          <span>From: {notification.sender.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {showActions && (
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-[#0B6E4F] dark:text-[#0B6E4F] hover:text-[#0B6E4F] dark:text-[#0B6E4F] p-1 rounded"
                            title="Mark as read"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#4B5563] dark:text-[#6B7A73] p-1 rounded"
                            title="Mark as unread"
                          >
                            <EyeOff size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show more/less button */}
      {notifications.length > maxNotifications && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[#0B6E4F] dark:text-[#0B6E4F] hover:text-[#0B6E4F] dark:text-[#0B6E4F] font-medium"
          >
            {showAll ? 'Show less' : `Show ${notifications.length - maxNotifications} more`}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;


