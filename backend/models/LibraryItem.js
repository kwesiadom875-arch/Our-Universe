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

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LibraryItem', LibraryItemSchema);
