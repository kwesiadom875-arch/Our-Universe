

import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import {
    Calendar as CalendarIcon,
    Film,
    BookOpen,
    Clock,
    Heart,
    Bell,
    Image as ImageIcon,
    Tag,
    MoreHorizontal
} from 'lucide-react';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    // Data State
    const [timetable, setTimetable] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [stats, setStats] = useState({ photos: 0, dates: 0 });

    // Time/Greeting
    const [greeting, setGreeting] = useState('');
    const [currentDateDisplay, setCurrentDateDisplay] = useState('');

    useEffect(() => {
        // Set Greeting
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        // Set Date Display (e.g., "Thursday, August 21st")
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        setCurrentDateDisplay(new Date().toLocaleDateString('en-US', dateOptions));

        fetchDashboardData();
    }, [token]);

    const fetchDashboardData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const config = { headers: { 'x-auth-token': token } };

            // 1. Fetch Timetable (All) -> Filter for Today
            const timetableRes = await axios.get(`${API_BASE_URL}/api/timetable`, config);
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"

            // Filter: Today's classes, sorted by time
            const todaysClasses = timetableRes.data
                .filter(item => item.day === today)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

            setTimetable(todaysClasses);

            // 2. Fetch Events (All) -> Filter for Upcoming & Count Dates
            const eventsRes = await axios.get(`${API_BASE_URL}/api/events`, config);
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Start of today

            const futureEvents = eventsRes.data
                .filter(e => new Date(e.date) >= now)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 4); // Take top 4

            const dateCount = eventsRes.data.filter(e => e.type === 'Date').length;

            setUpcomingEvents(futureEvents);

            // 3. Fetch Memories (All) -> Count Photos
            const memoriesRes = await axios.get(`${API_BASE_URL}/api/memories`, config);
            // API returns { memories: [], total: ... }
            const memoriesArray = memoriesRes.data.memories || [];
            const photoCount = memoriesArray.filter(m => m.type === 'photo').length;

            setStats({ photos: photoCount, dates: dateCount });

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Format time "09:00" -> "09:00"
    // Helper: Date formatter for upcoming
    const getEventDateParts = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return { sub: 'HAPPENING', main: 'TODAY' };
        if (date.toDateString() === tomorrow.toDateString()) return { sub: 'COMING UP', main: 'TOMORROW' };

        return { sub: month, main: day };
    };

    return (
        <Layout>
            <div className="dashboard-container">

                {/* --- Left/Main Column --- */}
                <div className="main-feed">
                    {/* Header */}
                    <header className="dash-header">
                        <span className="greeting-sub">{greeting.toUpperCase()}, {user?.username?.toUpperCase()}</span>
                        <h1 className="greeting-title">Our Universe <Heart className="inline-heart" fill="#ff3366" color="#ff3366" size={32} /></h1>
                    </header>

                    {/* Timetable Widget */}
                    <div className="widget-card timetable-widget">
                        <div className="widget-header">
                            <div className="icon-badge green">
                                <Clock size={20} color="#10B981" />
                            </div>
                            <div className="widget-title-group">
                                <h3>Timetable</h3>
                                <span>Today's shared schedule</span>
                            </div>
                            <button className="widget-more-btn"><MoreHorizontal size={20} /></button>
                        </div>

                        <div className="timetable-timeline">
                            {timetable.length > 0 ? (
                                timetable.map((item, index) => (
                                    <div key={item._id} className="timeline-item">
                                        <div className="time-col">
                                            <span className="time-start">{item.startTime}</span>
                                        </div>
                                        <div className={`timeline-marker ${index === 0 ? 'active' : ''}`}></div>
                                        <div className="event-content">
                                            <h4>{item.subject}</h4>
                                            <p>{item.location || 'No location'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>Nothing scheduled for today. Enjoy your free time!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bento Grid: Calendar, Movies, Library */}
                    <div className="bento-middle-row">
                        {/* Shared Calendar */}
                        <Link to="/calendar" className="widget-card calendar-card">
                            <div className="card-icon-lg">
                                <CalendarIcon size={32} color="#8B5CF6" />
                            </div>
                            <div className="card-text">
                                <h3>Shared Calendar</h3>
                                <p>Plan your next adventure or track the little things that matter.</p>
                            </div>
                            <div className="avatars-stack">
                                {/* Mocks */}
                                <div className="avatar">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="me" />
                                </div>
                                <div className="avatar partner">
                                    <Heart size={14} fill="white" color="white" />
                                </div>
                            </div>
                        </Link>

                        {/* Movie Matcher */}
                        <Link to="/movies" className="widget-card small-card">
                            <div className="card-icon-red">
                                <Film size={28} color="#F43F5E" />
                            </div>
                            <h3>Movie Matcher</h3>
                            <span className="badge-pill">4 NEW</span>
                        </Link>

                        {/* The Library */}
                        <Link to="/library" className="widget-card small-card">
                            <div className="card-icon-orange">
                                <BookOpen size={28} color="#F97316" />
                            </div>
                            <h3>The Library</h3>
                            <span className="badge-pill orange">12 BOOKS</span>
                        </Link>
                    </div>

                    {/* Bottom Stats Row */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stat-icon pink"><ImageIcon size={20} /></div>
                            <div className="stat-info">
                                <h2>{stats.photos}</h2>
                                <span>PHOTOS</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue"><Tag size={20} /></div>
                            <div className="stat-info">
                                <h2>{stats.dates}</h2>
                                <span>DATES</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- Right Column: Upcoming --- */}
                <div className="right-sidebar">
                    <div className="sidebar-date-header">
                        <span className="current-date">{currentDateDisplay}</span>
                        <span className="events-count">{upcomingEvents.length} Events Upcoming</span>
                    </div>

                    <div className="widget-card upcoming-widget">
                        <div className="widget-header">
                            <h3>Upcoming Events</h3>
                            <Bell size={20} color="#F43F5E" />
                        </div>

                        <div className="upcoming-list">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map(event => {
                                    const dateParts = getEventDateParts(event.date);
                                    return (
                                        <div key={event._id} className="upcoming-item">
                                            <div className="upcoming-date-badge">
                                                <span className="sub-label">{dateParts.sub}</span>
                                                <span className="main-label">{dateParts.main}</span>
                                            </div>
                                            <div className="upcoming-details">
                                                <h4>{event.title}</h4>
                                                <p className="upcoming-meta">
                                                    <Clock size={12} style={{ marginRight: 4 }} />
                                                    {event.startTime ? `${event.startTime} • ` : ''} {event.location || event.type}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="empty-state">
                                    <p>No upcoming events.</p>
                                </div>
                            )}
                        </div>

                        <Link to="/calendar" className="view-all-btn">
                            VIEW ALL CALENDAR
                        </Link>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default Dashboard;
