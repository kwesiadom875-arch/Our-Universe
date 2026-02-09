const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    subject: {
        type: String,
        required: true
    },
    startTime: {
        type: String, // Format: "HH:mm" (24h)
        required: true
    },
    endTime: {
        type: String, // Format: "HH:mm" (24h)
        required: true
    },
    location: {
        type: String,
        default: ''
    },
    type: {
        type: String, // 'Class', 'Exam', 'Extracurricular', 'Date'
        default: 'Class'
    },
    attendees: {
        type: String, // 'Me', 'Partner', 'Both'
        default: 'Me'
    },
    repeatWeekly: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: '#FF8FA3' // Default pink
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Timetable', TimetableSchema);
