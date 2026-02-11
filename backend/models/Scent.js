const mongoose = require('mongoose');

const ScentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Perfume', 'Cologne', 'Candle', 'Oil', 'Other'],
        default: 'Perfume'
    },
    notes: {
        type: [String], // Array of strings for notes (e.g. "Sandalwood", "Bergamot")
        default: []
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    image: {
        type: String, // URL to image
        default: ''
    },
    season: {
        type: String,
        enum: ['Spring', 'Summer', 'Autumn', 'Winter', 'All'],
        default: 'All'
    },
    myCollection: {
        type: Boolean,
        default: true
    },
    wishlist: {
        type: Boolean,
        default: false
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    // Detailed Fields
    description: {
        type: String,
        default: ''
    },
    accords: {
        type: Map,
        of: Number, // e.g., "Floral": 95, "Woody": 45
        default: {}
    },
    longevity: {
        type: String, // e.g. "8.5/10" or "Moderate"
        default: ''
    },
    sillage: {
        type: String, // e.g. "Moderate", "Strong"
        default: ''
    },
    pyramid: {
        top: [String],
        middle: [String],
        base: [String]
    },
    journals: [{
        user: String, // Name of user (e.g. "Felix", "Aria")
        text: String,
        date: Date
    }]
});

module.exports = mongoose.model('Scent', ScentSchema);
