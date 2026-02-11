const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LibraryItem = require('../models/LibraryItem');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   GET api/library/search
// @desc    Search Google Books API
// @access  Private
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ msg: 'Query is required' });

        // Using Google Books Public API (no key needed for basic search, usually)
        // If rate limited, we can add a key later
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`);

        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/library
// @desc    Get all books in user's library and partner's library
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        const userIds = [req.user.id];
        if (user.partnerId) {
            userIds.push(user.partnerId);
        }

        const books = await LibraryItem.find({ user: { $in: userIds } }).sort({ createdAt: -1 });
        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/library
// @desc    Add a book to library
// @access  Private
router.post('/', auth, async (req, res) => {
    const { googleBookId, title, authors, thumbnail, pageCount, description, status } = req.body;

    try {
        // Check if already in library
        let book = await LibraryItem.findOne({ user: req.user.id, googleBookId });
        if (book) {
            return res.status(400).json({ msg: 'Book already in your library' });
        }

        book = new LibraryItem({
            user: req.user.id,
            googleBookId,
            title,
            authors,
            thumbnail,
            pageCount,
            description,
            status,
            startDate: new Date()
        });

        await book.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/library/:id/progress
// @desc    Update reading progress or details
// @access  Private
router.put('/:id/progress', auth, async (req, res) => {
    const { currentPage, status, pageCount } = req.body;
    try {
        let book = await LibraryItem.findById(req.params.id);
        if (!book) return res.status(404).json({ msg: 'Book not found' });

        // Authorization check
        if (book.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (currentPage !== undefined) book.currentPage = currentPage;
        if (pageCount !== undefined) book.pageCount = pageCount; // Allow fixing total pages

        if (status) {
            book.status = status;
            if (status === 'Finished') book.finishDate = new Date();
        }

        await book.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/library/:id/content
// @desc    Add note, quote, or character
// @access  Private
router.post('/:id/content', auth, async (req, res) => {
    const { type, data } = req.body; // type: 'note', 'character'
    try {
        let book = await LibraryItem.findById(req.params.id);
        if (!book) return res.status(404).json({ msg: 'Book not found' });

        // Authorization check
        if (book.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (type === 'note') {
            book.notes.push(data); // data needs content, page, type, isPrivate
        } else if (type === 'character') {
            book.characters.push(data); // data needs name, role, description
        }

        await book.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/library/:id/characters/suggest
// @desc    Use Gemini AI to find all characters in a book
// @access  Private
router.get('/:id/characters/suggest', auth, async (req, res) => {
    try {
        let book = await LibraryItem.findById(req.params.id);
        if (!book) return res.status(404).json({ msg: 'Book not found' });
        if (book.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Build a rich prompt using title, authors, ISBN, and description
        const bookInfo = [
            `Title: "${book.title}"`,
            `Author(s): ${book.authors.join(', ')}`,
            book.googleBookId ? `Google Books ID: ${book.googleBookId}` : '',
            book.description ? `Description: ${book.description}` : ''
        ].filter(Boolean).join('\n');

        const existingNames = (book.characters || []).map(c => c.name);
        const excludeNote = existingNames.length > 0
            ? `\nAlready added characters (DO NOT include these): ${existingNames.join(', ')}`
            : '';

        const prompt = `You are a book expert. Given the following book information, list ALL the notable characters from this book.

For each character, provide:
- name: The character's full name as commonly known
- role: One of: Protagonist, Antagonist, Supporting, Love Interest, Mentor (pick the best fit)
- description: A brief 1-2 sentence description of who they are and their role in the story. Do NOT include major spoilers.

${bookInfo}${excludeNote}

Respond ONLY with a valid JSON array. No markdown, no code blocks, no extra text. Example format:
[{"name": "Character Name", "role": "Protagonist", "description": "Brief description"}]`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Parse JSON from response (handle possible markdown wrapping)
        let jsonStr = responseText;
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }

        const suggestions = JSON.parse(jsonStr);

        // Validate and filter
        const validSuggestions = suggestions
            .filter(s => s.name && typeof s.name === 'string')
            .filter(s => !existingNames.map(n => n.toLowerCase()).includes(s.name.toLowerCase()))
            .map(s => ({
                name: s.name,
                role: ['Protagonist', 'Antagonist', 'Supporting', 'Love Interest', 'Mentor'].includes(s.role) ? s.role : 'Supporting',
                description: s.description || ''
            }));

        res.json({ suggestions: validSuggestions });
    } catch (err) {
        console.error('Gemini AI Error:', err.message);
        res.status(500).json({ msg: 'AI character extraction failed', error: err.message });
    }
});

// @route   DELETE api/library/:id/content/:contentId
// @desc    Delete a note or character by subdocument ID
// @access  Private
router.delete('/:id/content/:contentId', auth, async (req, res) => {
    try {
        let book = await LibraryItem.findById(req.params.id);
        if (!book) return res.status(404).json({ msg: 'Book not found' });
        if (book.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { contentType } = req.query; // 'note' or 'character'
        if (contentType === 'note') {
            book.notes = book.notes.filter(n => n._id.toString() !== req.params.contentId);
        } else if (contentType === 'character') {
            book.characters = book.characters.filter(c => c._id.toString() !== req.params.contentId);
        }

        await book.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/library/:id/content/:contentId
// @desc    Update a character's details
// @access  Private
router.put('/:id/content/:contentId', auth, async (req, res) => {
    try {
        let book = await LibraryItem.findById(req.params.id);
        if (!book) return res.status(404).json({ msg: 'Book not found' });
        if (book.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { name, role, description } = req.body;
        const char = book.characters.id(req.params.contentId);
        if (!char) return res.status(404).json({ msg: 'Character not found' });

        if (name) char.name = name;
        if (role) char.role = role;
        if (description !== undefined) char.description = description;

        await book.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
