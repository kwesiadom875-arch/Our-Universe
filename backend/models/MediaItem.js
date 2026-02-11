const mongoose = require('mongoose');

const MediaItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdbId: {
        type: Number,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['movie', 'tv'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    posterPath: {
        type: String
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

// Composite index to prevent duplicates per user
MediaItemSchema.index({ user: 1, tmdbId: 1, mediaType: 1 }, { unique: true });

module.exports = mongoose.model('MediaItem', MediaItemSchema);
