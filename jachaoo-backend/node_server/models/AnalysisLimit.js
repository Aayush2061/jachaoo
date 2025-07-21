// models/AnalysisLimit.js
const mongoose = require('mongoose');

const analysisLimitSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        required: true,
        default: 0
    },
    lastAnalysisDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('AnalysisLimit', analysisLimitSchema);