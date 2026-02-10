import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Plane, Coffee, Sparkles } from 'lucide-react';
import '../../styles/scrapbook.css';

const stickers = {
    love: [
        'https://cdn-icons-png.flaticon.com/512/2589/2589175.png', // Heart
        'https://cdn-icons-png.flaticon.com/512/929/929417.png',   // Love Letter
        'https://cdn-icons-png.flaticon.com/512/1077/1077035.png'  // Lips
    ],
    travel: [
        'https://cdn-icons-png.flaticon.com/512/2200/2200326.png', // Plane
        'https://cdn-icons-png.flaticon.com/512/826/826070.png',   // Globe
        'https://cdn-icons-png.flaticon.com/512/2928/2928883.png'  // Camera
    ],
    daily: [
        'https://cdn-icons-png.flaticon.com/512/2935/2935413.png', // Coffee
        'https://cdn-icons-png.flaticon.com/512/2838/2838912.png', // Book
        'https://cdn-icons-png.flaticon.com/512/864/864685.png'    // Sun
    ],
    animated: [
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtY2J5cnZ4aTc4aGZqamE4aHl6aGZqamE4aHl6aGZqamE4aHl6aHN6CZlcD12MV9zdGlja2Vycy9zZWFyY2g&rid=giphy.gif', // Sparkles (Placeholder)
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGZqamE4aHl6aGZqamE4aHl6aGZqamE4aHl6aGZqamE4aHl6aHN6CZlcD12MV9zdGlja2Vycy9zZWFyY2g&rid=giphy.gif'  // Heart (Placeholder)
    ]
};

const StickerDrawer = ({ isOpen, onClose, onSelectSticker }) => {
    const [category, setCategory] = useState('love');

    return (
        <div className={`sticker-drawer glass-panel ${isOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: 'white' }}>Sticker Drawer</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
            </div>

            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10, marginBottom: 15 }}>
                <button className={`sticker-category-tab ${category === 'love' ? 'active' : ''}`} onClick={() => setCategory('love')}>
                    <Heart size={16} style={{ marginRight: 5 }} /> Love
                </button>
                <button className={`sticker-category-tab ${category === 'travel' ? 'active' : ''}`} onClick={() => setCategory('travel')}>
                    <Plane size={16} style={{ marginRight: 5 }} /> Travel
                </button>
                <button className={`sticker-category-tab ${category === 'daily' ? 'active' : ''}`} onClick={() => setCategory('daily')}>
                    <Coffee size={16} style={{ marginRight: 5 }} /> Daily
                </button>
                <button className={`sticker-category-tab ${category === 'animated' ? 'active' : ''}`} onClick={() => setCategory('animated')}>
                    <Sparkles size={16} style={{ marginRight: 5 }} /> Magic
                </button>
            </div>

            <div className="sticker-grid">
                {stickers[category].map((src, index) => (
                    <motion.img
                        key={index}
                        src={src}
                        className="sticker-item"
                        alt="sticker"
                        style={{ width: '100%', height: 'auto' }}
                        drag
                        dragSnapToOrigin /* Snaps back if not dropped on canvas - logic handled by parent usually */
                        onClick={() => onSelectSticker(src)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    />
                ))}
            </div>
        </div>
    );
};

export default StickerDrawer;
