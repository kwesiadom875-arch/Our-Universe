import React, { useState, useEffect, useContext } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, Info, Sparkles, Film, Star, Command, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/moviematcher.css';
import axios from 'axios';
import AuthContext from '../context/AuthContext.jsx';
import API_BASE_URL from '../config/api.js';
import Layout from '../components/Layout.jsx';
import MediaSearchModal from '../components/MediaSearchModal';
import { Link } from 'react-router-dom';

const MovieMatcher = () => {
    const { token } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lastDirection, setLastDirection] = useState();
    const [matches, setMatches] = useState([]);
    const [newMatch, setNewMatch] = useState(null);
    const [mediaType, setMediaType] = useState('movie'); // 'movie' or 'tv'
    const [showSearch, setShowSearch] = useState(false);

    // Motion values for swipe animation
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-10, 10]); // Reduced rotation for cleaner feel

    useEffect(() => {
        fetchMovies(1, mediaType, true);
        fetchMatches();
    }, [token, mediaType]);

    const fetchMovies = async (page = 1, type = 'movie', reset = false) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            // Using discover endpoint for recommendations
            const endpoint = type === 'movie'
                ? `${API_BASE_URL}/api/movies/discover?page=${page}`
                : `${API_BASE_URL}/api/movies/discover-tv?page=${page}`; // Assuming API supports TV

            const res = await axios.get(endpoint, config);

            const results = res.data.results || [];

            if (reset) {
                setMovies(results);
                setCurrentIndex(0);
            } else {
                setMovies(prev => [...prev, ...results]);
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

        // Trigger exit animation by setting x way off screen before updating index
        // simple state update might be too fast for exit animation if logic isn't tied to it
        // For now, simpler queue logic:
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


    /* --- Styles for Light Split View --- */
    const cardVariants = {
        hidden: { scale: 0.95, opacity: 0, x: 20 },
        visible: { scale: 1, opacity: 1, x: 0 },
        exit: (custom) => ({
            x: custom < 0 ? -300 : 300,
            opacity: 0,
            rotate: custom < 0 ? -10 : 10,
            transition: { duration: 0.4, ease: "easeInOut" }
        })
    };

    if (!currentItem && movies.length > 0) return (
        <Layout>
            <div className="matcher-empty-state">
                <Film size={64} className="mb-6 text-black/20" />
                <h2>All Caught Up</h2>
                <p>Check back later for more recommendations.</p>
                <button onClick={() => window.location.reload()} className="refresh-btn">Refresh</button>
            </div>
        </Layout>
    );

    // Loading State
    if (movies.length === 0) return <Layout><div className="matcher-loading">Populating your queue...</div></Layout>;

    return (
        <Layout>
            <div className="movie-matcher-container">
                {/* Header */}
                <header className="matcher-header">
                    <div className="brand">
                        <div className="icon-bg"><Sparkles size={18} color="white" /></div>
                        <span>Our Universe</span>
                    </div>

                    <div className="header-controls">
                        <Link to="/medialibrary" className="library-pill">
                            <Grid size={16} /> Library
                        </Link>
                        <div className="toggle-pill">
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
                        <button className="notification-btn"><div className="dot"></div></button>
                    </div>
                </header>

                <div className="matcher-content">
                    {/* Main Card Stack - Split Design */}
                    <div className="card-stack-wrapper">
                        <AnimatePresence>
                            {/* Active Card */}
                            <motion.div
                                key={currentItem.id}
                                className="movie-card active-card"
                                style={{ x, rotate }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleDragEnd}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                custom={x.get()}
                                whileDrag={{ cursor: "grabbing" }}
                            >
                                {/* Left Side: Poster */}
                                <div className="card-poster-section">
                                    <div
                                        className="poster-image"
                                        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${currentItem.poster_path})` }}
                                    >
                                        <div className="badge-top-match">
                                            <Star size={12} fill="currentColor" /> TOP MATCH {currentItem.vote_average.toFixed(1)}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Info */}
                                <div className="card-info-section">
                                    <div className="info-header">
                                        <div className="chips">
                                            <span className="chip">{mediaType === 'movie' ? 'FILM' : 'TV'}</span>
                                            <span className="chip">{(currentItem.release_date || currentItem.first_air_date || '').split('-')[0]}</span>
                                        </div>
                                    </div>

                                    <div className="info-main">
                                        <h1>{currentItem.title || currentItem.name}</h1>

                                        <p className="description">{currentItem.overview}</p>

                                        <div className="genre-tags">
                                            <span className="tag-outline">ROMANCE</span>
                                            <span className="tag-outline">SCI-FI</span>
                                            <span className="tag-outline">ACTION</span>
                                        </div>

                                        <div className="social-proof">
                                            <div className="avatars">
                                                <div className="avatar user"></div>
                                                <div className="avatar partner"></div>
                                                <div className="avatar more">+12</div>
                                            </div>
                                            <span>friends watched this</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Side Actions Floating */}
                    <div className="floating-actions-right">
                        <button className="fab-btn prev" title="Previous"><ChevronLeft size={20} /></button>
                        <button className="fab-btn pass" onClick={() => swipe('left')}><X size={24} /></button>
                        <button className="fab-btn like" onClick={() => swipe('right')}><Heart size={28} fill="white" /></button>
                        <button className="fab-btn info" title="Info"><Info size={20} /></button>
                        <button className="fab-btn next" title="Next"><ChevronRight size={20} /></button>
                    </div>

                    {/* Bottom Action */}
                    <div className="bottom-action-pill">
                        <button className="seen-it-btn" onClick={() => setShowSearch(true)}>
                            <strong>Seen it?</strong> <span className="highlight">Add to Library</span>
                        </button>
                        <div className="swipe-hint">
                            SWIPE OR USE KEYS <div className="key">←</div> <div className="key">→</div>
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
                            className="match-overlay-fullscreen"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="overlay-content">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="match-icon-container"
                                >
                                    <Sparkles size={64} color="#FFD700" />
                                </motion.div>

                                <h2>It's a Match!</h2>
                                <p>You and Sarah both liked</p>

                                <div className="matched-poster">
                                    <img src={`https://image.tmdb.org/t/p/w500${newMatch.posterPath}`} alt={newMatch.title} />
                                </div>

                                <h3>{newMatch.title}</h3>

                                <div className="match-actions">
                                    <button className="primary-btn" onClick={() => setNewMatch(null)}>Keep Swiping</button>
                                    <Link to="/medialibrary" className="secondary-btn">Go to Library</Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default MovieMatcher;
