const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // "HH:mm"
    },
    endTime: {
        type: String, // "HH:mm"
    },
    type: {
        type: String, // 'Date', 'Work', 'Trip', 'Other'
        default: 'Other'
    },
    attendees: {
        type: String, // 'Me', 'Partner', 'Both'
        default: 'Me'
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for frequent queries (Get events by user, sorted by date)
EventSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Event', EventSchema);
