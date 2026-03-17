const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Milestone = require('../models/Milestone');
const User = require('../models/User');

// @route   GET api/milestones
// @desc    Get all milestones for user and partner
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('partnerId').lean(); // ⚡ Bolt: Fetch only partnerId with .lean() to reduce DB transfer load and memory usage

        let query = { $or: [{ user1: req.user.id }, { user2: req.user.id }] };

        if (user.partnerId) {
            query = {
                $or: [
                    { user1: req.user.id },
                    { user2: req.user.id },
                    { user1: user.partnerId },
                    { user2: user.partnerId }
                ]
            };
        }

        const milestones = await Milestone.find(query).sort({ date: 1 });
        res.json(milestones);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/milestones
// @desc    Add a new milestone
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, date, icon, description } = req.body;

    try {
        const user = await User.findById(req.user.id).select('partnerId').lean(); // ⚡ Bolt: Fetch only partnerId with .lean() to reduce DB transfer load and memory usage

        const newMilestone = new Milestone({
            user1: req.user.id,
            user2: user.partnerId || null,
            title,
            date,
            icon,
            description
        });

        const milestone = await newMilestone.save();
        res.json(milestone);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/milestones/:id
// @desc    Delete milestone
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const milestone = await Milestone.findById(req.params.id);

        if (!milestone) {
            return res.status(404).json({ msg: 'Milestone not found' });
        }

        // Check user
        if (milestone.user1.toString() !== req.user.id &&
            (!milestone.user2 || milestone.user2.toString() !== req.user.id)) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await milestone.remove();
        res.json({ msg: 'Milestone removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
