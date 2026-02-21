import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, User, Users, Sparkles, Plus } from 'lucide-react';
import MediaSearchModal from '../components/MediaSearchModal';
import '../styles/medialibrary.css';

const MediaLibrary = () => {
    const { token } = useContext(AuthContext);
    const [watched, setWatched] = useState([]);
    const [matches, setMatches] = useState([]);
    const [view, setView] = useState('all'); // 'all' | 'liked_me' | 'liked_partner' | 'matches'
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchModal, setShowSearchModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const config = { headers: { 'x-auth-token': token } };

                // Fetch Watched
                const resWatched = await axios.get(`${API_BASE_URL}/api/media/watched`, config);
                setWatched(resWatched.data);

                // Fetch Matches
                const resMatches = await axios.get(`${API_BASE_URL}/api/movies/matches`, config);
                // Normalize matches
                const normalizedMatches = resMatches.data.map(m => ({
                    ...m,
                    mediaType: 'movie',
                    isMatch: true
                }));
                setMatches(normalizedMatches);

            } catch (err) {
                console.error("Error loading library:", err);
            }
        };
        fetchData();
    }, [token]);

    // Combine Data for "All" view
    // In a real app, we'd merge duplicates or handle same item in different lists
    // For now, let's just combine for display
    const allItems = [...watched, ...matches];

    const getFilteredList = () => {
        let list = [];
        switch (view) {
            case 'all':
                list = allItems;
                break;
            case 'liked_me':
                list = watched;
                break;
            case 'liked_partner':
                list = []; // Placeholder for now
                break;
            case 'matches':
                list = matches;
                break;
            default:
                list = allItems;
        }

        if (searchQuery) {
            return list.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return list;
    };

    const filteredList = getFilteredList();

    // Stats for placeholder
    const matchCount = matches.length;

    return (
        <Layout>
            <div className="media-library-page">
                {/* Header & Search */}
                <header className="lib-header-area">
                    <div className="search-container">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search our collection..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search collection"
                        />
                    </div>

                    <div className="header-title">
                        <h1>Movie Library</h1>
                    </div>
                </header>

                {/* Filter Tabs */}
                <div className="lib-tabs-container">
                    <div className="lib-tabs">
                        <button
                            className={view === 'all' ? 'active' : ''}
                            onClick={() => setView('all')}
                        >
                            All Movies
                        </button>
                        <button
                            className={view === 'liked_me' ? 'active' : ''}
                            onClick={() => setView('liked_me')}
                        >
                            Liked by Me
                        </button>
                        <button
                            className={view === 'liked_partner' ? 'active' : ''}
                            onClick={() => setView('liked_partner')}
                        >
                            Liked by Partner
                        </button>
                        <button
                            className={view === 'matches' ? 'active' : ''}
                            onClick={() => setView('matches')}
                        >
                            <Heart size={14} fill={view === 'matches' ? "#D4A373" : "none"} /> Matches
                        </button>
                    </div>
                </div>

                {/* content grid */}
                <motion.div className="lib-grid" layout>
                    {filteredList.length === 0 ? (
                        <div className="lib-empty">
                            <p>No titles found in this section.</p>
                            <button className="text-btn" onClick={() => setShowSearchModal(true)}>Add your first movie</button>
                        </div>
                    ) : (
                        filteredList.map((item, idx) => (
                            <motion.div
                                key={item._id || item.tmdbId + idx}
                                className="lib-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                layout
                            >
                                <div className="poster-frame">
                                    {(item.posterPath || item.poster_path) && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w342${item.posterPath || item.poster_path}`}
                                            alt={item.title}
                                            className="poster-img"
                                            loading={idx < 4 ? "eager" : "lazy"}
                                            decoding="async"
                                        />
                                    )}
                                    {/* Optional Overlay/Hover effects could go here */}
                                </div>
                                <div className="card-meta">
                                    <h3>{item.title}</h3>
                                    <div className="status-line">
                                        {item.isMatch ? (
                                            <span className="status-match">MATCHED</span>
                                        ) : (
                                            <span className="status-liked">SARAH LIKED</span>
                                            /* Hardcoded name for 'Liked by Me' context simulating user view */
                                        )}
                                        {item.vote_average && (
                                            <span className="status-score">98% MATCH</span>
                                            /* Placeholder score logic */
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>

                {/* Floating Action Bar */}
                <div className="floating-action-bar-container">
                    <div className="floating-bar">
                        {view === 'matches' && matchCount > 0 && (
                            <div className="bar-info">
                                <span className="heart-icon-circle"><Heart size={14} fill="white" /></span>
                                <span>{matchCount} Matches Found</span>
                            </div>
                        )}

                        <button className="pick-movie-btn" onClick={() => setShowSearchModal(true)}>
                            <Sparkles size={18} /> Let's Pick a Movie Night
                        </button>

                        <div className="bar-actions">
                            {/* Placeholder icons for other actions */}
                            <button className="icon-btn" aria-label="Add new movie"><Plus size={20} /></button>
                        </div>
                    </div>
                </div>

                <MediaSearchModal
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                    onAdd={() => window.location.reload()} // Simple reload to refresh data for now
                />
            </div>
        </Layout>
    );
};

export default MediaLibrary;
