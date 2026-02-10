
import Sidebar from './Sidebar';
import '../styles/sidebar.css';

const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            {/* Global Background Blobs */}
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
