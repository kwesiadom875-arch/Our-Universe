const mongoose = require('mongoose');

const SwipeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdbId: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['movie', 'tv'],
        default: 'movie'
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

// Compound index to prevent duplicate swipes for the same item by the same user
// Note: Currently assumes tmdbId is unique enough or handled by app logic, but enforces DB integrity
SwipeSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

// Compound index to speed up matching queries (finding others who liked the same content)
SwipeSchema.index({ tmdbId: 1, action: 1 });

module.exports = mongoose.model('Swipe', SwipeSchema);
