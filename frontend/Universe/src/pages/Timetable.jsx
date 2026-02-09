import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../styles/timetable.css';

const Timetable = () => {
    const { token } = useContext(AuthContext);
    const [classes, setClasses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal State
    const [activeTab, setActiveTab] = useState('Me'); // Me, Partner, Both
    const [selectedType, setSelectedType] = useState('Class'); // Class, Exam, Extracurricular

    const [classData, setClassData] = useState({
        subject: '',
        location: '',
        startTime: '',
        endTime: ''
    });

    const { subject, location, startTime, endTime } = classData;

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/timetable', config);
                setClasses(res.data);
            } catch (err) {
                console.error("Error fetching timetable:", err);
            }
        };

        if (token) fetchClasses();
    }, [token]);


    // Handle Inputs
    const onChange = e => setClassData({ ...classData, [e.target.name]: e.target.value });

    // Submit New Class
    const onSubmit = async () => {
        // Basic validation
        if (!classData.subject || !classData.startTime || !classData.endTime) {
            alert('Please fill in Subject and Times');
            return;
        }

        // Format times to HH:mm if they come from datetime-local (yyyy-MM-ddTHH:mm)
        // Or if using type="time", they are already HH:mm
        const formatTime = (t) => t.includes('T') ? t.split('T')[1].substring(0, 5) : t;

        const newClass = {
            subject: classData.subject,
            location: classData.location,
            startTime: formatTime(classData.startTime),
            endTime: formatTime(classData.endTime),
            day: 'Monday', // Defaulting to Monday for now to show on grid
            type: selectedType,
            attendees: activeTab
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };
            const res = await axios.post('http://localhost:5000/api/timetable', newClass, config);
            setClasses([...classes, res.data]);
            setIsModalOpen(false);

            // Reset Form (keep tab/type same for convenience)
            setClassData({ subject: '', location: '', startTime: '', endTime: '' });
        } catch (err) {
            console.error("Error adding class:", err);
            alert("Failed to add class");
        }
    };

    // Calculate position for an event (08:00 starts at 0px, each hour is 100px)
    const getEventStyle = (startTime, endTime) => {
        if (!startTime || !endTime) return {};

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        // Grid starts at 8 AM (8:00)
        const startOffset = (startH - 8) * 100 + (startM / 60) * 100;
        const duration = ((endH - startH) * 60 + (endM - startM));
        const height = (duration / 60) * 100;

        return {
            top: `${startOffset}px`,
            height: `${height}px`
        };
    };

    const getCardClass = (type) => {
        switch (type) {
            case 'Class': return 'card-blue';
            case 'Exam': return 'card-orange';
            case 'Date': return 'card-pink';
            default: return 'card-purple';
        }
    };

    return (
        <div className="timetable-container">
            {/* Header */}
            <div className="timetable-header">
                <div className="brand-section">
                    <div className="brand-logo">♾️ Our Universe</div>
                </div>

                <div className="date-navigator">
                    <button>‹</button>
                    <div className="current-date">
                        <span>TODAY</span>
                        <div>Tuesday, Oct 24</div>
                    </div>
                    <button>›</button>
                </div>

                <div className="actions">
                    <button className="sync-btn" onClick={() => window.location.reload()}>
                        ♥ Sync
                    </button>
                </div>
            </div>

            {/* Schedule View */}
            <div className="schedule-wrapper">

                {/* My Column */}
                <div className="schedule-column">
                    <div className="column-header">
                        <span className="column-title me">MY SCHEDULE</span>
                    </div>

                    <div className="timeline-slots">
                        {/* Time Markers */}
                        {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(hour => (
                            <div key={hour} className="time-marker">
                                <span className="time-label">{hour}:00</span>
                            </div>
                        ))}

                        {/* Events (Me + Both) */}
                        {classes.filter(c => c.attendees === 'Me' || c.attendees === 'Both').map(c => (
                            <div
                                key={c._id}
                                className={`event-card ${getCardClass(c.type)}`}
                                style={getEventStyle(c.startTime, c.endTime)}
                            >
                                <h3>{c.subject} {c.attendees === 'Both' && '♥'}</h3>
                                <p>{c.location}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Her Column */}
                <div className="schedule-column">
                    <div className="column-header">
                        <span className="column-title her">HER SCHEDULE</span>
                    </div>

                    <div className="timeline-slots">
                        {/* Time Markers */}
                        {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(hour => (
                            <div key={hour} className="time-marker"></div>
                        ))}

                        {/* Events (Partner + Both) */}
                        {classes.filter(c => c.attendees === 'Partner' || c.attendees === 'Both').map(c => (
                            <div
                                key={c._id + 'her'}
                                className={`event-card ${getCardClass(c.type)}`}
                                style={getEventStyle(c.startTime, c.endTime)}
                            >
                                <h3>{c.subject} {c.attendees === 'Both' && '♥'}</h3>
                                <p>{c.location}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shared Connection Line (Visual decoration for now) */}
                {classes.some(c => c.attendees === 'Both') && (
                    <div className="connection-line" style={{ top: '450px' }}></div>
                )}

            </div>

            {/* Add Button */}
            <div className="fab-add" onClick={() => setIsModalOpen(true)}>+</div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content light-theme">
                        <div className="modal-header">
                            <h2>Add New Adventure</h2>
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Mark a milestone in your universe ✨</span>
                        </div>

                        {/* Who Toggle */}
                        <div className="input-label">Whose schedule is this?</div>
                        <div className="toggle-group">
                            {['Me', 'Partner', 'Both'].map(option => (
                                <div
                                    key={option}
                                    className={`toggle-option ${activeTab === option ? 'active' : ''}`}
                                    onClick={() => setActiveTab(option)}
                                >
                                    {option === 'Me' && '👤'} {option === 'Partner' && '♡'} {option === 'Both' && '👥'} {option}
                                </div>
                            ))}
                        </div>

                        {/* Subject */}
                        <label className="input-label">Subject / Activity Name</label>
                        <input
                            type="text"
                            name="subject"
                            value={classData.subject}
                            onChange={onChange}
                            className="custom-input"
                            placeholder="e.g., Advanced Calculus, Date Night..."
                        />

                        {/* Type Pills */}
                        <label className="input-label">What kind of thing is it?</label>
                        <div className="type-pills">
                            {['Class', 'Exam', 'Extracurricular'].map(type => (
                                <div
                                    key={type}
                                    className={`pill-type ${selectedType === type ? 'active' : ''}`}
                                    onClick={() => setSelectedType(type)}
                                >
                                    {type === 'Class' && '🎓'} {type === 'Exam' && '📝'} {type === 'Extracurricular' && '⚽'} {type}
                                </div>
                            ))}
                        </div>

                        {/* Time Row */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label className="input-label">Start Time</label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={classData.startTime}
                                    onChange={onChange}
                                    className="custom-input"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="input-label">End Time</label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={classData.endTime}
                                    onChange={onChange}
                                    className="custom-input"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <label className="input-label">Where should we be?</label>
                        <input
                            type="text"
                            name="location"
                            value={classData.location}
                            onChange={onChange}
                            className="custom-input"
                            placeholder="📍 Add a location or room number"
                        />

                        <button className="btn-gradient" onClick={onSubmit}>
                            🎓 Add to Our Universe
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <span style={{ cursor: 'pointer', color: '#999' }} onClick={() => setIsModalOpen(false)}>Cancel</span>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Timetable;
