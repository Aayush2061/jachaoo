const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodPressure: { type: String, enum: ['Yes', 'No', "Don't know"], required: true },
    diabetes: { type: String, enum: ['Yes', 'No', "Don't know"], required: true },
    smoker: { type: String, enum: ['Yes', 'No', "Don't know"], required: true },
}, { timestamps: true });

module.exports = mongoose.model('HealthData', healthDataSchema);