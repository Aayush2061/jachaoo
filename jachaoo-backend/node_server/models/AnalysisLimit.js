// models/AnalysisLimit.js
const mongoose = require('mongoose');

const analysisLimitSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    reportAnalysisCount: {
        type: Number,
        required: true,
        default: 0
    },
    symptomAnalysisCount: {
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