import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import PhotoCard from './CardTypes/PhotoCard';
import NoteCard from './CardTypes/NoteCard';
import VoiceCard from './CardTypes/VoiceCard';
import QuoteCard from './CardTypes/QuoteCard';

const GRID_SIZE = 20;

const DraggableMemory = ({ memory, onUpdate, onDelete, onFocus }) => {
    const [isDragging, setIsDragging] = useState(false);

    // Determine which card component to render
    const renderCardContent = () => {
        switch (memory.type) {
            case 'photo':
                return <PhotoCard memory={memory} />;
            case 'note':
                return <NoteCard memory={memory} />;
            case 'voice':
                return <VoiceCard memory={memory} />;
            case 'quote':
                return <QuoteCard memory={memory} />;
            default:
                return null;
        }
    };

    const handleDragStart = () => {
        setIsDragging(true);
        onFocus(memory._id); // Bring to front
    };

    const handleDragEnd = (event, info) => {
        setIsDragging(false);

        // Calculate snapped position
        // info.point is absolute, we need relative to parent. 
        // actually framer-motion 'drag' prop modifies the element's transform.
        // We typically rely on visual snapping or manual position updates.
        // For simple canvas, we can use onDragEnd to get the final delta or position if we track it.

        // Better approach for "controlled" position with API saving:
        // We read the DOM element's visual position or use info.offset?
        // Let's rely on info.point and some math if the parent is relative.
        // Actually, easiest way with framer-motion for absolute canvas is to use the `x` and `y` props directly 
        // and update them onDragEnd.

        // BUT, `info.point` is page coordinates. `info.offset` is drag distance.
        // We need the new local coordinates.
        // A common pattern is to just let it visually stay (uncontrolled) until save, but we want snap.

        // Let's assume the parent container is the reference frame.
        // The `drag` prop allows free movement.

        // To implement SNAP: 
        // We can use `dragSnapToOrigin={false}` and `dragElastic={0}`.
        // `dragMomentum={false}` to stop it sliding.
        // And manually round the x/y in onDragEnd.

        // However, obtaining the exact "new" x/y from `info` relative to parent can be tricky without refs.
        // Let's try a simpler approach: 
        // On Drag End, we trigger the update with an estimated position or just save the visual state if possible.
        // Actually, simpler: We calculate the new position based on original + delta.

        const currentX = memory.position?.x || 0;
        const currentY = memory.position?.y || 0;

        let newX = currentX + info.offset.x;
        let newY = currentY + info.offset.y;

        // Snap to grid
        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
        newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

        onUpdate(memory._id, { position: { x: newX, y: newY } });
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{
                x: memory.position?.x || 0,
                y: memory.position?.y || 0,
                opacity: 0,
                scale: 0.8
            }}
            animate={{
                x: memory.position?.x || 0,
                y: memory.position?.y || 0,
                opacity: 1,
                scale: memory.scale || 1,
                zIndex: memory.zIndex || 1
            }}
            whileHover={{ scale: 1.02, zIndex: (memory.zIndex || 1) + 10 }}
            whileDrag={{ scale: 1.05, zIndex: 9999, cursor: 'grabbing' }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => onFocus(memory._id)}
            style={{
                position: 'absolute',
                cursor: 'grab',
                width: 280, // Fixed width prevents collapse
                // Optional: Add a subtle border or shadow when selected/dragging?
            }}
        >
            {/* Delete/Edit Controls could overlay here on hover */}
            <div style={{ position: 'relative' }}>
                {renderCardContent()}

                {/* Simple Delete Button (visible on hover could be better, but let's keep it simple for now) */}
                {/* Or maybe we let the Card component handle internal actions? 
                    For now, let's just render the content. The logic in Scrapbook.jsx uses a modal or similar?
                    Actually, we might need a way to delete. Let's rely on the card's internal UI or add a small 'x' here?
                    The previous Grid implementation likely let the cards handle it or had a wrapper.
                */}
            </div>
        </motion.div>
    );
};

export default DraggableMemory;
