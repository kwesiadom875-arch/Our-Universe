const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate a unique 8-character invite code
const generateInviteCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Bolt Optimization: Generate invite codes in batches to avoid N+1 queries during collision retries
const generateUniqueInviteCode = async () => {
    const BATCH_SIZE = 5;
    while (true) {
        const candidates = Array.from({ length: BATCH_SIZE }, generateInviteCode);
        const existingUsers = await User.find({ inviteCode: { $in: candidates } })
            .select('inviteCode')
            .lean();

        const existingCodes = new Set(existingUsers.map(u => u.inviteCode));
        for (const code of candidates) {
            if (!existingCodes.has(code)) {
                return code;
            }
        }
    }
};

// Bolt Optimization: Find next available username without N+1 queries
const generateUniqueUsername = async (baseName) => {
    const baseUsername = baseName.replace(/\s+/g, '').toLowerCase();
    const escapedBase = baseUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Fetch all similar usernames in one query
    const existingUsers = await User.find({ username: { $regex: new RegExp(`^${escapedBase}[0-9]*$`) } })
        .select('username')
        .lean();

    const existingUsernames = new Set(existingUsers.map(u => u.username));

    if (!existingUsernames.has(baseUsername)) {
        return baseUsername;
    }

    let counter = 1;
    while (existingUsernames.has(`${baseUsername}${counter}`)) {
        counter++;
    }

    return `${baseUsername}${counter}`;
};

// Helper: create JWT token
const createToken = (userId, username) => {
    return new Promise((resolve, reject) => {
        const payload = { user: { id: userId, username } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) reject(err);
            resolve(token);
        });
    });
};

// @route   POST api/auth/register
// @desc    Register user (Create Universe - Flow 1)
// @access  Public
router.post('/register', authLimiter, async (req, res) => {
    const { username, email, password, profilePicture } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Check if username is taken
        let existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ msg: 'Username already taken' });
        }

        // Generate unique invite code
        const inviteCode = await generateUniqueInviteCode();

        user = new User({
            username,
            email,
            password,
            profilePicture: profilePicture || null,
            inviteCode,
            inviteCodeExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const token = await createToken(user.id, user.username);
        res.json({ token, inviteCode });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/register-with-code
// @desc    Register user with invite code (Join Universe - Flow 2)
// @access  Public
router.post('/register-with-code', authLimiter, async (req, res) => {
    const { username, email, password, profilePicture, inviteCode } = req.body;

    try {
        // Validate invite code
        const partner = await User.findOne({ inviteCode });
        if (!partner) {
            return res.status(400).json({ msg: 'Invalid invite code' });
        }

        if (partner.inviteCodeExpiry && partner.inviteCodeExpiry < new Date()) {
            return res.status(400).json({ msg: 'Invite code has expired. Ask your partner to generate a new one.' });
        }

        if (partner.partnerId) {
            return res.status(400).json({ msg: 'This invite code has already been used' });
        }

        // Check existing user
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        let existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ msg: 'Username already taken' });
        }

        // Create the new user
        user = new User({
            username,
            email,
            password,
            profilePicture: profilePicture || null
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Link both partners
        user.partnerId = partner._id;
        partner.partnerId = user._id;
        partner.inviteCode = undefined;
        partner.inviteCodeExpiry = undefined;

        await user.save();
        await partner.save();

        const token = await createToken(user.id, user.username);
        res.json({ token, partnerName: partner.username });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/google
// @desc    Google Sign-In (register or login)
// @access  Public
router.post('/google', authLimiter, async (req, res) => {
    const { credential, inviteCode: joinCode } = req.body;

    try {
        // Verify the Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { sub: googleId, email, name, picture } = ticket.getPayload();

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId });

        if (user) {
            // Existing user — just log in
            const token = await createToken(user.id, user.username);
            return res.json({ token });
        }

        // Check if an account exists with this email (merge)
        user = await User.findOne({ email });
        if (user) {
            user.googleId = googleId;
            if (!user.profilePicture && picture) {
                user.profilePicture = picture;
            }
            await user.save();
            const token = await createToken(user.id, user.username);
            return res.json({ token });
        }

        // New user — register via Google
        // Generate a unique username from Google name
        const username = await generateUniqueUsername(name);

        // If joining with an invite code
        if (joinCode) {
            const partner = await User.findOne({ inviteCode: joinCode });
            if (!partner) {
                return res.status(400).json({ msg: 'Invalid invite code' });
            }
            if (partner.inviteCodeExpiry && partner.inviteCodeExpiry < new Date()) {
                return res.status(400).json({ msg: 'Invite code has expired' });
            }
            if (partner.partnerId) {
                return res.status(400).json({ msg: 'This invite code has already been used' });
            }

            user = new User({
                username,
                email,
                googleId,
                profilePicture: picture || null
            });
            await user.save();

            // Link partners
            user.partnerId = partner._id;
            partner.partnerId = user._id;
            partner.inviteCode = undefined;
            partner.inviteCodeExpiry = undefined;
            await user.save();
            await partner.save();

            const token = await createToken(user.id, user.username);
            return res.json({ token, partnerName: partner.username });
        }

        // Creating a new universe (no invite code)
        const inviteCode = await generateUniqueInviteCode();

        user = new User({
            username,
            email,
            googleId,
            profilePicture: picture || null,
            inviteCode,
            inviteCodeExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000)
        });
        await user.save();

        const token = await createToken(user.id, user.username);
        res.json({ token, inviteCode });
    } catch (err) {
        console.error('Google auth error:', err.message);
        res.status(500).json({ msg: 'Google authentication failed' });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // If user signed up with Google only (no password)
        if (!user.password) {
            return res.status(400).json({ msg: 'This account uses Google Sign-In. Please use the Google button to log in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const token = await createToken(user.id, user.username);
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('partnerId', 'username profilePicture');

        // Transform for easier frontend consumption
        const userData = user.toObject();
        if (user.partnerId) {
            userData.partnerDetails = user.partnerId;
            userData.partnerId = user.partnerId._id; // Keep original ID field as just ID
        }

        res.json(userData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/auth/invite-code
// @desc    Get or regenerate invite code
// @access  Private
router.get('/invite-code', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.partnerId) {
            return res.status(400).json({ msg: 'You are already linked with a partner' });
        }

        // If code is expired or doesn't exist, generate a new one
        if (!user.inviteCode || (user.inviteCodeExpiry && user.inviteCodeExpiry < new Date())) {
            const inviteCode = await generateUniqueInviteCode();
            user.inviteCode = inviteCode;
            user.inviteCodeExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
            await user.save();
        }

        res.json({
            inviteCode: user.inviteCode,
            expiresAt: user.inviteCodeExpiry
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/update
// @desc    Update user profile
// @access  Private
router.put('/update', auth, async (req, res) => {
    const { username, profilePicture, theme, timezone } = req.body;

    // Build user object
    const userFields = {};
    if (username) userFields.username = username;
    if (profilePicture) userFields.profilePicture = profilePicture;
    if (theme) userFields.theme = theme;
    if (timezone) userFields.timezone = timezone;

    try {
        let user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Check if username is taken (if changing)
        if (username && username !== user.username) {
            let existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ msg: 'Username already taken' });
            }
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
