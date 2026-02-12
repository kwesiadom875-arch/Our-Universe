import React from 'react';
import ScrapbookCard from '../ScrapbookCard';

const NoteCard = ({ memory, onClick }) => {
    const { backgroundColor, color, fontFamily } = memory.style || {};

    return (
        <ScrapbookCard
            onClick={onClick}
            style={{ backgroundColor: backgroundColor || '#fff9c4' }}
            className="note-card"
        >
            <div style={{ padding: '24px' }}>
                <p style={{
                    margin: '0 0 16px 0',
                    color: color || '#5d4e00',
                    fontSize: '1.1rem',
                    fontFamily: fontFamily || "'Kalam', cursive",
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                }}>
                    {memory.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${color}20`, paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: color || '#5d4e00', opacity: 0.7, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>NOTE</span>
                    <span style={{ fontSize: '0.75rem', color: color || '#5d4e00', opacity: 0.7 }}>{new Date(memory.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </ScrapbookCard>
    );
};

export default NoteCard;
