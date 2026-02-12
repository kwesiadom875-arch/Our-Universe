const axios = require('axios');
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Simple in-memory cache: Map<string, { data: any, timestamp: number }>
const cache = new Map();
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

/**
 * Fetches popular media from TMDB with caching.
 * @param {string} mediaType - 'movie' or 'tv'
 * @param {number} page - Page number
 * @returns {Promise<Object>} - TMDB API response data
 */
const fetchPopularMedia = async (mediaType, page) => {
    const cacheKey = `popular_${mediaType}_${page}`;
    const now = Date.now();

    if (cache.has(cacheKey)) {
        const { data, timestamp } = cache.get(cacheKey);
        if (now - timestamp < CACHE_TTL) {
            // console.log(`[CACHE HIT] ${cacheKey}`); // Commented out to reduce noise
            return data;
        }
        cache.delete(cacheKey);
    }

    // console.log(`[API CALL] TMDB Popular ${mediaType} Page ${page}`);
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/${mediaType}/popular`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                page: page
            }
        });

        const data = response.data;
        cache.set(cacheKey, { data, timestamp: now });
        return data;
    } catch (error) {
        console.error(`Error fetching from TMDB: ${error.message}`);
        throw error;
    }
};

module.exports = {
    fetchPopularMedia
};
