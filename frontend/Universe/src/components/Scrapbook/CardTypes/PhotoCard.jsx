import React from 'react';
import ScrapbookCard from '../ScrapbookCard';

const PhotoCard = ({ memory, onClick }) => {
    return (
        <ScrapbookCard onClick={onClick} className="photo-card">
            <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                <img
                    src={memory.content}
                    alt={memory.style?.caption || "Memory"}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                    }}
                />
            </div>
            {memory.style?.caption && (
                <div style={{ padding: '16px' }}>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>
                        {memory.style.caption}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>PHOTO</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(memory.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            )}
        </ScrapbookCard>
    );
};

export default PhotoCard;
