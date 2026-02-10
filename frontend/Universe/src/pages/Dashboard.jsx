

import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Calendar, Film, BookOpen, Clock, Heart } from 'lucide-react';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    // Get time of day for greeting
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12) greeting = 'Good Afternoon';
    if (hour >= 18) greeting = 'Good Evening';

    return (
        <Layout>
            <div className="dashboard-container">
                {/* Dynamic Background Removed - Now in Layout */}

                <div className="dashboard-header">
                    <span className="greeting-sup">{greeting}, {user?.username}</span>
                    <h1 className="greeting-main">Our Universe <Heart className="inline-heart" size={48} fill="#ff3366" color="#ff3366" /></h1>
                    <p className="greeting-sub">
                        Your shared space for moments. What would you like to explore today?
                    </p>
                </div>

                <div className="bento-grid">
                    <Link to="/timetable" className="bento-card card-timetable">
                        <div className="card-icon-wrapper">
                            <Clock size={32} color="white" />
                        </div>
                        <div className="card-content">
                            <h3 className="bento-title">Timetable</h3>
                            <p className="bento-desc">Stay on track with your shared classes and schedules.</p>
                        </div>
                    </Link>

                    <Link to="/calendar" className="bento-card card-calendar">
                        <div className="card-icon-wrapper">
                            <Calendar size={32} color="white" />
                        </div>
                        <div className="card-content">
                            <h3 className="bento-title">Shared Calendar</h3>
                            <p className="bento-desc">Plan dates, track anniversaries, and countdown to special moments together.</p>
                        </div>
                    </Link>

                    <Link to="/movies" className="bento-card card-movies">
                        <div className="card-icon-wrapper">
                            <Film size={32} color="white" />
                        </div>
                        <div className="card-content">
                            <h3 className="bento-title">Movie Matcher</h3>
                            <p className="bento-desc">Swipe, match, and decide on tonight's movie in seconds.</p>
                        </div>
                    </Link>

                    <Link to="/library" className="bento-card card-library">
                        <div className="card-icon-wrapper">
                            <BookOpen size={32} color="white" />
                        </div>
                        <div className="card-content">
                            <h3 className="bento-title">The Library</h3>
                            <p className="bento-desc">Catalogue your books, track reading progress, and share quotes.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
