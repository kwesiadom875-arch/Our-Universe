import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import { ArrowLeft, Share2, Heart, Edit3, Droplet, Wind, Sun, Leaf, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/scents.css';

const ScentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [scent, setScent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showJournalForm, setShowJournalForm] = useState(false);
    const [newJournal, setNewJournal] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchScent = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get(`${API_BASE_URL}/api/scents`, config);
                const found = res.data.find(s => s._id === id);
                setScent(found);
            } catch (err) {
                console.error("Error fetching scent:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchScent();
    }, [id, token]);

    if (loading) return <Layout><div className="loading-screen">Loading Scent...</div></Layout>;
    if (!scent) return <Layout><div className="error-screen">Scent not found.</div></Layout>;

    const handleAddJournal = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post(`${API_BASE_URL}/api/scents/${scent._id}/journals`, { text: newJournal }, config);

            // Update local state with new journals list
            setScent({ ...scent, journals: res.data });
            setNewJournal('');
            setShowJournalForm(false);
        } catch (err) {
            console.error("Error adding journal:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const accordColors = {
        "Floral": "#FFB7B2",
        "Woody": "#E2B598",
        "Musky": "#CBAACB",
        "Amber": "#F59E0B",
        "Citrus": "#FDFD96",
        "Fresh": "#A0E7E5",
        "Spicy": "#FF6961"
    };

    const handleToggleWishlist = async () => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            // Toggle logic: if in wishlist, move to collection (or just remove from wishlist?)
            // Usually: Wishlist <-> Collection
            // If wishlist=true, set wishlist=false, myCollection=true
            // If wishlist=false, set wishlist=true, myCollection=false
            const updatedFields = {
                wishlist: !scent.wishlist,
                myCollection: scent.wishlist // If it WAS in wishlist, now it's in collection
            };

            const res = await axios.put(`${API_BASE_URL}/api/scents/${id}`, updatedFields, config);
            setScent(res.data);
        } catch (err) {
            console.error("Error toggling wishlist:", err);
        }
    };

    const handleDeleteScent = async () => {
        if (window.confirm("Are you sure you want to remove this scent from your collection?")) {
            try {
                const config = { headers: { 'x-auth-token': token } };
                await axios.delete(`${API_BASE_URL}/api/scents/${id}`, config);
                navigate('/scents');
            } catch (err) {
                console.error("Error deleting scent:", err);
            }
        }
    };

    return (
        <Layout>
            <div className="scent-details-page">
                <div className="details-header-nav">
                    <button onClick={() => navigate('/scents')} className="back-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="nav-actions">
                        <button className="icon-btn" onClick={handleDeleteScent} title="Delete Scent">
                            <Trash2 size={20} color="#EF4444" />
                        </button>
                        <button className="icon-btn"><Share2 size={20} /></button>
                        <button className="icon-btn" onClick={handleToggleWishlist}>
                            <Heart size={20} fill={scent.wishlist ? "#F59E0B" : "none"} color="#F59E0B" />
                        </button>
                    </div>
                </div>

                <div className="details-content-wrapper">
                    {/* Left: Image Card */}
                    <div className="details-image-section">
                        <div className="hero-image-card">
                            <img
                                src={scent.image && scent.image.length > 10 ? scent.image : 'https://images.unsplash.com/photo-1616949755610-8c977f9f3b1e?auto=format&fit=crop&q=80&w=800'}
                                alt={scent.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1616949755610-8c977f9f3b1e?auto=format&fit=crop&q=80&w=800';
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="details-info-section">
                        <span className="scent-brand-lg">{scent.brand}</span>
                        <h1 className="scent-title-lg">{scent.name}</h1>
                        <p className="scent-description">{scent.description || "No description available yet."}</p>

                        {/* Stats Grid */}
                        <div className="scent-stats-grid">
                            <div className="stat-box">
                                <span className="stat-label">LONGEVITY</span>
                                <span className="stat-val">{scent.longevity || "Moderate"}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">SILLAGE</span>
                                <span className="stat-val">{scent.sillage || "Moderate"}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">SEASON</span>
                                <span className="stat-val">
                                    {scent.season === 'Summer' && <Sun size={16} />}
                                    {scent.season === 'Spring' && <Leaf size={16} />}
                                    {scent.season || "All"}
                                </span>
                            </div>
                        </div>

                        {/* Main Accords */}
                        <div className="accords-section">
                            <h3>Main Accords</h3>
                            <div className="accords-list">
                                {scent.accords && Object.entries(scent.accords).map(([name, value]) => (
                                    <div key={name} className="accord-row">
                                        <span className="accord-name">{name}</span>
                                        <div className="progress-container">
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${value}%`,
                                                    backgroundColor: accordColors[name] || '#E0E0E0'
                                                }}
                                            />
                                        </div>
                                        <span className="accord-pct">{value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scent Pyramid */}
                        <div className="pyramid-section">
                            <h3>Scent Pyramid</h3>
                            <div className="pyramid-visual">
                                {/* Top Nodes */}
                                <div className="pyramid-level">
                                    <div className="level-icon"><Leaf size={16} color="#F59E0B" /></div>
                                    <div className="level-notes">
                                        <span className="level-title">TOP NOTES</span>
                                        <p>{scent.pyramid?.top?.join(', ') || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="pyramid-connector" />
                                {/* Middle Nodes */}
                                <div className="pyramid-level">
                                    <div className="level-icon"><Droplet size={16} color="#F59E0B" /></div>
                                    <div className="level-notes">
                                        <span className="level-title">HEART NOTES</span>
                                        <p>{scent.pyramid?.middle?.join(', ') || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="pyramid-connector" />
                                {/* Top Nodes */}
                                <div className="pyramid-level">
                                    <div className="level-icon"><Wind size={16} color="#F59E0B" /></div>
                                    <div className="level-notes">
                                        <span className="level-title">BASE NOTES</span>
                                        <p>{scent.pyramid?.base?.join(', ') || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Journals Section */}
                <div className="journals-section">
                    <div className="journals-header-row">
                        <h3 className="section-title">Journals</h3>
                        <button className="add-journal-btn" onClick={() => setShowJournalForm(!showJournalForm)}>
                            <Edit3 size={16} /> Write Entry
                        </button>
                    </div>

                    {showJournalForm && (
                        <motion.form
                            className="journal-form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            onSubmit={handleAddJournal}
                        >
                            <textarea
                                value={newJournal}
                                onChange={(e) => setNewJournal(e.target.value)}
                                placeholder="Share your experience with this scent..."
                                required
                            />
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Posting...' : 'Post Journal'}
                            </button>
                        </motion.form>
                    )}

                    <div className="journals-grid">
                        {scent.journals && scent.journals.length > 0 ? (
                            scent.journals.map((journal, idx) => (
                                <div key={idx} className="journal-card">
                                    <div className="journal-header">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${journal.user}`} alt={journal.user} />
                                        <div>
                                            <h4>{journal.user}'s Journal</h4>
                                            <span>THEIR PERSPECTIVE</span>
                                        </div>
                                    </div>
                                    <p className="journal-text font-handwriting">
                                        "{journal.text}"
                                    </p>
                                    <span className="journal-date">
                                        Added {new Date(journal.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no-journals">No journal entries yet. Be the first to add one!</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ScentDetails;
