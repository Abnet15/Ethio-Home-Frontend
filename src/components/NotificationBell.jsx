import React, { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, Info, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
        setIsOpen(false);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'message_received': return <MessageSquare size={16} className="text-blue-500" />;
            case 'property_approved': return <CheckCircle size={16} className="text-green-500" />;
            case 'interest_received': return <CheckCircle size={16} className="text-gold-500" />;
            case 'date_reminder': return <Info size={16} className="text-purple-500" />;
            default: return <Bell size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 glass-dark"
                    >
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                                    <Bell className="w-12 h-12 mb-3 opacity-20" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/10">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!notification.isRead ? 'bg-white/5' : ''
                                                }`}
                                        >
                                            <div className="mt-1 p-2 rounded-full bg-white/10 h-fit">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-400'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400 line-clamp-2">{notification.message}</p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-gold-400 mt-2" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-white/10 bg-white/5 text-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-sm text-gold-400 hover:text-gold-300 font-medium"
                            >
                                View All
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
