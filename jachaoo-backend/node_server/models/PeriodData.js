// models/PeriodData.js
const mongoose = require('mongoose');

const periodDataSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    lastPeriodDate: Date,
    duration: Number,
    cycleLength: Number,
    symptoms: [String],
    appearance: String,
    conditions: [String],
    contraceptive: String,
    tryingToConceive: String,
    mainConcern: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PeriodData', periodDataSchema);