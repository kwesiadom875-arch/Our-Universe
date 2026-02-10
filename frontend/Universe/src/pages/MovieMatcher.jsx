import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Film, Popcorn, Star, X, Heart, Sparkles } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import '../styles/moviematcher.css';

const MovieMatcher = () => {
    const { token } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [matches, setMatches] = useState([]);
    const [newMatch, setNewMatch] = useState(null);

    // We only need the very first movie to be draggable
    // When swiped, we remove it from the array
    const [currentIndex, setCurrentIndex] = useState(0);

    // Motion Values for the top card
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]); // Rotate based on drag
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]); // Fade out at edges

    // Overlays opacity
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

    // Card Background Color shift (Subtle)
    const cardColor = useTransform(x, [-200, 0, 200], ["#440000", "#1F1B24", "#004400"]);

    // Fetch Logic (Same as before)
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get(`${API_BASE_URL}/api/movies/popular`, config);
                setMovies(res.data.results);
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
        if (token) {
            fetchMovies();
            fetchMatches();
        }
    }, [token]);

    const handleDragEnd = async (event, info) => {
        const threshold = 100; // Drag distance to trigger swipe

        if (info.offset.x > threshold) {
            await swipe('right');
        } else if (info.offset.x < -threshold) {
            await swipe('left');
        }
    };

    const swipe = async (direction) => {
        const movie = movies[currentIndex];
        const action = direction === 'right' ? 'like' : 'pass';

        // Prepare next card
        setCurrentIndex(prev => prev + 1);
        x.set(0); // Reset position for next card (though we are rendering a new one, React key handles this)

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };
            const payload = {
                tmdbId: movie.id,
                title: movie.title,
                posterPath: movie.poster_path,
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

    // Helper for buttons to trigger swipe animation
    const manualSwipe = async (dir) => {
        // We can't easily animate the drag via button without more complex state
        // For now, we just trigger the logic and let the key change handle the "exit"
        await swipe(dir);
    };

    if (movies.length === 0) return <Layout><div className="movie-matcher-container">Loading Movies...</div></Layout>;

    // We show the current card and the one behind it
    const currentMovie = movies[currentIndex];
    const nextMovie = movies[currentIndex + 1];

    if (!currentMovie) return (
        <Layout>
            <div className="movie-matcher-container">
                <div className="matcher-header"><h1>No more movies! <Film size={32} /></h1></div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="movie-matcher-container">

                <div className="matcher-header">
                    <h1>Movie Matcher <Popcorn className="inline-icon" size={32} color="#F59E0B" /></h1>
                    <p style={{ opacity: 0.6, marginTop: '0.5rem' }}>Find your next watch together</p>
                </div>

                <div className="card-stack">
                    <AnimatePresence>
                        {/* The Card Behind (Static) */}
                        {nextMovie && (
                            <div
                                className="movie-card"
                                style={{
                                    backgroundImage: `url(https://image.tmdb.org/t/p/w500${nextMovie.poster_path})`,
                                    transform: 'scale(0.95) translateY(10px)', // Slightly smaller and lower
                                    zIndex: 0,
                                    opacity: 0.6
                                }}
                            >
                                {/* Overlay for next card */}
                                <div className="card-overlay">
                                    <h2 className="movie-title">{nextMovie.title}</h2>
                                </div>
                            </div>
                        )}

                        {/* The Active Card (Draggable) */}
                        <motion.div
                            key={currentMovie.id} // Key change triggers mount/unmount animations
                            className="movie-card"
                            style={{
                                backgroundImage: `url(https://image.tmdb.org/t/p/w500${currentMovie.poster_path})`,
                                x,
                                rotate,
                                zIndex: 1,
                                cursor: 'grab'
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }} // Snaps back if released early
                            dragElastic={0.7}
                            onDragEnd={handleDragEnd}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.2 } }}
                            whileTap={{ cursor: 'grabbing' }}
                        >
                            {/* LIKE Stamp overlay */}
                            <motion.div className="stamp like-stamp" style={{ opacity: likeOpacity }}>
                                LIKE
                            </motion.div>

                            {/* NOPE Stamp overlay */}
                            <motion.div className="stamp nope-stamp" style={{ opacity: nopeOpacity }}>
                                NOPE
                            </motion.div>

                            <div className="card-overlay">
                                <h2 className="movie-title">{currentMovie.title}</h2>
                                <div className="movie-meta">
                                    <span>{currentMovie.release_date?.split('-')[0]}</span>
                                    <span className="rating-badge"><Star size={16} fill="#F59E0B" color="#F59E0B" /> {currentMovie.vote_average.toFixed(1)}</span>
                                </div>
                                <p className="movie-desc">
                                    {currentMovie.overview}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence >
                </div >

                <div className="controls">
                    <button className="control-btn btn-pass" onClick={() => manualSwipe('left')}><X size={32} /></button>
                    <button className="control-btn btn-like" onClick={() => manualSwipe('right')}><Heart size={32} fill="white" /></button>
                </div>

                {/* Matches List */}
                {
                    matches.length > 0 && (
                        <div className="matches-preview">
                            <h3>Matches ({matches.length})</h3>
                            <div className="matches-row" style={{ marginTop: '1rem' }}>
                                {matches.map(m => (
                                    <div
                                        key={m.tmdbId}
                                        className="mini-match-card"
                                        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w200${m.posterPath})` }}
                                        title={m.title}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Match Overlay */}
                <AnimatePresence>
                    {newMatch && (
                        <motion.div
                            className="match-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="match-content">
                                <motion.div
                                    className="match-icon-anim"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1 }}
                                >
                                    <Sparkles size={64} color="#ffd700" />
                                </motion.div>
                                <motion.h1
                                    className="match-title"
                                    initial={{ scale: 0.5, y: -50 }}
                                    animate={{ scale: 1.2, y: 0 }}
                                    transition={{ type: 'spring' }}
                                >
                                    It's a Match!
                                </motion.h1>
                                <motion.img
                                    src={`https://image.tmdb.org/t/p/w500${newMatch.posterPath}`}
                                    alt={newMatch.title}
                                    className="match-poster"
                                    initial={{ rotate: -10, scale: 0.5 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                />
                                <h2>{newMatch.title}</h2>

                                <button className="btn-keep-swiping" onClick={() => setNewMatch(null)}>
                                    Keep Swiping
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </Layout >
    );
};

export default MovieMatcher;
