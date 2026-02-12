const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['photo', 'note', 'sticker', 'voice', 'quote'],
        required: true
    },
    content: {
        type: String, // URL for photo/sticker/voice, text for note/quote
        required: true
    },
    style: {
        backgroundColor: String,
        fontFamily: String,
        textColor: String,
        stickerCategory: String // for stickers: 'love', 'travel', etc.
    },
    metadata: {
        duration: Number, // for voice notes
        location: String,
        date: Date
    },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    },
    rotation: {
        type: Number,
        default: 0
    },
    scale: {
        type: Number,
        default: 1
    },
    zIndex: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for performance
MemorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Memory', MemorySchema);
