const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Swipe = require('../models/Swipe');
const User = require('../models/User');
const axios = require('axios'); // For server-side fetching

// @route   GET api/movies/popular
// @desc    Fetch popular movies from TMDB (via backend proxy) and filter out seen ones
// @access  Private
router.get('/popular', auth, async (req, res) => {
    try {
        const API_KEY = process.env.TMDB_API_KEY;

        // 1. Get IDs of movies the user (and partner) has already swiped on
        // Bolt: Optimize user fetch
        const user = await User.findById(req.user.id).select('partnerId').lean();
        const userIds = [req.user.id];
        if (user.partnerId) userIds.push(user.partnerId);

        // Bolt: Add lean() for read-only query
        const userSwipes = await Swipe.find({ user: { $in: userIds } }).select('tmdbId').lean();
        const seenMovieIds = new Set(userSwipes.map(s => s.tmdbId));

        let candidateMovies = [];
        let page = 1;
        const MAX_PAGES_TO_FETCH = 5; // Safety limit to prevent infinite loops
        const REQUIRED_COUNT = 20;

        // Loop until we have enough movies or hit the safety limit
        // We start from a random page to give variety? 
        // Or better: store the "last fetched page" in User model?
        // For now, let's just cycle through pages 1 to MAX_PAGES_TO_FETCH

        // Randomize starting page slightly to avoid always showing same movies to new users?
        // Let's stick to sequential for consistency, but maybe start at page 1.

        while (candidateMovies.length < REQUIRED_COUNT && page <= MAX_PAGES_TO_FETCH) {
            const tmdbRes = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
            const results = tmdbRes.data.results;

            // Filter out seen movies
            const newCandidates = results.filter(movie => !seenMovieIds.has(movie.id));

            // Add unique new candidates
            candidateMovies = [...candidateMovies, ...newCandidates];

            page++;
        }

        // Limit to 20
        res.json({ results: candidateMovies.slice(0, 20) });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/movies/swipe
// @desc    Record a swipe (like/pass) and check for match
// @access  Private
router.post('/swipe', auth, async (req, res) => {
    const { tmdbId, title, posterPath, action } = req.body;

    try {
        // 1. Save the swipe
        let swipe = await Swipe.findOne({ user: req.user.id, tmdbId });

        if (swipe) {
            // Update existing if they changed their mind (e.g., rewind feature)
            swipe.action = action;
            await swipe.save();
        } else {
            swipe = new Swipe({
                user: req.user.id,
                tmdbId,
                title,
                posterPath,
                action
            });
            await swipe.save();
        }

        // 2. If it's a PASS, no match possible
        if (action === 'pass') {
            return res.json({ match: false });
        }

        // 3. If it's a LIKE, check if partner liked it
        const user = await User.findById(req.user.id);
        let potentialMatch = null;

        if (user.partnerId) {
            potentialMatch = await Swipe.findOne({
                tmdbId,
                action: 'like',
                user: user.partnerId
            });
        } else {
            // Fallback: check ANY other user (for demo purposes if no partner linked)
            potentialMatch = await Swipe.findOne({
                tmdbId,
                action: 'like',
                user: { $ne: req.user.id }
            });
        }

        if (potentialMatch) {
            // IT'S A MATCH!
            return res.json({ match: true, movieData: { tmdbId, title, posterPath } });
        }

        res.json({ match: false });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/movies/matches
// @desc    Get all mutual matches
// @access  Private
router.get('/matches', auth, async (req, res) => {
    try {
        // 1. Get all my likes
        // Bolt: Add lean()
        const myLikes = await Swipe.find({ user: req.user.id, action: 'like' }).lean();
        const myLikedIds = myLikes.map(s => s.tmdbId);

        if (myLikedIds.length === 0) return res.json([]);

        // 2. Find which of these movies have ALSO been liked by others (partner)
        // Bolt: Optimize user fetch
        const user = await User.findById(req.user.id).select('partnerId').lean();
        let matches = [];

        if (user.partnerId) {
            matches = await Swipe.find({
                tmdbId: { $in: myLikedIds },
                action: 'like',
                user: user.partnerId
            }).lean();
        } else {
            matches = await Swipe.find({
                tmdbId: { $in: myLikedIds },
                action: 'like',
                user: { $ne: req.user.id }
            }).lean();
        }

        // Deduplicate matches (if multiple people matched, though currently 1-1)
        // We return the MOVIE details
        const uniqueMatches = [];
        const map = new Map();

        for (const match of matches) {
            if (!map.has(match.tmdbId)) {
                map.set(match.tmdbId, true);
                uniqueMatches.push({
                    tmdbId: match.tmdbId,
                    title: match.title,
                    posterPath: match.posterPath
                });
            }
        }


        res.json(uniqueMatches);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
