import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { messageService } from '../services/messageService';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const socket = useSocket();

    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch initial notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                const result = await notificationService.getUserNotifications({ limit: 10 });
                if (result.success) {
                    setNotifications(result.data.data.notifications);
                    setUnreadCount(result.data.data.unreadCount);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [isAuthenticated]);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket) return;

        socket.on('notification:new', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Play sound or show toast here if needed
            const audio = new Audio('/assets/notification-sound.mp3'); // Ensure this file exists or use a CDN
            audio.play().catch(e => console.log('Audio play failed', e));
        });

        socket.on('message:new', (newMessage) => {
            // Check if message is for us
            if (newMessage.recipient._id === user._id || newMessage.recipient === user._id) {
                setUnreadCount(prev => prev + 1); // We can just use a single counter or separate them?
                // For now, let's just increment the main counter to show *something* happened.
                // Ideally we'd add a "You have a new message" notification to the list OR handle it separately.
                // Let's create a temporary "Notification" object for this message so it shows in the list
                const msgNotification = {
                    _id: `msg-${newMessage._id}`,
                    type: 'message_received',
                    title: `New Message from ${newMessage.sender.name}`,
                    message: newMessage.content,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    actionUrl: `/messages?id=${newMessage._id}`,
                    sender: newMessage.sender
                };
                setNotifications(prev => [msgNotification, ...prev]);

                const audio = new Audio('/assets/notification-sound.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
            }
        });

        return () => {
            socket.off('notification:new');
            socket.off('message:new');
        };
    }, [socket, user]);

    const markAsRead = async (id) => {
        try {
            const result = await notificationService.markAsRead(id);
            if (result.success) {
                setNotifications(prev =>
                    prev.map(n => n._id === id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const result = await notificationService.markAllAsRead();
            if (result.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            notifications,
            loading,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
