import { useContext, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Clock, Calendar, Film, Wind, StickyNote, BookOpen, Heart, Menu, X } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import '../styles/sidebar.css';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button className="sidebar-hamburger" onClick={() => setIsOpen(true)} aria-label="Open menu">
                <Menu size={24} />
            </button>

            {/* Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Mobile Close Button */}
                <button className="sidebar-close" onClick={() => setIsOpen(false)} aria-label="Close menu">
                    <X size={22} />
                </button>

                <div className="sidebar-header">
                    <span className="logo-heart"><Heart size={28} fill="#ff3366" color="#ff3366" /></span>
                    <span className="logo-text">Universe</span>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
                        <span className="icon"><LayoutGrid size={20} /></span> Dashboard
                    </NavLink>
                    <NavLink to="/timetable" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
                        <span className="icon"><Clock size={20} /></span> Timetable
                    </NavLink>
                    <NavLink to="/calendar" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
                        <span className="icon"><Calendar size={20} /></span> Calendar
                    </NavLink>
                    <NavLink to="/movies" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
                        <span className="icon"><Film size={20} /></span> Movies
                    </NavLink>
                    <NavLink to="/scents" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
                        <span className="icon"><Wind size={20} /></span> Scents
                    </NavLink>
                    <NavLink to="/scrapbook" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
                        <span className="icon"><StickyNote size={20} /></span> Scrapbook
                    </NavLink>
                    <NavLink to="/library" className={({ isActive }) => isActive ? "side-link active" : "side-link"}>
                        <span className="icon"><BookOpen size={20} /></span> Library
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-mini-profile">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                            alt="avatar"
                        />
                        <div className="user-details">
                            <NavLink to="/profile" className="username-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <span className="username">{user?.username}</span>
                            </NavLink>
                            <button onClick={logout} className="btn-logout-mini">Logout</button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
