
import Sidebar from './Sidebar';
import NotificationCenter from './NotificationCenter';
import '../styles/sidebar.css';

const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            {/* Global Background Blobs */}
            <div className="notification-wrapper" style={{ position: 'fixed', top: 20, right: 30, zIndex: 1000 }}>
                <NotificationCenter />
            </div>
            <div className="background-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
