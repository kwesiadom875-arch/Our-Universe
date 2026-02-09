import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Welcome {user && user.username}! 🌟</h1>
            <p>This is your shared universe.</p>

            <div style={{ margin: '2rem 0', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/timetable" style={{
                    background: '#FF3366',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'inline-block'
                }}>
                    View School Timetable 📅
                </a>
                <a href="/calendar" style={{
                    background: '#a855f7',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'inline-block'
                }}>
                    View Calendar 🗓️
                </a>

                <a href="/movies" style={{
                    background: '#8B5CF6',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'inline-block'
                }}>
                    Movie Matcher 🎬
                </a>
            </div>

            <button
                onClick={logout}
                style={{
                    padding: '0.5rem 1rem',
                    marginTop: '1rem',
                    background: '#ff4757',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
