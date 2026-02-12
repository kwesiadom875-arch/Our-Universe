import React from 'react';
import { motion } from 'framer-motion';

const ScrapbookCard = ({ children, onClick, style, className }) => {
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.04)',
                position: 'relative',
                ...style
            }}
            className={`scrapbook-card ${className || ''}`}
        >
            {children}
        </motion.div>
    );
};

export default ScrapbookCard;
