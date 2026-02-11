import { useState, useContext, useEffect } from 'react';
import { User, Mail, Heart, Calendar, Lock, Camera, Save, Copy, RefreshCw, Smartphone, MapPin, Globe, Gem, Home, Baby, Plane } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/profile.css';

const Profile = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const { addNotification } = useContext(NotificationContext);

    // Local state for form fields
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        theme: 'pink',
    });

    const [milestones, setMilestones] = useState([]);
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [newMilestone, setNewMilestone] = useState({ title: '', date: '', icon: 'Heart' });

    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch Milestones
    const fetchMilestones = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/milestones`);
            setMilestones(res.data);
        } catch (error) {
            console.error('Error fetching milestones:', error);
        }
    };

    useEffect(() => {
        fetchMilestones();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                // These might need to be added to the backend model if not present
                bio: 'A dreamer, an artist, and a seeker of celestial beauty. Building our shared universe one star at a time.',
                // theme: user.theme || 'pink'
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await updateProfile({
            username: formData.username,
            // Only send fields that are actually editable/supported by backend for now
            // bio is not yet in backend model, so we won't send it to API, but in a real app we would.
            // For now we assume bio is local-only or waiting for backend update.
            // We can update username and theme.
            theme: formData.theme
        });

        if (result.success) {
            setLoading(false);
            setIsEditing(false);
            addNotification('success', 'Profile updated successfully!', 'Your changes have been saved to the stars.');
        } else {
            setLoading(false);
            addNotification('error', 'Update Failed', result.error || 'Could not save your profile changes.');
        }
    };

    const handleAddMilestone = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/milestones`, newMilestone);
            addNotification('success', 'Milestone Added', 'A new memory has been set in stone.');
            setShowMilestoneModal(false);
            setNewMilestone({ title: '', date: '', icon: 'Heart' });
            fetchMilestones();
        } catch (error) {
            addNotification('error', 'Error', 'Could not add milestone.');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        addNotification('info', 'Copied!', 'Text copied to clipboard.');
    };

    if (!user) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="profile-container">
            <div className="background-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="profile-header">
                <div className="profile-avatar-wrapper">
                    <img
                        src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt="Profile"
                        className="profile-avatar"
                    />
                    <button className="avatar-edit-btn" aria-label="Change Profile Picture">
                        <Camera size={18} />
                    </button>
                </div>
                <h1 className="profile-name">{user.username}</h1>
                <p className="profile-since">Charting the stars since {new Date(user.dateJoined).getFullYear()}</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-content">
                {/* Personal Information */}
                <div className="profile-card">
                    <h3 className="section-title"><User size={20} /> Personal Info</h3>

                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled={true}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Personal Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="form-input"
                            rows="4"
                            style={{ resize: 'none' }}
                        />
                    </div>

                    {!isEditing ? (
                        <button type="button" className="save-btn" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    ) : (
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? <RefreshCw className="spin" size={20} /> : <Save size={20} />}
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    )}
                </div>

                {/* Connection Status */}
                <div className="profile-card">
                    <h3 className="section-title"><Heart size={20} /> Shared Universe</h3>

                    {user.partnerId ? (
                        <div className="connection-active">
                            <div className="form-group">
                                <label>Connection Status</label>
                                <div className="info-display" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981', background: '#ECFDF5', borderColor: '#A7F3D0' }}>
                                    <Heart size={16} fill="#10B981" />
                                    <span>Universes Aligned with {user.partnerName || 'Partner'}</span>
                                </div>
                            </div>

                            <div className="milestone-grid">
                                <div className="milestone-badge">
                                    <Calendar size={16} />
                                    <span>Sync Timeline</span>
                                </div>
                                <div className="milestone-badge">
                                    <MapPin size={16} />
                                    <span>Share Loc</span>
                                </div>
                                <div className="milestone-badge">
                                    <Smartphone size={16} />
                                    <span>Device Paired</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="connection-pending">
                            <p className="text-sm text-gray-500 mb-4">You are not currently linked with another user.</p>

                            <div className="form-group">
                                <label>Your Secret Invite Code</label>
                                <div className="invite-code-display">
                                    <span className="code-text">{user.inviteCode || 'LOADING...'}</span>
                                    <button type="button" className="copy-btn" onClick={() => copyToClipboard(user.inviteCode)}>
                                        <Copy size={18} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-center">Share this code with your favorite person to merge universes.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* App Settings */}
                <div className="profile-card">
                    <h3 className="section-title"><Globe size={20} /> App Settings</h3>

                    <div className="form-group">
                        <label>Privacy Level</label>
                        <div className="info-display">
                            <Lock size={14} style={{ marginRight: '8px' }} />
                            <span>Only visible to partner</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Language</label>
                        <select className="form-input" disabled>
                            <option>English (US)</option>
                        </select>
                    </div>

                    {/* Placeholder for future theme settings */}
                    <div className="form-group">
                        <label>Theme Preference</label>
                        <div className="theme-options">
                            <div className="color-option selected" style={{ background: '#FF3366' }} title="Default Pink"></div>
                            <div className="color-option" style={{ background: '#8B5CF6' }} title="Stardust Purple"></div>
                            <div className="color-option" style={{ background: '#0EA5E9' }} title="Ocean Blue"></div>
                            <div className="color-option" style={{ background: '#F59E0B' }} title="Golden Sun"></div>
                        </div>
                    </div>
                </div>

                {/* Relationship Milestones */}
                <div className="profile-card" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="section-title" style={{ marginBottom: 0 }}><Calendar size={20} /> Relationship Milestones</h3>
                        <button type="button" className="add-milestone-btn" onClick={() => setShowMilestoneModal(true)}>
                            Add New
                        </button>
                    </div>

                    <div className="milestones-container">
                        {milestones.length > 0 ? (
                            milestones.map((milestone) => (
                                <div key={milestone._id} className="milestone-item">
                                    <div className="milestone-icon">
                                        {milestone.icon === 'Heart' && <Heart size={24} fill="#FF3366" color="#FF3366" />}
                                        {milestone.icon === 'Ring' && <Gem size={24} color="#A855F7" />}
                                        {milestone.icon === 'House' && <Home size={24} color="#10B981" />}
                                        {milestone.icon === 'Baby' && <Baby size={24} color="#F59E0B" />}
                                        {milestone.icon === 'Plane' && <Plane size={24} color="#3B82F6" />}
                                        {!['Heart', 'Ring', 'House', 'Baby', 'Plane'].includes(milestone.icon) && <Heart size={24} />}
                                    </div>
                                    <div className="milestone-date">{new Date(milestone.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                    <div className="milestone-title">{milestone.title}</div>
                                </div>
                            ))
                        ) : (
                            <p className="no-milestones">No milestones yet. Add your first memory!</p>
                        )}
                    </div>
                </div>
            </form>

            {/* Add Milestone Modal */}
            {showMilestoneModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New Milestone</h3>
                        <form onSubmit={handleAddMilestone}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newMilestone.title}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                    required
                                    placeholder="e.g. First Kiss"
                                />
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={newMilestone.date}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Icon</label>
                                <div className="icon-selection">
                                    {['Heart', 'Ring', 'House', 'Baby', 'Plane'].map((icon) => (
                                        <div
                                            key={icon}
                                            className={`icon-option ${newMilestone.icon === icon ? 'selected' : ''}`}
                                            onClick={() => setNewMilestone({ ...newMilestone, icon })}
                                        >
                                            {icon === 'Heart' && <Heart size={20} />}
                                            {icon === 'Ring' && <Gem size={20} />}
                                            {icon === 'House' && <Home size={20} />}
                                            {icon === 'Baby' && <Baby size={20} />}
                                            {icon === 'Plane' && <Plane size={20} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowMilestoneModal(false)}>Cancel</button>
                                <button type="submit" className="save-btn" style={{ marginTop: 0 }}>Add Milestone</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
