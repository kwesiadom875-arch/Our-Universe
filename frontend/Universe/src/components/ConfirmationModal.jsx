import React, { useEffect } from 'react';
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

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Handle overlay click to close
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="confirmation-overlay" onClick={handleOverlayClick}>
            <div
                className="confirmation-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-modal-title"
                aria-describedby="confirmation-modal-message"
            >
                <div className="confirmation-icon" style={{ background: getIconBg() }}>
                    {getIcon()}
                </div>

                <h3 id="confirmation-modal-title" className="confirmation-title">{title}</h3>
                <p id="confirmation-modal-message" className="confirmation-message">{message}</p>

                <div className="confirmation-actions">
                    <button
                        className={`action-btn confirm-btn ${isDestructive ? 'destructive' : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    <button
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
