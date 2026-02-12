import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Type, Check, Upload, Mic, Quote, Camera, StopCircle, Play, RotateCcw } from 'lucide-react';
import Webcam from 'react-webcam';
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
    const [preview, setPreview] = useState(null); // For images
    const [audioName, setAudioName] = useState(null); // For audio files
    const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
    const fileInputRef = useRef(null);
    const audioInputRef = useRef(null);

    // Camera State
    const [isCameraMode, setIsCameraMode] = useState(false);
    const webcamRef = useRef(null);

    // Voice Recorder State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null); // For playback preview
    const mediaRecorderRef = useRef(null);
    const timerRef = useRef(null);

    // Debugging: Verify component update
    useEffect(() => {
        console.log("AddMemoryModal mounted - Real-time features active");
    }, []);

    const handleFileSelect = async (e, fileType = 'image') => {
        const file = e.target.files[0];
        if (!file) return;

        if (fileType === 'image') {
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target.result);
            reader.readAsDataURL(file);
        } else if (fileType === 'audio') {
            setAudioName(file.name);
            setAudioUrl(URL.createObjectURL(file)); // Preview upload
        }

        await uploadFile(file);
    };

    const uploadFile = async (file) => {
        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', file); // Field name 'image' used by backend for both types currently

            const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setContent(res.data.url);
        } catch (err) {
            console.error('Error uploading file:', err);
            alert('Failed to upload file. Please try again.');
            setPreview(null);
            setAudioName(null);
        } finally {
            setUploading(false);
        }
    };

    // Camera Functions
    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setPreview(imageSrc);
        setIsCameraMode(false);

        // Convert base64 to blob for upload
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "webcam-photo.jpg", { type: "image/jpeg" });
                uploadFile(file);
            });
    }, [webcamRef]);

    // Voice Recording Functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setAudioName(`Voice Note ${new Date().toLocaleTimeString()}`);

                // Auto upload after recording stops? Or wait for user? Let's auto upload for simplicity
                const file = new File([blob], "voice-note.webm", { type: "audio/webm" });
                uploadFile(file);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        setAudioName(null);
        setAudioUrl(null);
        setAudioBlob(null);
        setIsCameraMode(false);
        setIsRecording(false);
        setUploading(false);
        if (timerRef.current) clearInterval(timerRef.current);
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
                style={{ width: 500, padding: 30, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
            >
                <button onClick={resetAndClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#475569', cursor: 'pointer', zIndex: 10 }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: 20, textAlign: 'center', color: '#1e293b' }}>Capture a Moment</h2>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 30, flexWrap: 'wrap' }}>
                    {['photo', 'note', 'voice', 'quote'].map((t) => (
                        <button
                            key={t}
                            onClick={() => { setType(t); setContent(''); setPreview(null); setAudioName(null); setIsCameraMode(false); }}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 20,
                                border: 'none',
                                background: type === t ? '#ff3366' : 'rgba(0,0,0,0.05)',
                                color: type === t ? '#fff' : '#475569',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 600,
                                transition: 'all 0.3s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {t === 'photo' && <ImageIcon size={16} />}
                            {t === 'note' && <Type size={16} />}
                            {t === 'voice' && <Mic size={16} />}
                            {t === 'quote' && <Quote size={16} />}
                            {t}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {type === 'photo' ? (
                        <>
                            {isCameraMode ? (
                                <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', position: 'relative', background: '#000' }}>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        style={{ width: '100%', display: 'block' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        style={{
                                            position: 'absolute',
                                            bottom: 20,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            padding: '12px 24px',
                                            background: '#ff3366',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 24,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            fontWeight: 600
                                        }}
                                    >
                                        <Camera size={20} /> Capture
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Camera Button (Prioritized) */}
                                    {!preview && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCameraMode(true)}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                background: '#f1f5f9',
                                                border: '2px dashed #cbd5e1',
                                                borderRadius: 12,
                                                color: '#475569',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 10,
                                                marginBottom: 20,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.borderColor = '#ff3366'}
                                            onMouseLeave={(e) => e.target.style.borderColor = '#cbd5e1'}
                                        >
                                            <Camera size={24} color="#ff3366" /> Use Camera
                                        </button>
                                    )}

                                    {/* Upload Area */}
                                    <div
                                        style={{
                                            background: preview ? 'transparent' : 'rgba(0,0,0,0.03)',
                                            height: preview ? 220 : 120, // Smaller if just upload
                                            borderRadius: 12,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: preview ? 'none' : '2px dashed rgba(0,0,0,0.15)',
                                            marginBottom: 10,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {preview ? (
                                            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                                        ) : uploading ? (
                                            <div style={{ color: '#64748b', textAlign: 'center' }}>
                                                <div className="upload-spinner" />
                                                <p>Uploading...</p>
                                            </div>
                                        ) : (
                                            <div style={{ color: '#64748b', textAlign: 'center' }} onClick={() => fileInputRef.current?.click()}>
                                                <Upload size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                                                <p style={{ margin: 0, fontWeight: 500 }}>Or upload an image</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileSelect(e, 'image')}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* URL Input (Hidden if camera mode) */}
                            {!isCameraMode && (
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
                            )}

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
                    ) : type === 'note' ? (
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
                    ) : type === 'voice' ? (
                        <>
                            <div
                                style={{
                                    background: isRecording ? '#fee2e2' : audioName ? 'rgba(0,255,0,0.05)' : 'rgba(0,0,0,0.03)',
                                    height: 150,
                                    borderRadius: 12,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: isRecording ? '2px solid #ef4444' : audioName ? '2px solid #4ade80' : '2px dashed rgba(0,0,0,0.15)',
                                    marginBottom: 20,
                                    cursor: 'default',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {uploading ? (
                                    <div className="upload-spinner" />
                                ) : isRecording ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: 60, height: 60, borderRadius: '50%', background: '#ef4444',
                                            marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            animation: 'pulse 1.5s infinite'
                                        }}>
                                            <Mic size={32} color="white" />
                                        </div>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#ef4444', fontSize: '1.2rem' }}>
                                            {formatTime(recordingTime)}
                                        </p>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.7 }}>Recording...</p>
                                        <button
                                            type="button"
                                            onClick={stopRecording}
                                            style={{
                                                marginTop: 12,
                                                padding: '6px 16px',
                                                background: '#1e293b',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 16,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                margin: '12px auto 0'
                                            }}
                                        >
                                            <StopCircle size={14} /> Stop
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {audioName ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                                    <Check size={28} color="#16a34a" />
                                                </div>
                                                <p style={{ margin: 0, fontWeight: 600, color: '#16a34a' }}>{audioName}</p>
                                                {audioUrl && <audio controls src={audioUrl} style={{ marginTop: 10, height: 32 }} />}

                                                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12 }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setAudioName(null); setAudioUrl(null); setContent(''); }}
                                                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                                    >
                                                        <RotateCcw size={12} /> Record Again
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={startRecording}
                                                    style={{
                                                        width: 64,
                                                        height: 64,
                                                        borderRadius: '50%',
                                                        background: '#ff3366',
                                                        border: 'none',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 4px 15px rgba(255, 51, 102, 0.4)',
                                                        marginBottom: 12,
                                                        margin: '0 auto 12px'
                                                    }}
                                                >
                                                    <Mic size={32} />
                                                </button>
                                                <p style={{ margin: 0, fontWeight: 600 }}>Click to Record</p>
                                                <p style={{ margin: '8px 0 16px', fontSize: '0.8rem', opacity: 0.6 }}>or</p>
                                                <button
                                                    type="button"
                                                    onClick={() => audioInputRef.current?.click()}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: 'rgba(0,0,0,0.05)',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        color: '#475569',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    Upload File
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <input
                                ref={audioInputRef}
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleFileSelect(e, 'audio')}
                                style={{ display: 'none' }}
                            />
                            <input
                                type="text"
                                placeholder="Name your voice note..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    borderRadius: 8,
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    background: 'rgba(0,0,0,0.03)',
                                    marginBottom: 20
                                }}
                            />
                        </>
                    ) : type === 'quote' ? (
                        <>
                            <textarea
                                placeholder="Enter your quote..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: 120,
                                    padding: 15,
                                    borderRadius: 8,
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    background: '#fff',
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '1.2rem',
                                    fontStyle: 'italic',
                                    marginBottom: 12,
                                    resize: 'none'
                                }}
                                autoFocus
                            />
                            <input
                                type="text"
                                placeholder="Label (e.g., REMINDER, INSPIRATION)..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    borderRadius: 8,
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    background: 'rgba(0,0,0,0.03)',
                                    marginBottom: 20
                                }}
                            />
                        </>
                    ) : null}

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
