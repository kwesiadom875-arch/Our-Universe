import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AddMemoryModal from '../components/Scrapbook/AddMemoryModal';
import ConfirmationModal from '../components/ConfirmationModal';
import MasonryGrid from '../components/Scrapbook/MasonryGrid';
import PhotoCard from '../components/Scrapbook/CardTypes/PhotoCard';
import NoteCard from '../components/Scrapbook/CardTypes/NoteCard';
import VoiceCard from '../components/Scrapbook/CardTypes/VoiceCard';
import QuoteCard from '../components/Scrapbook/CardTypes/QuoteCard';
import '../styles/scrapbook.css';

const Scrapbook = () => {
    const [memories, setMemories] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
        isDestructive: false,
        confirmText: "Confirm"
    });

    // Fetch Memories
    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/api/memories`, {
                    headers: { 'x-auth-token': token }
                });
                setMemories(res.data.memories || []);
            } catch (err) {
                console.error('Error fetching memories:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMemories();
    }, []);

    const handleAddMemory = async (memoryData) => {
        try {
            const token = localStorage.getItem('token');

            const newMemory = {
                ...memoryData,
                position: { x: 0, y: 0 },
                rotation: 0,
                scale: 1,
                zIndex: 1
            };

            const res = await axios.post(`${API_BASE_URL}/api/memories`, newMemory, {
                headers: { 'x-auth-token': token }
            });

            setMemories([res.data, ...memories]);
        } catch (err) {
            console.error('Error adding memory:', err);
        }
    };

    const requestDeleteMemory = (id) => {
        setConfirmState({
            isOpen: true,
            title: "Delete this memory?",
            message: "Are you sure you want to let go of this moment? This action cannot be undone.",
            confirmText: "Delete Memory",
            cancelText: "Keep it",
            isDestructive: true,
            onConfirm: () => handleDeleteMemory(id)
        });
    };

    const handleDeleteMemory = async (id) => {
        // Close modal first
        setConfirmState(prev => ({ ...prev, isOpen: false }));

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/memories/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setMemories(prev => prev.filter(m => m._id !== id));
        } catch (err) {
            console.error('Error deleting memory:', err);
        }
    };

    const filteredMemories = memories.filter(m => {
        if (filter === 'all') return true;
        return m.type === filter;
    });

    const renderCard = (memory) => {
        const props = {
            key: memory._id,
            memory: memory,
            onClick: () => requestDeleteMemory(memory._id)
        };

        switch (memory.type) {
            case 'photo': return <PhotoCard {...props} />;
            case 'note': return <NoteCard {...props} />;
            case 'voice': return <VoiceCard {...props} />;
            case 'quote': return <QuoteCard {...props} />;
            default: return null;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar />
            <div className="scrapbook-page-content">

                {/* Header & Controls */}
                <div className="scrapbook-header">
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>Scrapbook</h1>
                        <p style={{ margin: '4px 0 0', color: '#64748b' }}>Collection of {memories.length} memories</p>
                    </div>

                    <div className="filter-bar">
                        {['all', 'photo', 'note', 'voice', 'quote'].map(f => (
                            <button
                                key={f}
                                className={`filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <button className="add-btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={24} />
                    </button>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading your universe...</div>
                ) : (
                    <MasonryGrid>
                        {filteredMemories.map(renderCard)}
                    </MasonryGrid>
                )}

                <AddMemoryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAddMemory={handleAddMemory}
                />

                <ConfirmationModal
                    isOpen={confirmState.isOpen}
                    onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={confirmState.onConfirm}
                    title={confirmState.title}
                    message={confirmState.message}
                    confirmText={confirmState.confirmText}
                    cancelText={confirmState.cancelText}
                    isDestructive={confirmState.isDestructive}
                    type={confirmState.isDestructive ? 'danger' : 'warning'}
                />
            </div>
        </div>
    );
};

export default Scrapbook;
