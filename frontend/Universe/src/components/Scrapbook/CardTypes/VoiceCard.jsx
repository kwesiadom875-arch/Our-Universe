import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import ScrapbookCard from '../ScrapbookCard';

const VoiceCard = ({ memory, onClick }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setProgress((current / duration) * 100);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    return (
        <ScrapbookCard onClick={onClick} className="voice-card">
            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <button
                        onClick={togglePlay}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#ff3366',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(255, 51, 102, 0.3)'
                        }}
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
                    </button>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1e293b' }}>
                            {memory.style?.caption || "Voice Note"}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                            <Volume2 size={12} />
                            <span>Audio Clip</span>
                        </div>
                    </div>
                </div>

                <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div
                        style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: '#ff3366',
                            transition: 'width 0.1s linear'
                        }}
                    />
                </div>

                <audio
                    ref={audioRef}
                    src={memory.content}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>VOICE</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(memory.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </ScrapbookCard>
    );
};

export default VoiceCard;
