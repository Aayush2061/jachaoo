const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    cloudinaryId: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                // Basic Cloudinary ID format validation
                return /^[a-zA-Z0-9_\/\-]+$/.test(v);
            },
            message: props => `${props.value} is not a valid Cloudinary ID!`
        }
    },
    url: { type: String, required: true },
    reportName: { type: String, required: true }, // Add this
    labName: { type: String, required: true }, // Add this
    analysis: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalReport', reportSchema);