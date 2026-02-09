const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Swipe = require('../models/Swipe');
const User = require('../models/User');
const axios = require('axios'); // For server-side fetching

// @route   GET api/movies/popular
// @desc    Fetch popular movies from TMDB (via backend proxy)
// @access  Private
router.get('/popular', auth, async (req, res) => {
    try {
        const API_KEY = '9030d6fc7634373348182586f61ef12d';
        const tmdbRes = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
        res.json(tmdbRes.data);
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
        // First, find the partner. For now, we check ALL other users who liked this movie.
        // In a real app with 'partnerId', we would strictly check the partner.
        // We'll search for ANY 'like' on this movie by a DIFFERENT user.

        const potentialMatch = await Swipe.findOne({
            tmdbId,
            action: 'like',
            user: { $ne: req.user.id } // Not me
        });

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
        const myLikes = await Swipe.find({ user: req.user.id, action: 'like' });
        const myLikedIds = myLikes.map(s => s.tmdbId);

        if (myLikedIds.length === 0) return res.json([]);

        // 2. Find which of these movies have ALSO been liked by others (partner)
        const matches = await Swipe.find({
            tmdbId: { $in: myLikedIds },
            action: 'like',
            user: { $ne: req.user.id }
        });

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
