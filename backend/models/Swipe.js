const mongoose = require('mongoose');

const SwipeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdbId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    posterPath: {
        type: String
    },
    action: {
        type: String, // 'like' or 'pass'
        required: true,
        enum: ['like', 'pass']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Swipe', SwipeSchema);
