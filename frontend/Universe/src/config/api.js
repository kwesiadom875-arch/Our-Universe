const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000' : '');

// Warn if API URL is missing in production
if (import.meta.env.PROD && !API_BASE_URL) {
    console.warn('API_BASE_URL is not defined! API requests may fail. Set VITE_API_URL in your environment.');
}

export default API_BASE_URL;
