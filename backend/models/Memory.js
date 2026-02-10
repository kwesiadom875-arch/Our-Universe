const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['photo', 'note', 'sticker'],
        required: true
    },
    content: {
        type: String, // URL for photo/sticker, text for note
        required: true
    },
    style: {
        backgroundColor: String,
        fontFamily: String,
        textColor: String,
        stickerCategory: String // for stickers: 'love', 'travel', etc.
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

module.exports = mongoose.model('Memory', MemorySchema);
