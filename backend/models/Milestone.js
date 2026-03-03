const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    icon: {
        type: String,
        default: 'Heart' // Default icon name
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for frequent queries: fetching milestones for user1/user2 sorted by date
MilestoneSchema.index({ user1: 1, date: 1 });
MilestoneSchema.index({ user2: 1, date: 1 });

module.exports = mongoose.model('Milestone', MilestoneSchema);
