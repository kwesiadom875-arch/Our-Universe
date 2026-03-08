import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { ChevronLeft, ChevronRight, Plus, Sparkles, User, Heart, Users, CalendarDays } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import NotificationContext from '../context/NotificationContext';
import '../styles/calendar.css';
import '../styles/timetable.css'; // Importing for shared modal/utility styles if needed

const Calendar = () => {
    const { token } = useContext(AuthContext);
    const { addNotification } = useContext(NotificationContext);
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal State
    const [activeTab, setActiveTab] = useState('Me'); // Me, Partner, Both
    const [selectedType, setSelectedType] = useState('Other');
    const [eventData, setEventData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: ''
    });

    const { title, date, startTime, endTime, description } = eventData;

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    // Fetch Events when token or month changes (optimization: fetch all for now)
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get(`${API_BASE_URL}/api/events`, config);
                setEvents(res.data);
            } catch (err) {
                console.error("Error fetching events:", err);
            }
        };

        if (token) fetchEvents();
    }, [token]);

    // Date Logic
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        // 0 = Sunday, 1 = Monday, ...
        return new Date(year, month, 1).getDay();
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month); // 0-6 (Sun-Sat)

    // Adjust for Monday start if preferred, but standard is Sunday start usually
    // Let's stick to Sunday start for standard grid
    const blanks = Array(firstDayIndex).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const changeMonth = (offset) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    // Handle Inputs
    const onChange = e => setEventData({ ...eventData, [e.target.name]: e.target.value });

    // Submit New Event
    const onSubmit = async () => {
        if (!eventData.title || !eventData.date) {
            addNotification('warning', 'Missing Information', 'Please fill in Title and Date');
            return;
        }

        const newEvent = {
            title: eventData.title,
            date: eventData.date,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            type: selectedType,
            attendees: activeTab,
            description: eventData.description
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };
            const res = await axios.post(`${API_BASE_URL}/api/events`, newEvent, config);
            setEvents([...events, res.data]);
            setIsModalOpen(false);
            setEventData({ title: '', date: '', startTime: '', endTime: '', description: '' });
            addNotification('success', 'Event Added', `Successfully added ${newEvent.title} to your calendar.`);
        } catch (err) {
            console.error("Error adding event:", err);
            addNotification('error', 'Error', 'Failed to add event. Please try again.');
        }
    };

    // Filter events for a specific day
    const getEventsForDay = (day) => {
        return events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === month &&
                eventDate.getFullYear() === year;
        });
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    return (
        <Layout>
            <div className="calendar-container">
                {/* Header */}
                <div className="calendar-header">
                    <div className="month-navigator">
                        <button onClick={() => changeMonth(-1)}><ChevronLeft size={24} /></button>
                        <div className="current-month">
                            <span>{year}</span>
                            <h2>{monthNames[month]}</h2>
                        </div>
                        <button onClick={() => changeMonth(1)}><ChevronRight size={24} /></button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="day-header">{d}</div>
                    ))}

                    {blanks.map((_, i) => (
                        <div key={`blank-${i}`} className="calendar-day empty"></div>
                    ))}

                    {days.map(day => (
                        <div key={day} className={`calendar-day ${isToday(day) ? 'today' : ''}`}
                            onClick={() => {
                                // Optional: pre-fill date on click
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                setEventData({ ...eventData, date: dateStr });
                                setIsModalOpen(true);
                            }}
                        >
                            <span className="day-number">{day}</span>
                            <div className="day-events">
                                {getEventsForDay(day).map(e => (
                                    <div key={e._id} className={`event-pill ${e.attendees.toLowerCase()}`} title={e.title}>
                                        {e.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Button */}
                <div className="fab-add" onClick={() => setIsModalOpen(true)}><Plus size={32} /></div>

                {/* Modal - Reusing styles from Timetable/Calendar CSS */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                        <div className="modal-content light-theme">
                            <div className="modal-header">
                                <h2>Add New Event</h2>
                                <span style={{ color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    Plan something special <Sparkles size={16} color="#F59E0B" />
                                </span>
                            </div>

                            {/* Who Toggle */}
                            <div className="input-label">Whose event is this?</div>
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

                            {/* Title */}
                            <label className="input-label">Event Title</label>
                            <input
                                type="text"
                                name="title"
                                value={eventData.title}
                                onChange={onChange}
                                className="custom-input"
                                placeholder="e.g., Dinner Date, Gym, Meeting..."
                            />

                            {/* Type Pills */}
                            <label className="input-label">Type</label>
                            <div className="type-pills">
                                {['Date', 'Work', 'Trip', 'Other'].map(type => (
                                    <div
                                        key={type}
                                        className={`pill-type ${selectedType === type ? 'active' : ''}`}
                                        onClick={() => setSelectedType(type)}
                                    >
                                        {type}
                                    </div>
                                ))}
                            </div>

                            {/* Date & Time */}
                            <label className="input-label">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={eventData.date}
                                onChange={onChange}
                                className="custom-input"
                            />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="input-label">Start Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={eventData.startTime}
                                        onChange={onChange}
                                        className="custom-input"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="input-label">End Time</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={eventData.endTime}
                                        onChange={onChange}
                                        className="custom-input"
                                    />
                                </div>
                            </div>

                            <button className="btn-gradient" onClick={onSubmit}>
                                <CalendarDays size={18} /> Add to Calendar
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <span style={{ cursor: 'pointer', color: '#999' }} onClick={() => setIsModalOpen(false)}>Cancel</span>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Calendar;
