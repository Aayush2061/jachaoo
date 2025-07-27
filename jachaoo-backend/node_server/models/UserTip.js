const mongoose = require('mongoose');

const userTipSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    lastTipDate: { type: Date },
    notificationTime: { type: String, default: '09:00' }, // Default to 9 AM
    enabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('UserTip', userTipSchema);