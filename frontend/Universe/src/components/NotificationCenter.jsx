import { useState, useContext, useRef, useEffect } from 'react';
import { Bell, X, Check, Trash2, Info, AlertTriangle, CheckCircle, MessageCircle } from 'lucide-react';
import NotificationContext from '../context/NotificationContext';
import '../styles/notification.css';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter = () => {
    const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } = useContext(NotificationContext);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close panel when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target) && !event.target.closest('.notification-bell-container')) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    const handleKeyDownToggle = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            togglePanel();
        }
    };

    const handleMarkAsRead = (id, e) => {
        e.stopPropagation();
        markAsRead(id);
    };

    const handleRemove = (id, e) => {
        e.stopPropagation();
        removeNotification(id);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} />;
            case 'warning': return <AlertTriangle size={20} />;
            case 'error': return <AlertTriangle size={20} />; // Or XCircle
            case 'message': return <MessageCircle size={20} />;
            default: return <Info size={20} />;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };

    return (
        <>
            <div
                className="notification-bell-container"
                onClick={togglePanel}
                onKeyDown={handleKeyDownToggle}
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label="Notifications"
                title="Notifications"
            >
                <Bell size={24} color="#555" />
                {unreadCount > 0 && (
                    <motion.span
                        className="notification-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="notification-panel"
                        ref={panelRef}
                        role="dialog"
                        aria-label="Notification Center"
                        aria-modal="true"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="notification-header">
                            <div>
                                <h3>Universe Pulse</h3>
                                {unreadCount > 0 && <span>{unreadCount} New Stellar Updates</span>}
                            </div>
                            {notifications.length > 0 && (
                                <button className="clear-all-btn" onClick={clearAll}>
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="notification-empty">
                                    <Bell size={48} color="#ddd" />
                                    <p>No new updates in your universe.</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <motion.div
                                        key={notif.id}
                                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                        onClick={() => markAsRead(notif.id)}
                                        layout
                                    >
                                        <div className={`notification-icon ${notif.type}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.title}</div>
                                            <div className="notification-message">{notif.message}</div>
                                            <span className="notification-time">{getTimeAgo(notif.timestamp)}</span>
                                        </div>
                                        <div className="notification-actions">
                                            {!notif.read && (
                                                <button
                                                    className="action-btn"
                                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                    title="Mark as read"
                                                >
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3366' }}></div>
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default NotificationCenter;
