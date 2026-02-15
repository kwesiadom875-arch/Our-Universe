import { useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';
import { X, Link as LinkIcon, Edit3, Wand2, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const AddScentModal = ({ isOpen, onClose, onAdd }) => {
    const { token } = useContext(AuthContext);
    const { addNotification } = useContext(NotificationContext);
    const [activeTab, setActiveTab] = useState('magic'); // 'magic' or 'manual'
    const [magicUrl, setMagicUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchedData, setFetchedData] = useState(null);

    // Manual Form State
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        notes: '', // comma separated for input
        season: 'All',
        image: ''
    });

    if (!isOpen) return null;

    const handleMagicFetch = async () => {
        if (!magicUrl) return;
        setLoading(true);
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post(`${API_BASE_URL}/api/scents/scrape`, { url: magicUrl }, config);
            setFetchedData(res.data);

            // Pre-fill form data just in case user switches to manual to edit
            setFormData({
                name: res.data.name,
                brand: res.data.brand,
                notes: '', // Complex data, maybe leave empty or parse
                season: res.data.season || 'All',
                image: res.data.image
            });
        } catch (err) {
            console.error("Magic fetch failed:", err);
            addNotification('error', 'Magic Fetch Failed', 'Could not fetch scent details. Please try manual entry.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const config = { headers: { 'x-auth-token': token } };

            let payload = {};

            if (activeTab === 'magic' && fetchedData) {
                payload = { ...fetchedData };
            } else {
                payload = {
                    ...formData,
                    notes: formData.notes.split(',').map(n => n.trim()),
                    myCollection: true // Default
                };
            }

            const res = await axios.post(`${API_BASE_URL}/api/scents`, payload, config);
            onAdd(res.data);
            onClose();
            addNotification('success', 'Scent Added', `${payload.name} has been added to your collection.`);
        } catch (err) {
            console.error("Error adding scent:", err);
            addNotification('error', 'Error', 'Failed to add scent. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="media-modal-overlay">
            <div className="media-modal-backdrop" onClick={onClose} />
            <motion.div
                className="add-scent-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
                <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                    <X size={24} />
                </button>

                <div className="modal-header-center">
                    <div className="magic-wand-icon">
                        <Wand2 size={24} color="#F59E0B" />
                    </div>
                    <h2>Add Scent <span>Magic</span></h2>
                    <p>Grow your shared aromatic library</p>
                </div>

                <div className="modal-tabs" role="tablist">
                    <button
                        className={activeTab === 'magic' ? 'active' : ''}
                        onClick={() => setActiveTab('magic')}
                        role="tab"
                        aria-selected={activeTab === 'magic'}
                        aria-controls="panel-magic"
                        id="tab-magic"
                    >
                        <LinkIcon size={16} /> Quick Add (Link)
                    </button>
                    <button
                        className={activeTab === 'manual' ? 'active' : ''}
                        onClick={() => setActiveTab('manual')}
                        role="tab"
                        aria-selected={activeTab === 'manual'}
                        aria-controls="panel-manual"
                        id="tab-manual"
                    >
                        <Edit3 size={16} /> Manual Add
                    </button>
                </div>

                <div className="modal-body">
                    {activeTab === 'magic' ? (
                        <div className="magic-tab-content" role="tabpanel" id="panel-magic" aria-labelledby="tab-magic">
                            <label htmlFor="magic-url">FRAGRANTICA URL</label>
                            <div className="magic-input-group">
                                <input
                                    id="magic-url"
                                    type="text"
                                    placeholder="https://www.fragrantica.com/perfume/..."
                                    value={magicUrl}
                                    onChange={(e) => setMagicUrl(e.target.value)}
                                />
                                <button
                                    className="magic-fetch-btn"
                                    onClick={handleMagicFetch}
                                    disabled={loading}
                                    aria-label="Fetch scent details from link"
                                >
                                    {loading ? <Loader2 className="spin" size={18} /> : (
                                        <>Magic Fetch <span className="flask-icon">⚗️</span></>
                                    )}
                                </button>
                            </div>

                            {fetchedData && (
                                <motion.div
                                    className="fetched-preview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <img src={fetchedData.image} alt={`Fetched image of ${fetchedData.name}`} />
                                    <div className="preview-info">
                                        <h4>{fetchedData.name}</h4>
                                        <span>{fetchedData.brand}</span>
                                        <div className="fetched-stats">
                                            <span>{fetchedData.longevity} Longevity</span> •
                                            <span>{fetchedData.season}</span>
                                        </div>
                                    </div>
                                    <button className="confirm-add-btn" onClick={handleSubmit}>
                                        Confirm & Add
                                    </button>
                                </motion.div>
                            )}

                            {!fetchedData && (
                                <div className="magic-hint">
                                    <div className="hint-icon"><Info size={16} /></div>
                                    <p><b>Hint:</b> Fetching from a link will automatically pull notes, accords, and the high-res bottle image!</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div role="tabpanel" id="panel-manual" aria-labelledby="tab-manual">
                            <form className="manual-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="scent-name">Name</label>
                                    <input
                                        id="scent-name"
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="scent-brand">Brand</label>
                                    <input
                                        id="scent-brand"
                                        type="text"
                                        value={formData.brand}
                                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="scent-image">Image URL</label>
                                    <input
                                        id="scent-image"
                                        type="text"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="manual-submit-btn" disabled={loading}>
                                    {loading ? 'Adding...' : 'Add to Collection'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="modal-footer-feature">
                    ✨ GOLD EDITION FEATURE
                </div>
            </motion.div>
        </div>
    );
};

export default AddScentModal;
