import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const MemoryItem = ({ memory, updatePosition, onDelete, isDraggable = true }) => {
    const { type, content, style, position, rotation, scale, zIndex } = memory;

    const handleDragEnd = (event, info) => {
        if (updatePosition) {
            updatePosition(memory._id, {
                x: position.x + info.offset.x,
                y: position.y + info.offset.y
            });
        }
    };

    const renderContent = () => {
        switch (type) {
            case 'photo':
                return (
                    <div className="memory-polaroid" style={{ width: 220, transform: `rotate(${rotation}deg) scale(${scale})` }}>
                        <img src={content} alt="Memory" className="polaroid-img" draggable={false} />
                        {style?.caption && <div className="polaroid-caption">{style.caption}</div>}
                    </div>
                );
            case 'note': {
                const bg = style?.backgroundColor || '#fff9c4';
                const textColor = style?.color || '#5d4e00';
                return (
                    <div
                        className="memory-note"
                        style={{
                            width: 200,
                            transform: `rotate(${rotation}deg) scale(${scale})`,
                            background: bg,
                            color: textColor,
                        }}
                    >
                        <div className="memory-note-content">{content}</div>
                    </div>
                );
            }
            case 'sticker':
                return (
                    <div className="memory-sticker" style={{ width: 100, transform: `rotate(${rotation}deg) scale(${scale})` }}>
                        <img src={content} alt="Sticker" style={{ width: '100%' }} draggable={false} />
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isDraggable) {
        return <div style={{ position: 'absolute', left: position.x, top: position.y, zIndex }}>{renderContent()}</div>;
    }

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x: position.x, y: position.y }}
            style={{ position: 'absolute', zIndex: zIndex || 1, cursor: 'grab' }}
            whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 1000 }}
            onDragEnd={handleDragEnd}
            onPointerDown={(e) => e.stopPropagation()} // Prevent canvas drag when dragging items
        >
            {renderContent()}
            {onDelete && (
                <button
                    className="memory-delete-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(memory._id);
                    }}
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </motion.div>
    );
};

export default MemoryItem;
