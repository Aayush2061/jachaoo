// models/MentalHealthData.js
const mongoose = require('mongoose');

const mentalHealthDataSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    diagnosed: {
        type: String,
        enum: ['Yes', 'No', 'I\'m not sure'],
        required: true
    },
    support: {
        type: String,
        enum: ['Therapy', 'Medication', 'Both', 'No', null],
        default: null
    },
    frequency: {
        type: String,
        enum: ['Every day', 'Sometimes', 'Rarely', 'Not really'],
        required: true
    },
    goals: {
        type: [String],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MentalHealthData', mentalHealthDataSchema);