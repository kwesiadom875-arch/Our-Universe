const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MediaItem = require('../models/MediaItem');
const Swipe = require('../models/Swipe');
const User = require('../models/User');
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// @route   POST api/media/add
// @desc    Add item to "Watched" list
// @access  Private
router.post('/add', auth, async (req, res) => {
    const { tmdbId, mediaType, title, posterPath, rating } = req.body;

    try {
        let item = await MediaItem.findOne({ user: req.user.id, tmdbId, mediaType });

        if (item) {
            return res.status(400).json({ msg: 'Item already in your watched list' });
        }

        item = new MediaItem({
            user: req.user.id,
            tmdbId,
            mediaType: mediaType || 'movie',
            title,
            posterPath,
            rating: rating || 0
        });

        await item.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/media/watched
// @desc    Get all watched items for user and partner
// @access  Private
router.get('/watched', auth, async (req, res) => {
    try {
        // ⚡ Bolt: Fetch only partnerId with .lean() to reduce memory footprint and DB transfer load
        const user = await User.findById(req.user.id).select('partnerId').lean();
        const userIds = [req.user.id];
        if (user.partnerId) {
            userIds.push(user.partnerId);
        }

        const items = await MediaItem.find({ user: { $in: userIds } }).sort({ dateAdded: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/media/search
// @desc    Search TMDB for movies or tv shows
// @access  Private
router.get('/search', auth, async (req, res) => {
    const { query, type } = req.query; // type = 'movie' or 'tv'
    if (!query) return res.status(400).json({ msg: 'Query is required' });

    try {
        const searchType = type === 'tv' ? 'tv' : 'movie';
        const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/${searchType}?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`);

        const results = tmdbRes.data.results.map(item => ({
            id: item.id,
            title: item.title || item.name, // TMDB uses 'name' for TV
            poster_path: item.poster_path, // Keep snake_case to match frontend expectations or normalize? Frontend expects snake_case for TMDB results usually
            overview: item.overview,
            release_date: item.release_date || item.first_air_date,
            media_type: searchType
        }));

        res.json({ results });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/media/popular
// @desc    Get popular movies or tv shows (Filtered)
// @access  Private
router.get('/popular', auth, async (req, res) => {
    const { type } = req.query; // 'movie' or 'tv'
    const mediaType = type === 'tv' ? 'tv' : 'movie';

    try {
        // 1. Get IDs of seen items (Swipes AND Watched list)
        // We technically only check Swipes for the Matcher flow, but maybe we should also exclude things manually marked as watched?
        // Let's exclude BOTH.

        const [swipes, watched] = await Promise.all([
            Swipe.find({ user: req.user.id }).select('tmdbId'),
            MediaItem.find({ user: req.user.id, mediaType }).select('tmdbId')
        ]);

        const seenIds = new Set([
            ...swipes.map(s => s.tmdbId),
            ...watched.map(w => w.tmdbId)
        ]);

        let candidateItems = [];
        let page = 1;
        const MAX_PAGES = 5;
        const REQUIRED_COUNT = 20;

        while (candidateItems.length < REQUIRED_COUNT && page <= MAX_PAGES) {
            const tmdbRes = await axios.get(`https://api.themoviedb.org/3/${mediaType}/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
            const results = tmdbRes.data.results;

            const newCandidates = results.filter(item => !seenIds.has(item.id));

            // Normalize data structure for frontend (Title vs Name)
            const normalized = newCandidates.map(item => ({
                ...item,
                title: item.title || item.name,
                original_title: item.original_title || item.original_name,
                release_date: item.release_date || item.first_air_date
            }));

            candidateItems = [...candidateItems, ...normalized];
            page++;
        }

        res.json({ results: candidateItems.slice(0, 20) });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/media/recommendations
// @desc    Get recommendations based on Watched list
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
    try {
        // 1. Get user's watched list
        const watchedItems = await MediaItem.find({ user: req.user.id });

        if (watchedItems.length === 0) {
            // Fallback to top rated if nothing watched
            const tmdbRes = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
            return res.json({ results: tmdbRes.data.results.slice(0, 10), source: 'top_rated' });
        }

        // 2. Pick a random item from watched list to seed recommendations
        // In a real app, we might mix recommendations from multiple seeds
        const seed = watchedItems[Math.floor(Math.random() * watchedItems.length)];
        const type = seed.mediaType;

        const tmdbRes = await axios.get(`https://api.themoviedb.org/3/${type}/${seed.tmdbId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`);

        let results = tmdbRes.data.results;

        // Filter out things already seen
        const seenIds = new Set(watchedItems.map(w => w.tmdbId));
        results = results.filter(r => !seenIds.has(r.id)).slice(0, 10);

        // Normalize
        results = results.map(item => ({
            ...item,
            title: item.title || item.name,
            media_type: type
        }));

        res.json({ results, seed: seed.title });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
