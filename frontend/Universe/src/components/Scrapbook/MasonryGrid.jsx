import React from 'react';

const MasonryGrid = ({ children, breakpointCols = { default: 3, 1100: 2, 700: 1 } }) => {
    // Basic CSS column implementation
    return (
        <div style={{
            columnCount: 3,
            columnGap: '20px',
            padding: '20px',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
        }}
            className="masonry-grid"
        >
            {React.Children.map(children, child => (
                <div style={{ breakInside: 'avoid', marginBottom: '20px' }}>
                    {child}
                </div>
            ))}
        </div>
    );
};

export default MasonryGrid;
