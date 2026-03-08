const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Timetable = require('../models/Timetable');

// @route   GET api/timetable
// @desc    Get all classes for logged in user and partner
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Optimize: Use .select('partnerId').lean() to avoid fetching entire User document
        const user = await require('../models/User').findById(req.user.id).select('partnerId').lean();
        const userIds = [req.user.id];
        if (user.partnerId) {
            userIds.push(user.partnerId);
        }

        // Sort by day and start time could be complex, for now just return all
        const classes = await Timetable.find({ user: { $in: userIds } });
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/timetable
// @desc    Add a new class
// @access  Private
router.post('/', auth, async (req, res) => {
    const { day, subject, startTime, endTime, location, type, attendees, color } = req.body;

    try {
        const newClass = new Timetable({
            user: req.user.id,
            day,
            subject,
            startTime,
            endTime,
            location,
            type,
            attendees,
            color
        });

        const savedClass = await newClass.save();
        res.json(savedClass);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/timetable/:id
// @desc    Delete a class
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let timetableClass = await Timetable.findById(req.params.id);

        if (!timetableClass) return res.status(404).json({ msg: 'Class not found' });

        // Make sure user owns class
        if (timetableClass.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Timetable.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Class removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
