const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    cloudinaryId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    reportName: { type: String, required: true }, // Add this
    labName: { type: String, required: true }, // Add this
    analysis: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalReport', reportSchema);