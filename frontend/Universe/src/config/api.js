// API base URL configuration
// In development: uses VITE_API_URL or defaults to localhost:5000
// In production: empty string (relative URLs, since the same server serves both frontend and API)

const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default API_BASE_URL;
