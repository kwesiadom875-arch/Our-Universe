import { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
import { X, ChevronLeft, ChevronRight, Settings, Moon, Sun, BookOpen } from 'lucide-react';
import '../styles/library.css'; // We'll add styles here

const EpubReader = ({ url, initialLocation, onClose, onUpdateProgress }) => {
    const viewerRef = useRef(null);
    const [book, setBook] = useState(null);
    const [rendition, setRendition] = useState(null);
    const [location, setLocation] = useState(initialLocation);
    const [toc, setToc] = useState([]);
    const [showToc, setShowToc] = useState(false);
    const [theme, setTheme] = useState('light'); // light, dark, sepia
    const [fontSize, setFontSize] = useState(100);

    useEffect(() => {
        if (!url) return;

        const newBook = ePub(url);
        setBook(newBook);

        const newRendition = newBook.renderTo(viewerRef.current, {
            width: '100%',
            height: '100%',
            flow: 'paginated',
            manager: 'default',
        });
        setRendition(newRendition);

        const displayPromise = initialLocation
            ? newRendition.display(initialLocation)
            : newRendition.display();

        displayPromise.then(() => {
            console.log('Book rendered');
            updateLocation(newRendition);
        });

        // Load Table of Contents
        newBook.loaded.navigation.then((nav) => {
            setToc(nav.toc);
        });

        // Event listeners
        newRendition.on('relocated', (location) => {
            updateLocation(newRendition);
        });

        return () => {
            if (newBook) {
                newBook.destroy();
            }
        };
    }, [url]);

    // Update location state and notify parent
    const updateLocation = (rend) => {
        if (!rend) return;
        const loc = rend.currentLocation();
        if (loc && loc.start) {
            setLocation(loc.start.cfi);
            // Calculate percentage if possible
            // const percentage = book.locations.percentageFromCfi(loc.start.cfi);
            // onUpdateProgress(loc.start.cfi, percentage); 
            // Note: locations need to be generated first which is heavy. 
            // For now just passing cfi back.
            onUpdateProgress(loc.start.cfi);
        }
    };

    // Theme handling
    useEffect(() => {
        if (rendition) {
            rendition.themes.register('light', { body: { color: '#000', background: '#fff' } });
            rendition.themes.register('dark', { body: { color: '#ddd', background: '#222' } });
            rendition.themes.register('sepia', { body: { color: '#5f4b32', background: '#f6ecd5' } });
            rendition.themes.select(theme);
        }
    }, [theme, rendition]);

    // Font size handling
    useEffect(() => {
        if (rendition) {
            rendition.themes.fontSize(`${fontSize}%`);
        }
    }, [fontSize, rendition]);

    const handlePrev = () => rendition && rendition.prev();
    const handleNext = () => rendition && rendition.next();

    return (
        <div className="epub-reader-overlay">
            <div className="reader-toolbar">
                <button className="reader-btn" onClick={() => setShowToc(!showToc)}>
                    <BookOpen size={20} />
                </button>
                <div className="reader-settings">
                    <button className="reader-btn" onClick={() => setFontSize(s => Math.max(80, s - 10))}>A-</button>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{fontSize}%</span>
                    <button className="reader-btn" onClick={() => setFontSize(s => Math.min(150, s + 10))}>A+</button>

                    <div className="theme-toggles">
                        <button className={`theme-dot light ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} />
                        <button className={`theme-dot sepia ${theme === 'sepia' ? 'active' : ''}`} onClick={() => setTheme('sepia')} />
                        <button className={`theme-dot dark ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} />
                    </div>
                </div>
                <button className="reader-btn close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <div className="reader-content">
                <button className="nav-btn prev" onClick={handlePrev}><ChevronLeft size={30} /></button>
                <div ref={viewerRef} className="epub-viewer" />
                <button className="nav-btn next" onClick={handleNext}><ChevronRight size={30} /></button>
            </div>

            {showToc && (
                <div className="toc-sidebar">
                    <h3>Contents</h3>
                    <ul>
                        {toc.map((item, i) => (
                            <li key={i} onClick={() => {
                                rendition.display(item.href);
                                setShowToc(false);
                            }}>
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default EpubReader;
