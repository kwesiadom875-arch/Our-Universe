import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Monitor, Film } from 'lucide-react';
import '../styles/mediasearch.css'; // We'll create this or add to index.css

const MediaSearchModal = ({ isOpen, onClose, onAdd }) => {
    const { token } = useContext(AuthContext);
    const { addNotification } = useContext(NotificationContext);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [type, setType] = useState('movie'); // 'movie' or 'tv'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get(`${API_BASE_URL}/api/media/search?query=${query}&type=${type}`, config);
            setResults(res.data.results || []);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (item) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            const payload = {
                tmdbId: item.id,
                mediaType: type,
                title: item.title || item.name,
                posterPath: item.poster_path
            };
            await axios.post(`${API_BASE_URL}/api/media/add`, payload, config);
            if (onAdd) onAdd(item);
            onClose();
            addNotification('success', 'Added to Library', `${item.title || item.name} added to your watched list.`);
        } catch (err) {
            console.error("Add error:", err);
            addNotification('info', 'Already Exists', "Already in your watched list!");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="media-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="media-modal-backdrop" onClick={onClose} />
                <motion.div
                    className="media-search-modal"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="media-search-modal-title"
                >
                    <div className="modal-header">
                        <h2 id="media-search-modal-title">Add Watched Content</h2>
                        <button className="close-btn" onClick={onClose} aria-label="Close modal"><X size={24} /></button>
                    </div>

                    <div className="type-toggle">
                        <button
                            className={type === 'movie' ? 'active' : ''}
                            onClick={() => { setType('movie'); setResults([]); }}
                        >
                            <Film size={18} /> Movies
                        </button>
                        <button
                            className={type === 'tv' ? 'active' : ''}
                            onClick={() => { setType('tv'); setResults([]); }}
                        >
                            <Monitor size={18} /> TV Shows
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="search-bar">
                        <input
                            type="text"
                            placeholder={`Search for a ${type === 'movie' ? 'movie' : 'show'}...`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" disabled={loading} aria-label="Search">
                            {loading ? "..." : <Search size={20} />}
                        </button>
                    </form>

                    <div className="results-list">
                        {results.length === 0 && !loading && <p className="no-results">Start typing to search...</p>}
                        {results.map(item => (
                            <div key={item.id} className="search-result-item">
                                <img
                                    src={item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://via.placeholder.com/50x75'}
                                    alt={item.title}
                                    className="result-poster"
                                />
                                <div className="result-info">
                                    <h4>{item.title || item.name}</h4>
                                    <span>{item.release_date ? item.release_date.split('-')[0] : 'Unknown'}</span>
                                </div>
                                <button className="add-btn" onClick={() => handleAdd(item)} aria-label={`Add ${item.title || item.name}`}>
                                    <Plus size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MediaSearchModal;
