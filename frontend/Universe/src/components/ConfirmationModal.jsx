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
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            // Focus cancel button for safety
            if (cancelRef.current) {
                cancelRef.current.focus();
            }

            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                if (previousFocusRef.current) {
                    previousFocusRef.current.focus();
                }
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
                <div className="confirmation-icon" style={{ background: getIconBg() }}>
                    {getIcon()}
                </div>

                <h3 className="confirmation-title" id="modal-title">{title}</h3>
                <p className="confirmation-message" id="modal-message">{message}</p>

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
                        ref={cancelRef}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
