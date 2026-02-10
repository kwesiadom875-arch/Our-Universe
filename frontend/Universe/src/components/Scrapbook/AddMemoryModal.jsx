import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Type, Check, Upload } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import '../../styles/scrapbook.css';

const NOTE_COLORS = [
    { name: 'Yellow', bg: '#fff9c4', text: '#5d4e00' },
    { name: 'Pink', bg: '#fce4ec', text: '#880e4f' },
    { name: 'Blue', bg: '#e3f2fd', text: '#0d47a1' },
    { name: 'Green', bg: '#e8f5e9', text: '#1b5e20' },
    { name: 'Orange', bg: '#fff3e0', text: '#e65100' },
    { name: 'Purple', bg: '#f3e5f5', text: '#4a148c' },
    { name: 'Coral', bg: '#fbe9e7', text: '#bf360c' },
    { name: 'Mint', bg: '#e0f2f1', text: '#004d40' },
];

const AddMemoryModal = ({ isOpen, onClose, onAddMemory }) => {
    const [type, setType] = useState('photo');
    const [content, setContent] = useState('');
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show local preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);

        // Upload to server
        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', file);

            const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setContent(res.data.url);
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image. Please try again.');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onAddMemory({
            type,
            content,
            style: {
                caption,
                backgroundColor: type === 'note' ? noteColor.bg : '#fff',
                color: type === 'note' ? noteColor.text : undefined
            }
        });
        resetAndClose();
    };

    const resetAndClose = () => {
        onClose();
        setContent('');
        setCaption('');
        setPreview(null);
        setUploading(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}
            onClick={(e) => { if (e.target === e.currentTarget) resetAndClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-modal"
                style={{ width: 500, padding: 30, position: 'relative' }}
            >
                <button onClick={resetAndClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: 20, textAlign: 'center', color: '#1e293b' }}>Capture a Moment</h2>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 30 }}>
                    <button
                        onClick={() => { setType('photo'); setContent(''); setPreview(null); }}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 20,
                            border: 'none',
                            background: type === 'photo' ? '#ff3366' : 'rgba(0,0,0,0.05)',
                            color: type === 'photo' ? '#fff' : '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 600,
                            transition: 'all 0.3s'
                        }}
                    >
                        <ImageIcon size={18} /> Photo
                    </button>
                    <button
                        onClick={() => { setType('note'); setContent(''); setPreview(null); }}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 20,
                            border: 'none',
                            background: type === 'note' ? '#ff3366' : 'rgba(0,0,0,0.05)',
                            color: type === 'note' ? '#fff' : '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 600,
                            transition: 'all 0.3s'
                        }}
                    >
                        <Type size={18} /> Note
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {type === 'photo' ? (
                        <>
                            {/* Image Upload Area */}
                            <div
                                style={{
                                    background: preview ? 'transparent' : 'rgba(0,0,0,0.03)',
                                    height: 220,
                                    borderRadius: 12,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: preview ? 'none' : '2px dashed rgba(0,0,0,0.15)',
                                    marginBottom: 20,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                                ) : uploading ? (
                                    <div style={{ color: '#64748b', textAlign: 'center' }}>
                                        <div className="upload-spinner" />
                                        <p>Uploading...</p>
                                    </div>
                                ) : (
                                    <div style={{ color: '#64748b', textAlign: 'center' }}>
                                        <Upload size={36} style={{ marginBottom: 8, opacity: 0.5 }} />
                                        <p style={{ margin: 0, fontWeight: 600 }}>Click to upload an image</p>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.7 }}>or paste a URL below</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {/* URL Input */}
                            <input
                                type="text"
                                placeholder="Or paste an image URL..."
                                value={content}
                                onChange={(e) => { setContent(e.target.value); setPreview(e.target.value || null); }}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    borderRadius: 8,
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    background: 'rgba(0,0,0,0.03)',
                                    color: '#1e293b',
                                    marginBottom: 12,
                                    boxSizing: 'border-box'
                                }}
                            />

                            {/* Caption */}
                            <input
                                type="text"
                                placeholder="Write a caption..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    borderRadius: 8,
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    background: 'rgba(0,0,0,0.03)',
                                    color: '#1e293b',
                                    marginBottom: 20,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </>
                    ) : (
                        <>
                            {/* Color Picker */}
                            <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>Choose a color</p>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {NOTE_COLORS.map((c) => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            onClick={() => setNoteColor(c)}
                                            title={c.name}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                border: noteColor.name === c.name ? '3px solid #ff3366' : '2px solid rgba(0,0,0,0.1)',
                                                background: c.bg,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                transform: noteColor.name === c.name ? 'scale(1.15)' : 'scale(1)',
                                                boxShadow: noteColor.name === c.name ? '0 0 0 2px rgba(255,51,102,0.3)' : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <textarea
                                placeholder="Write your thought..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: 180,
                                    padding: 15,
                                    borderRadius: 4,
                                    border: 'none',
                                    background: noteColor.bg,
                                    color: noteColor.text,
                                    fontFamily: "'Kalam', cursive",
                                    fontSize: '1.2rem',
                                    marginBottom: 20,
                                    resize: 'none',
                                    boxSizing: 'border-box',
                                    boxShadow: '2px 4px 12px rgba(0,0,0,0.12)',
                                    lineHeight: 1.6
                                }}
                                autoFocus
                            />
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || !content.trim()}
                        style={{
                            width: '100%',
                            padding: 15,
                            background: uploading || !content.trim() ? '#94a3b8' : '#ff3366',
                            border: 'none',
                            borderRadius: 12,
                            color: '#fff',
                            fontWeight: 'bold',
                            cursor: uploading || !content.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 10,
                            transition: 'all 0.3s'
                        }}
                    >
                        <Check size={20} /> Pin to Scrapbook
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AddMemoryModal;
