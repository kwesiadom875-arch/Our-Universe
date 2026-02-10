import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import axios from 'axios';
import { Plus, Sticker, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MemoryItem from '../components/Scrapbook/MemoryItem';
import StickerDrawer from '../components/Scrapbook/StickerDrawer';
import AddMemoryModal from '../components/Scrapbook/AddMemoryModal';
import '../styles/scrapbook.css';

const Scrapbook = () => {
    const [memories, setMemories] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const containerRef = useRef(null);

    // Motion values for the draggable canvas so we can read position
    const canvasX = useMotionValue(0);
    const canvasY = useMotionValue(0);

    // Fetch Memories
    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/memories', {
                    headers: { 'x-auth-token': token }
                });
                setMemories(res.data);
            } catch (err) {
                console.error('Error fetching memories:', err);
            }
        };
        fetchMemories();
    }, []);

    // Add Memory / Sticker
    const handleAddMemory = async (memoryData) => {
        try {
            const token = localStorage.getItem('token');

            // Calculate position relative to the canvas so the item appears in the center of the viewport
            const containerEl = containerRef.current;
            const containerWidth = containerEl ? containerEl.clientWidth : window.innerWidth;
            const containerHeight = containerEl ? containerEl.clientHeight : window.innerHeight;

            const newMemory = {
                ...memoryData,
                position: {
                    x: -canvasX.get() + containerWidth / 2 - 100,
                    y: -canvasY.get() + containerHeight / 2 - 100
                },
                rotation: Math.random() * 20 - 10, // Random tilt
                scale: 1,
                zIndex: memories.length + 1
            };

            const res = await axios.post('http://localhost:5000/api/memories', newMemory, {
                headers: { 'x-auth-token': token }
            });

            setMemories([...memories, res.data]);
        } catch (err) {
            console.error('Error adding memory:', err);
        }
    };

    // Update Position after drag
    const updatePosition = async (id, newPos) => {
        // Optimistic update
        setMemories(prev => prev.map(m => m._id === id ? { ...m, position: newPos } : m));

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/memories/${id}`, { position: newPos }, {
                headers: { 'x-auth-token': token }
            });
        } catch (err) {
            console.error('Error updating position:', err);
        }
    };

    // Delete Memory
    const handleDeleteMemory = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/memories/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setMemories(prev => prev.filter(m => m._id !== id));
        } catch (err) {
            console.error('Error deleting memory:', err);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <div className="background-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>
            <Sidebar />
            <div className="scrapbook-container" ref={containerRef}>
                {/* Infinite Canvas Effect */}
                <motion.div
                    className="scrapbook-canvas"
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    style={{ x: canvasX, y: canvasY }}
                >
                    {memories.map(memory => (
                        <MemoryItem
                            key={memory._id}
                            memory={memory}
                            updatePosition={updatePosition}
                            onDelete={handleDeleteMemory}
                        />
                    ))}
                </motion.div>

                {/* Floating Controls */}
                <div className="scrapbook-controls">
                    <button className="control-btn" onClick={() => setIsDrawerOpen(true)}>
                        <Sticker size={24} />
                    </button>
                    <button className="control-btn primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={32} />
                    </button>
                    <button className="control-btn" onClick={() => window.location.reload()}>
                        <Save size={24} />
                    </button>
                </div>

                {/* Drawers & Modals */}
                <StickerDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onSelectSticker={(src) => {
                        handleAddMemory({ type: 'sticker', content: src, style: {} });
                        setIsDrawerOpen(false);
                    }}
                />

                <AddMemoryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAddMemory={handleAddMemory}
                />
            </div>
        </div>
    );
};

export default Scrapbook;
