import { Bell, MessageSquare } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import notificationService from '../services/notificationService';
import '../styles/message-notification.css';

const MessageNotification = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize notification service
    const initializeNotifications = async () => {
      //to get pernission from users
      await notificationService.requestPermission();
      
      // Get initial unread count
      const result = await notificationService.getUnreadCount();
      if (result.success) {
        const count = result.data.data.unreadCount;
        setUnreadCount(count);
        notificationService.updateUnreadCount(count);
      }

      // Start polling for new messages
      notificationService.startPolling(15000); // Check every 15 seconds

      // Add listener for new message notifications
      notificationService.addListener(handleNotification);
    };

    initializeNotifications();

    return () => {
      notificationService.stopPolling();
      notificationService.removeListener(handleNotification);
    };
  }, [isAuthenticated]);

  const handleNotification = (notification) => {
    if (notification.type === 'NEW_MESSAGES') {
      setUnreadCount(notification.totalUnread);
      
      // Show browser notification
      notificationService.showBrowserNotification(
        `New Message${notification.count > 1 ? 's' : ''}`,
        {
          body: `You have ${notification.count} new unread message${notification.count > 1 ? 's' : ''}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        }
      );
    }
  };

  const handleClick = () => {
    if (unreadCount > 0) {
      navigate('/messages');
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  const handleMessageClick = (messageId) => {
    navigate(`/messages?message=${messageId}`);
    setShowDropdown(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Get all unread message IDs and mark them as read
      const result = await messageService.markMultipleAsRead([]); // Empty array for now, could be enhanced to get actual message IDs
      if (result.success) {
        setUnreadCount(0);
        notificationService.updateUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
    setShowDropdown(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="message-notification">
      <div className="notification-icon" onClick={handleClick}>
        <MessageSquare size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>Messages</h4>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {unreadCount > 0 ? (
            <div className="unread-messages">
              <p>You have {unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>
              <button 
                className="view-all-btn"
                onClick={() => {
                  navigate('/messages');
                  setShowDropdown(false);
                }}
              >
                View all messages
              </button>
            </div>
          ) : (
            <div className="no-messages">
              <p>No new messages</p>
              <button 
                className="compose-btn"
                onClick={() => {
                  navigate('/messages');
                  setShowDropdown(false);
                }}
              >
                Compose message
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="dropdown-overlay"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default MessageNotification;
