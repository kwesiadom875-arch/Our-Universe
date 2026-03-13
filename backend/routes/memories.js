const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// @route   GET /api/memories
// @desc    Get all memories for a user and partner
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // ⚡ Bolt: Fetch only partnerId with .lean() to reduce memory footprint and DB transfer load
        const user = await require('../models/User').findById(req.user.id).select('partnerId').lean();
        const userIds = [req.user.id];
        if (user.partnerId) {
            userIds.push(user.partnerId);
        }

        const query = { user: { $in: userIds } };

        const memories = await Memory.find(query)
            .sort({ createdAt: -1 }) // Sorted by newest first usually makes sense for feeds, was 1 (oldest first) in original but user requested -1. I will use -1 as requested.
            .skip(skip)
            .limit(limit);

        const total = await Memory.countDocuments(query);

        res.json({
            memories,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/memories
// @desc    Create a new memory
// @access  Private
router.post('/', auth, async (req, res) => {
    const { type, content, style, position, rotation, scale, zIndex } = req.body;

    try {
        const newMemory = new Memory({
            user: req.user.id,
            type,
            content,
            style,
            position,
            rotation,
            scale,
            zIndex
        });

        const memory = await newMemory.save();
        res.json(memory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/memories/:id
// @desc    Update a memory (position, rotation, content, etc.)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let memory = await Memory.findById(req.params.id);

        if (!memory) return res.status(404).json({ msg: 'Memory not found' });

        // Ensure user owns memory
        if (memory.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const { type, content, style, position, rotation, scale, zIndex } = req.body;

        // Build update object
        const memoryFields = {};
        if (type) memoryFields.type = type;
        if (content) memoryFields.content = content;
        if (style) memoryFields.style = style;
        if (position) memoryFields.position = position;
        if (rotation !== undefined) memoryFields.rotation = rotation;
        if (scale !== undefined) memoryFields.scale = scale;
        if (zIndex !== undefined) memoryFields.zIndex = zIndex;

        memory = await Memory.findByIdAndUpdate(
            req.params.id,
            { $set: memoryFields },
            { new: true }
        );

        res.json(memory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/memories/:id
// @desc    Delete a memory
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let memory = await Memory.findById(req.params.id);

        if (!memory) return res.status(404).json({ msg: 'Memory not found' });

        // Ensure user owns memory
        if (memory.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Memory.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Memory removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
