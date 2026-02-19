import React, { useEffect, useRef } from 'react';
import { X, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import '../styles/confirmationModal.css';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    type = 'danger' // danger, warning, success
}) => {
    const cancelRef = useRef(null);
    const titleId = "confirmation-title";
    const messageId = "confirmation-message";

    useEffect(() => {
        if (isOpen) {
            // Accessibility: Focus cancel button by default (safer for destructive actions)
            cancelRef.current?.focus();

            // Accessibility: Close on Escape key
            const handleEscape = (e) => e.key === 'Escape' && onClose();
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <Trash2 size={24} color="#ff3366" />;
            case 'warning':
                return <AlertTriangle size={24} color="#f59e0b" />;
            case 'success':
                return <CheckCircle size={24} color="#10b981" />;
            default:
                return <Trash2 size={24} color="#ff3366" />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case 'danger': return 'rgba(255, 51, 102, 0.1)';
            case 'warning': return 'rgba(245, 158, 11, 0.1)';
            case 'success': return 'rgba(16, 185, 129, 0.1)';
            default: return 'rgba(255, 51, 102, 0.1)';
        }
    };

    return (
        <div
            className="confirmation-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={messageId}
        >
            <div className="confirmation-card">
                <div className="confirmation-icon" style={{ background: getIconBg() }}>
                    {getIcon()}
                </div>

                <h3 id={titleId} className="confirmation-title">{title}</h3>
                <p id={messageId} className="confirmation-message">{message}</p>

                <div className="confirmation-actions">
                    <button
                        className={`action-btn confirm-btn ${isDestructive ? 'destructive' : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    <button
                        ref={cancelRef}
                        className="action-btn cancel-btn"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
