const express = require('express');
const router = express.Router();
const HealthData = require('../models/HealthData');

// Save health data
router.post('/', async (req, res) => {
    try {
        const { userId, name, age, sex, bloodPressure, diabetes, smoker } = req.body;

        let healthData = await HealthData.findOne({ userId });

        if (healthData) {
            // Update existing data
            healthData = await HealthData.findOneAndUpdate(
                { userId },
                { name, age, sex, bloodPressure, diabetes, smoker },
                { new: true }
            );
        } else {
            // Create new data
            healthData = new HealthData({
                userId,
                name,
                age,
                sex,
                bloodPressure,
                diabetes,
                smoker
            });
            await healthData.save();
        }

        res.json(healthData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get health data by user ID
router.get('/:userId', async (req, res) => {
    try {
        const healthData = await HealthData.findOne({ userId: req.params.userId });
        res.json(healthData || {});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;