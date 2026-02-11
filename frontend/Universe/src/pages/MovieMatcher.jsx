import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Film, Monitor, Star, X, Heart, Sparkles, Plus, Grid, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import MediaSearchModal from '../components/MediaSearchModal';
import { Link } from 'react-router-dom';
import '../styles/moviematcher.css';

const MovieMatcher = () => {
    const { token } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [matches, setMatches] = useState([]);
    const [newMatch, setNewMatch] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mediaType, setMediaType] = useState('movie'); // 'movie' or 'tv'
    const [showSearch, setShowSearch] = useState(false);
    const [page, setPage] = useState(1);

    // Motion Values
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    useEffect(() => {
        // Reset whenever type changes
        setMovies([]);
        setCurrentIndex(0);
        setPage(1);
        fetchMovies(1, mediaType, true);
        fetchMatches();
    }, [token, mediaType]);

    const fetchMovies = async (pageNum, type, reset = false) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            // We use the new logic in backend which might auto-fetch pages, 
            // but here we might want to manually handle pagination if we want infinite scroll feeling.
            // For now, let's use the 'popular' endpoint we updated.
            // Note: The backend endpoint currently hardcodes filtering.
            // We need to pass 'type' to backend.

            const res = await axios.get(`${API_BASE_URL}/api/media/popular?type=${type}`, config);

            if (reset) {
                setMovies(res.data.results);
            } else {
                setMovies(prev => [...prev, ...res.data.results]);
            }
        } catch (err) {
            console.error("Error fetching movies:", err);
        }
    };

    const fetchMatches = async () => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get(`${API_BASE_URL}/api/movies/matches`, config);
            setMatches(res.data);
        } catch (err) {
            console.error("Error fetching matches:", err);
        }
    };

    const handleDragEnd = async (event, info) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            await swipe('right');
        } else if (info.offset.x < -threshold) {
            await swipe('left');
        }
    };

    const swipe = async (direction) => {
        const item = movies[currentIndex];
        const action = direction === 'right' ? 'like' : 'pass';

        setCurrentIndex(prev => prev + 1);
        x.set(0);

        // Fetch more if running low
        if (movies.length - currentIndex < 5) {
            // In a real app we'd fetch page + 1
            // For now, let's just rely on the backend randomizing or re-fetching
        }

        try {
            const config = {
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
            };
            const payload = {
                tmdbId: item.id,
                title: item.title || item.name,
                posterPath: item.poster_path,
                action
            };
            // Use existing swipe route (it's hardcoded for movies logic mostly but we can adapt)
            // Or use media route? The 'swipe' route in movies.js handles matching logic.
            // We should use that for matching.
            const res = await axios.post(`${API_BASE_URL}/api/movies/swipe`, payload, config);

            if (res.data.match) {
                setNewMatch(res.data.movieData);
                setMatches(prev => [...prev, res.data.movieData]);
            }
        } catch (err) {
            console.error("Error saving swipe:", err);
        }
    };

    const currentItem = movies[currentIndex];
    const nextItem = movies[currentIndex + 1];


    /* --- Styles for Popcorn Time --- */
    const cardVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: { scale: 1, opacity: 1 },
        exit: (custom) => ({
            x: custom < 0 ? -500 : 500,
            opacity: 0,
            rotate: custom < 0 ? -20 : 20,
            transition: { duration: 0.3 }
        })
    };

    if (!currentItem && movies.length > 0) return (
        <Layout>
            <div className="matcher-empty-state">
                <Film size={48} className="mb-4 text-white/50" />
                <h2>That's all for now!</h2>
                <button onClick={() => window.location.reload()} className="refresh-btn">Refresh Recommendations</button>
            </div>
        </Layout>
    );

    // Loading State
    if (movies.length === 0) return <Layout><div className="matcher-loading">Populating your queue...</div></Layout>;

    return (
        <Layout>
            <div className="popcorn-matcher-container">
                {/* Header */}
                <header className="matcher-header">
                    <div className="brand">
                        <div className="icon-bg"><Sparkles size={20} color="white" /></div>
                        <span>Our Universe</span>
                    </div>
                    <div className="header-actions">
                        <Link to="/medialibrary" className="library-link">
                            <Grid size={20} /> Library
                        </Link>
                        {/* Type Toggle */}
                        <div className="toggle-switch">
                            <button
                                className={mediaType === 'movie' ? 'active' : ''}
                                onClick={() => setMediaType('movie')}
                            >
                                Movies
                            </button>
                            <button
                                className={mediaType === 'tv' ? 'active' : ''}
                                onClick={() => setMediaType('tv')}
                            >
                                TV
                            </button>
                        </div>
                    </div>
                </header>

                <div className="matcher-content">
                    {/* Partner Status Bubbles */}
                    <div className="partner-status left">
                        <div className="status-bubble">
                            <span className="mug-icon">☕</span>
                            <span>Sarah is Thinking...</span>
                        </div>
                        <div className="status-bubble waiting">
                            <span className="mug-icon dot-anim">...</span>
                        </div>
                    </div>

                    {/* Card Stack */}
                    <div className="card-area">
                        <AnimatePresence>
                            {/* Background Card */}
                            {nextItem && (
                                <motion.div
                                    className="movie-card background-card"
                                    initial={{ scale: 0.9, y: 30, opacity: 0.5 }}
                                    animate={{ scale: 0.95, y: 20, opacity: 0.7 }}
                                    key={nextItem.id}
                                    style={{
                                        backgroundImage: `url(https://image.tmdb.org/t/p/w500${nextItem.poster_path})`
                                    }}
                                />
                            )}

                            {/* Active Card */}
                            <motion.div
                                key={currentItem.id}
                                className="movie-card active-card"
                                style={{ x, rotate, backgroundImage: `url(https://image.tmdb.org/t/p/w500${currentItem.poster_path})` }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleDragEnd}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                custom={x.get()}
                            >
                                {/* Gradient Overlay */}
                                <div className="card-gradient"></div>

                                {/* Content */}
                                <div className="card-info">
                                    <div className="match-tag">TOP MATCH <Star size={12} fill="white" /> {currentItem.vote_average.toFixed(1)}</div>
                                    <h1>{currentItem.title || currentItem.name}</h1>
                                    <p className="overview-text">{currentItem.overview}</p>

                                    <div className="tags">
                                        <span className="tag">{mediaType === 'movie' ? 'Film' : 'TV Series'}</span>
                                        {currentItem.release_date && <span className="tag">{currentItem.release_date.split('-')[0]}</span>}
                                        {/* Create pseudo-tags from IDs since we don't have genre map handy without another call, usually passed from backend */}
                                        <span className="tag">Romance</span>
                                        <span className="tag">Sci-Fi</span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Floating Navigation Pill */}
                    <div className="interaction-pill">
                        <button className="pill-btn prev" onClick={() => { }} title="Previous Info (Not implemented)"><ChevronLeft size={20} /></button>
                        <div className="divider"></div>
                        <button className="pill-btn nope" onClick={() => swipe('left')}><X size={24} /></button>
                        <div className="divider"></div>
                        <button className="pill-btn like" onClick={() => swipe('right')}><Heart size={24} fill="currentColor" /></button>
                        <div className="divider"></div>
                        <button className="pill-btn next" onClick={() => { }} title="More Info"><Info size={20} /></button>
                    </div>

                    {/* Extra Controls */}
                    <div className="bottom-actions">
                        <button className="add-watched-link" onClick={() => setShowSearch(true)}>
                            Seen it? Add to Library
                        </button>
                        <div className="key-hint">
                            Swipe or use keys <div className="key-icon">←</div> <div className="key-icon">→</div>
                        </div>
                    </div>
                </div>

                <MediaSearchModal
                    isOpen={showSearch}
                    onClose={() => setShowSearch(false)}
                />

                {/* Match Overlay */}
                <AnimatePresence>
                    {newMatch && (
                        <motion.div
                            className="matcher-match-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="match-content">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring' }}
                                >
                                    <Sparkles size={80} color="#FFD700" />
                                </motion.div>
                                <h1>It's a Match!</h1>
                                <img src={`https://image.tmdb.org/t/p/w500${newMatch.posterPath}`} alt="Match" className="match-poster-lg" />
                                <h2>{newMatch.title}</h2>
                                <button className="btn-continue" onClick={() => setNewMatch(null)}>Keep Swiping</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default MovieMatcher;
