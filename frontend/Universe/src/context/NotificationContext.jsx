import { createContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Add a new notification
    // type: 'success' | 'info' | 'warning' | 'error' | 'message'
    const addNotification = useCallback((type, title, message, data = {}) => {
        const id = uuidv4();
        const newNotification = {
            id,
            type,
            title,
            message,
            timestamp: new Date(),
            read: false,
            ...data
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Auto-remove bubbles (but keep in list) for transient notifications if desired
        // For now, we keep them until manually dismissed or cleared
        return id;
    }, []);

    // Mark a notification as read
    const markAsRead = useCallback((id) => {
        setNotifications(prev => prev.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    }, []);

    // Remove a notification completely
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    // Clear all notifications
    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            removeNotification,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
