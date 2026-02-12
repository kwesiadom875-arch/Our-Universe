import React from 'react';
import ScrapbookCard from '../ScrapbookCard';

const QuoteCard = ({ memory, onClick }) => {
    return (
        <ScrapbookCard
            onClick={onClick}
            style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', color: '#fff' }}
            className="quote-card"
        >
            <div style={{ padding: '32px 24px' }}>
                <p style={{
                    margin: '0 0 20px 0',
                    color: '#fff',
                    fontSize: '1.4rem',
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    "{memory.content}"
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#fff', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>QUOTE</span>
                    <span style={{ fontSize: '0.75rem', color: '#fff' }}>{memory.style?.caption || "REMINDER"}</span>
                </div>
            </div>
        </ScrapbookCard>
    );
};

export default QuoteCard;
