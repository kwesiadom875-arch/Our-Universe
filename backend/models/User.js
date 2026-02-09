const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    theme: {
        primaryColor: { type: String, default: '#ff8FA3' }, // Default pink/cute
        accentColor: { type: String, default: '#ffccd5' },
        font: { type: String, default: 'Inter' },
        headerBackground: { type: String, default: 'default-header.jpg' }
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    dateJoined: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
