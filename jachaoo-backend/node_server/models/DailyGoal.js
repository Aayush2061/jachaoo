const mongoose = require('mongoose');

const dailyGoalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    currentTaskIndex: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    lastCompletedDate: {
        type: String // Store as YYYY-MM-DD
    },
    lastShownDate: {
        type: String, // Store as YYYY-MM-DD
        default: new Date().toISOString().split('T')[0]
    }
});

module.exports = mongoose.model('DailyGoal', dailyGoalSchema);