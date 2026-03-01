import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { ChevronLeft, ChevronRight, Heart, HeartHandshake, User, Users, GraduationCap, FileText, Trophy, MapPin, Sparkles, BookOpen, Plus, Clock } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import NotificationContext from '../context/NotificationContext';
import Layout from '../components/Layout';
import '../styles/timetable.css';

const Timetable = () => {
    const { token } = useContext(AuthContext);
    const { addNotification } = useContext(NotificationContext);
    const [classes, setClasses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal State
    const [activeTab, setActiveTab] = useState('Me');
    const [selectedType, setSelectedType] = useState('Class');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showFreeTime, setShowFreeTime] = useState(false);
    const [freeSlots, setFreeSlots] = useState([]);
    const [flipDirection, setFlipDirection] = useState(null); // 'left' or 'right'

    const [classData, setClassData] = useState({
        subject: '',
        location: '',
        startTime: '',
        endTime: ''
    });

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get(`${API_BASE_URL}/api/timetable`, config);
                setClasses(res.data);
            } catch (err) {
                console.error("Error fetching timetable:", err);
            }
        };
        if (token) fetchClasses();
    }, [token]);

    // Handle Inputs
    const onChange = e => setClassData({ ...classData, [e.target.name]: e.target.value });

    // Date Helpers
    const getDayName = (date) => date.toLocaleDateString('en-US', { weekday: 'long' });
    const formatDateLong = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const formatDateShort = (date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();

    const handlePrevDay = () => {
        setFlipDirection('left');
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        setFlipDirection('right');
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    // Clear flip animation after it completes
    useEffect(() => {
        if (flipDirection) {
            const timer = setTimeout(() => setFlipDirection(null), 500);
            return () => clearTimeout(timer);
        }
    }, [flipDirection]);

    // Filter & sort classes for the selected day
    const currentDayName = getDayName(currentDate);
    const todaysClasses = classes
        .filter(c => c.day === currentDayName)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const myClasses = todaysClasses.filter(c => c.attendees === 'Me' || c.attendees === 'Both');
    const partnerClasses = todaysClasses.filter(c => c.attendees === 'Partner' || c.attendees === 'Both');

    // Format time for display (e.g. "09:00 - 10:30")
    const formatTimeRange = (start, end) => `${start} – ${end}`;

    // Submit New Class
    const onSubmit = async () => {
        if (!classData.subject || !classData.startTime || !classData.endTime) {
            addNotification('warning', 'Missing Information', 'Please fill in Subject and Times');
            return;
        }

        const formatTime = (t) => t.includes('T') ? t.split('T')[1].substring(0, 5) : t;

        const newClass = {
            subject: classData.subject,
            location: classData.location,
            startTime: formatTime(classData.startTime),
            endTime: formatTime(classData.endTime),
            day: currentDayName,
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
            const res = await axios.post(`${API_BASE_URL}/api/timetable`, newClass, config);
            setClasses([...classes, res.data]);
            setIsModalOpen(false);
            setClassData({ subject: '', location: '', startTime: '', endTime: '' });
            addNotification('success', 'Class Added', `Successfully added ${newClass.subject} to your timetable.`);
        } catch (err) {
            console.error("Error adding class:", err);
            addNotification('error', 'Error', 'Failed to add class. Please try again.');
        }
    };

    // Calculate Free Time
    const calculateFreeTime = () => {
        const intervals = todaysClasses.map(c => {
            const [startH, startM] = c.startTime.split(':').map(Number);
            const [endH, endM] = c.endTime.split(':').map(Number);
            return { start: startH * 60 + startM, end: endH * 60 + endM };
        }).sort((a, b) => a.start - b.start);

        const merged = [];
        if (intervals.length > 0) {
            let current = intervals[0];
            for (let i = 1; i < intervals.length; i++) {
                if (current.end >= intervals[i].start) {
                    current.end = Math.max(current.end, intervals[i].end);
                } else {
                    merged.push(current);
                    current = intervals[i];
                }
            }
            merged.push(current);
        }

        const free = [];
        let cursor = 8 * 60;
        const endOfDay = 22 * 60;

        for (const busy of merged) {
            if (busy.start > cursor) {
                free.push({ start: cursor, end: busy.start });
            }
            cursor = Math.max(cursor, busy.end);
        }
        if (cursor < endOfDay) {
            free.push({ start: cursor, end: endOfDay });
        }

        const meaningfulFree = free.filter(slot => slot.end - slot.start >= 30);
        setFreeSlots(meaningfulFree);
        setShowFreeTime(true);
    };

    const formatMinutesToTime = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return (
        <Layout>
            <div className="tt-container">
                {/* Title */}
                <h1 className="tt-title">Our Universe</h1>

                {/* Date Navigator */}
                <div className="tt-date-nav">
                    <button className="tt-date-arrow" onClick={handlePrevDay}>
                        <ChevronLeft size={18} />
                    </button>
                    <span className="tt-date-text">{formatDateLong(currentDate)}</span>
                    <button className="tt-date-arrow" onClick={handleNextDay}>
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Book Spread */}
                <div className={`tt-book-spread ${flipDirection === 'right' ? 'tt-flip-right' : ''} ${flipDirection === 'left' ? 'tt-flip-left' : ''}`}>
                    {/* Left Page — Me */}
                    <div className="tt-book-page tt-page-left">
                        <div className="tt-page-header">
                            <span className="tt-page-name">Me</span>
                            <span className="tt-page-subtitle">{formatDateShort(currentDate)}</span>
                        </div>

                        <div className="tt-events-list">
                            {myClasses.length > 0 ? myClasses.map(c => (
                                <div key={c._id} className="tt-event-item">
                                    <span className="tt-event-time">{formatTimeRange(c.startTime, c.endTime)}</span>
                                    <h3 className="tt-event-subject">
                                        {c.subject}
                                        {c.attendees === 'Both' && <Heart size={12} className="tt-shared-heart" fill="currentColor" />}
                                    </h3>
                                    {c.location && <p className="tt-event-location">{c.location}</p>}
                                </div>
                            )) : (
                                <p className="tt-no-events">Nothing scheduled</p>
                            )}
                        </div>

                        <div className="tt-page-avatar">
                            <div className="tt-avatar-circle">
                                <User size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Center Spine */}
                    <div className="tt-spine">
                        <div className="tt-spine-line"></div>
                        <div className="tt-spine-heart">
                            <Heart size={14} fill="#C5A55A" stroke="#C5A55A" />
                        </div>
                        <div className="tt-spine-line"></div>
                    </div>

                    {/* Right Page — Partner */}
                    <div className="tt-book-page tt-page-right">
                        <div className="tt-page-header tt-page-header-right">
                            <span className="tt-page-subtitle">VOLUME II</span>
                            <span className="tt-page-name">Partner</span>
                        </div>

                        <div className="tt-events-list tt-events-right">
                            {partnerClasses.length > 0 ? partnerClasses.map(c => (
                                <div key={c._id + 'p'} className="tt-event-item tt-event-item-right">
                                    <span className="tt-event-time">{formatTimeRange(c.startTime, c.endTime)}</span>
                                    <h3 className="tt-event-subject">
                                        {c.subject}
                                        {c.attendees === 'Both' && <Heart size={12} className="tt-shared-heart" fill="currentColor" />}
                                    </h3>
                                    {c.location && <p className="tt-event-location">{c.location}</p>}
                                </div>
                            )) : (
                                <p className="tt-no-events">Nothing scheduled</p>
                            )}
                        </div>

                        <div className="tt-page-avatar">
                            <div className="tt-avatar-circle tt-avatar-partner">
                                <Heart size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="tt-bottom-bar">
                    <button className="tt-sync-btn" onClick={calculateFreeTime}>
                        <HeartHandshake size={18} />
                        <span>Sync Hearts</span>
                    </button>
                    <button className="tt-add-btn" onClick={() => setIsModalOpen(true)} aria-label="Add new event">
                        <BookOpen size={18} />
                    </button>
                </div>

                {/* Add Modal */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                        <div className="modal-content light-theme">
                            <div className="modal-header">
                                <h2>Add New Adventure</h2>
                                <span style={{ color: '#8B7355', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    Mark a milestone in your universe <Sparkles size={16} color="#C5A55A" />
                                </span>
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
                                        <span className="toggle-icon">
                                            {option === 'Me' && <User size={16} />}
                                            {option === 'Partner' && <Heart size={16} />}
                                            {option === 'Both' && <Users size={16} />}
                                        </span>
                                        {option}
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
                                        <span className="pill-icon">
                                            {type === 'Class' && <GraduationCap size={16} />}
                                            {type === 'Exam' && <FileText size={16} />}
                                            {type === 'Extracurricular' && <Trophy size={16} />}
                                        </span>
                                        {type}
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
                            <div className="input-with-icon">
                                <MapPin size={16} className="input-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    name="location"
                                    value={classData.location}
                                    onChange={onChange}
                                    className="custom-input"
                                    style={{ paddingLeft: '35px' }}
                                    placeholder="Add a location or room number"
                                />
                            </div>

                            <button className="btn-gradient" onClick={onSubmit}>
                                <GraduationCap size={18} /> Add to Our Universe
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <span style={{ cursor: 'pointer', color: '#999' }} onClick={() => setIsModalOpen(false)}>Cancel</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Free Time Modal */}
                {showFreeTime && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowFreeTime(false)}>
                        <div className="modal-content light-theme" style={{ maxWidth: '420px' }}>
                            <div className="modal-header">
                                <h2><Sparkles size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Free Time Found!</h2>
                                <p style={{ color: '#8B7355' }}>Here are the best times to connect today:</p>
                            </div>
                            <div className="free-time-list">
                                {freeSlots.length > 0 ? (
                                    freeSlots.map((slot, i) => (
                                        <div key={i} className="free-time-slot">
                                            <Clock size={16} />
                                            <span>{formatMinutesToTime(slot.start)} – {formatMinutesToTime(slot.end)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>No free time slots found today!</p>
                                )}
                            </div>
                            <button className="btn-gradient" onClick={() => setShowFreeTime(false)} style={{ marginTop: '20px' }}>
                                Awesome!
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Timetable;
