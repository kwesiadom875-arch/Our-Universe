import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import AddScentModal from '../components/AddScentModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Heart, Sparkles, Wind, Droplets, Leaf } from 'lucide-react';
import '../styles/scents.css';

const Scents = () => {
    const { token, user } = useContext(AuthContext);
    const [scents, setScents] = useState([]);
    const [view, setView] = useState('my_collection'); // 'my_collection', 'partner_collection', 'wishlist'
    const [showAddModal, setShowAddModal] = useState(false);

    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1616949755610-8c977f9f3b1e?auto=format&fit=crop&q=80&w=800'; // Elegant perfume bottle fallback

    // Stats placeholder - Ensure scents is an array
    const safeScents = Array.isArray(scents) ? scents : [];

    // Filter for MY scents only
    const myScents = safeScents.filter(s => s.user === user?._id && s.myCollection);
    const totalScents = myScents.length;

    const mostUsedAccord = "Woody"; // Placeholder calculation
    const nextWishlist = safeScents.find(s => s.wishlist)?.name || "Desert Rose";

    useEffect(() => {
        fetchScents();
    }, [token]);

    const fetchScents = async () => {
        if (!token) return;
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get(`${API_BASE_URL}/api/scents`, config);
            if (Array.isArray(res.data)) {
                setScents(res.data);
            } else {
                console.error("API returned non-array data:", res.data);
                setScents([]); // Default to empty array on error
            }
        } catch (err) {
            console.error("Error fetching scents:", err);
            setScents([]); // Ensure it's empty on catch
        }
    };

    const handleAddScent = async (e) => {
        e.preventDefault();
        // Implement add logic here...
        setShowAddModal(false);
    };

    const filteredScents = safeScents.filter(s => {
        if (view === 'my_collection') {
            return s.user === user?._id && s.myCollection;
        }
        if (view === 'partner_collection') {
            // Check if it belongs to partner (not me)
            // If they are linked, we assume anything not mine is theirs in this filtered view (fetched from API)
            // But strictly: s.user !== user._id
            return s.user !== user?._id && s.myCollection;
        }
        if (view === 'wishlist') return s.wishlist;
        return false;
    });

    const getNoteIcon = (type) => {
        switch (type) {
            case 'Citrus': return <Droplets size={12} />;
            case 'Woody': return <Leaf size={12} />;
            default: return <Wind size={12} />;
        }
    };

    const partnerName = user?.partnerDetails?.username ? `${user.partnerDetails.username}'s` : "Partner's";

    return (
        <Layout>
            <div className="scents-page">
                {/* Header */}
                <header className="scents-header">
                    <div className="brand-logo">
                        <Sparkles size={24} color="#F59E0B" />
                        <span>Our Universe</span>
                    </div>
                    <button className="scent-of-day-btn">
                        <Wind size={16} /> Scent of the Day
                    </button>
                </header>

                <div className="scents-content">
                    <div className="title-area">
                        <h1>Aromatic <span>Grid</span></h1>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="scent-tabs">
                        <button
                            className={view === 'my_collection' ? 'active' : ''}
                            onClick={() => setView('my_collection')}
                        >
                            My Collection
                        </button>
                        <button
                            className={view === 'partner_collection' ? 'active' : ''}
                            onClick={() => setView('partner_collection')}
                        >
                            {partnerName} Collection
                        </button>
                        <button
                            className={view === 'wishlist' ? 'active' : ''}
                            onClick={() => setView('wishlist')}
                        >
                            Our Wishlist
                        </button>
                    </div>

                    {/* Grid */}
                    <motion.div className="scents-grid" layout>
                        {filteredScents.map((scent, idx) => (
                            <motion.div
                                key={scent._id}
                                className="scent-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => window.location.href = `/scents/${scent._id}`} // Simple navigation
                            >

                                <div className="scent-image-container">
                                    <img
                                        src={scent.image && scent.image.length > 10 ? scent.image : FALLBACK_IMAGE}
                                        alt={scent.name}
                                        className="scent-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = FALLBACK_IMAGE;
                                        }}
                                    />
                                </div>
                                <div className="scent-info">
                                    <span className="scent-brand">{scent.brand}</span>
                                    <h3>{scent.name}</h3>
                                    <div className="scent-notes">
                                        {scent.notes && scent.notes.map((note, i) => (
                                            <span key={i} className="note-pill">{note}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add Card */}
                        <motion.div
                            className="add-card"
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setShowAddModal(true)}
                        >
                            <div className="add-icon">
                                <Plus size={32} />
                            </div>
                            <span>Add to Collection</span>
                        </motion.div>
                    </motion.div>

                    {/* Floating Stats Bar */}
                    <div className="stats-bar-container">
                        <div className="stats-bar">
                            <div className="stat-item">
                                <span className="stat-label">TOTAL SCENTS</span>
                                <span className="stat-value">{totalScents}</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-label">MOST USED ACCORD</span>
                                <span className="stat-value">{mostUsedAccord}</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-label">NEXT WISHLIST ITEM</span>
                                <span className="stat-value highlight">✨ {nextWishlist}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <AddScentModal
                            isOpen={showAddModal}
                            onClose={() => setShowAddModal(false)}
                            onAdd={(newScent) => {
                                setScents([newScent, ...scents]);
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default Scents;
