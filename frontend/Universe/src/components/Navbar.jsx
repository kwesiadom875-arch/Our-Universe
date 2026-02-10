
import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
    const { logout, user } = useContext(AuthContext);

    return (
        <nav className="navbar-wrapper">
            <div className="navbar-pill">
                {/* Logo Section */}
                <div className="navbar-logo">
                    <span className="logo-heart">♡</span>
                    <span className="logo-text">Our <span className="logo-highlight">Universe</span></span>
                </div>

                {/* Navigation Links */}
                <div className="navbar-links">
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/timetable" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Timetable
                    </NavLink>
                    <NavLink to="/calendar" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Calendar
                    </NavLink>
                    <NavLink to="/movies" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Movies <span className="star-icon">☆</span>
                    </NavLink>
                    <NavLink to="/scents" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Scents
                    </NavLink>
                    <NavLink to="/scrapbook" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        Scrapbook
                    </NavLink>
                </div>

                {/* User & Action Section */}
                <div className="navbar-user-section">
                    <div className="user-info">
                        <span className="welcome-label">WELCOME BACK</span>
                        <span className="username">Hi, {user?.username}</span>
                    </div>

                    <div className="user-avatar">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                            alt="avatar"
                        />
                    </div>

                    <button onClick={logout} className="btn-logout-pill">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
