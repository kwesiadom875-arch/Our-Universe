import { useContext, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Clock, Calendar, Film, Wind, StickyNote, BookOpen, Heart, Menu, X, Settings } from 'lucide-react';
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

    const navItems = [
        { path: '/', icon: LayoutGrid, label: 'Dashboard' },
        { path: '/timetable', icon: Clock, label: 'Timetable' },
        { path: '/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/movies', icon: Film, label: 'Movies' },
        { path: '/library', icon: BookOpen, label: 'Library' },
        { path: '/scents', icon: Wind, label: 'Scents' },
        { path: '/scrapbook', icon: StickyNote, label: 'Scrapbook' },
    ];

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
                    <Heart size={24} fill="#ff3366" color="#ff3366" className="logo-icon" />
                    <span className="logo-text">Universe</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => isActive ? "side-link active" : "side-link"}
                        >
                            <span className="icon"><item.icon size={20} /></span>
                            <span className="label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                            alt="avatar"
                            className="user-avatar"
                        />
                        <div className="user-info">
                            <span className="username">{user?.username}</span>
                            <div className="user-actions">
                                <button className="action-link">SETTINGS</button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
