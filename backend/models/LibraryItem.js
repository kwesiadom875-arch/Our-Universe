const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    content: { type: String, required: true },
    page: { type: Number },
    type: { type: String, enum: ['note', 'quote', 'thought'], default: 'note' },
    isPrivate: { type: Boolean, default: false },
    mentions: [{ type: String }], // Character names referenced via @mention
    date: { type: Date, default: Date.now }
});

const CharacterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    role: { type: String } // e.g. Protagonist, Villain
});

const LibraryItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    googleBookId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    authors: [String],
    thumbnail: String,
    pageCount: Number,
    description: String,

    status: {
        type: String,
        enum: ['Reading', 'Finished', 'TBR', 'Dropped'],
        default: 'Reading'
    },
    currentPage: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    startDate: Date,
    finishDate: Date,

    isPrivate: {
        type: Boolean,
        default: false
    },

    notes: [NoteSchema],
    characters: [CharacterSchema],

    // New fields for EPUB & Decor
    fileUrl: { type: String }, // Path to uploaded EPUB
    format: { type: String, enum: ['physical', 'ebook', 'audiobook'], default: 'physical' },
    decor: [{
        type: { type: String, enum: ['plant', 'candle', 'frame', 'crystal'] },
        x: Number // Percentage from left (0-100)
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Composite index to prevent duplicate books per user
LibraryItemSchema.index({ user: 1, googleBookId: 1 }, { unique: true });

// Index for getting a user's library items sorted by newest first
LibraryItemSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('LibraryItem', LibraryItemSchema);
