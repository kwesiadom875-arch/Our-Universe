import React, { useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
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

    useEffect(() => {
        if (isOpen) {
            // Focus cancel button for safety (prevent accidental confirmation)
            // Use setTimeout to ensure DOM is ready if needed, though usually works directly in effect
            const timer = setTimeout(() => cancelRef.current?.focus(), 50);

            const handleEscape = (e) => e.key === 'Escape' && onClose();
            window.addEventListener('keydown', handleEscape);

            return () => {
                window.removeEventListener('keydown', handleEscape);
                clearTimeout(timer);
            };
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
            aria-labelledby="modal-title"
            aria-describedby="modal-message"
        >
            <div className="confirmation-card">
                <div className="confirmation-icon" aria-hidden="true" style={{ background: getIconBg() }}>
                    {getIcon()}
                </div>

                <h3 id="modal-title" className="confirmation-title">{title}</h3>
                <p id="modal-message" className="confirmation-message">{message}</p>

                <div className="confirmation-actions">
                    <button
                        type="button"
                        className={`action-btn confirm-btn ${isDestructive ? 'destructive' : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
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
