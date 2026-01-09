// routes/mentalHealth.js
const express = require('express');
const router = express.Router();
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const MentalHealthData = require('../models/MentalHealthData');

// Check if user has completed onboarding
router.get('/:userId', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const mentalHealthData = await MentalHealthData.findOne({
            userId: req.params.userId
        });
        res.json(mentalHealthData || { exists: false });
    } catch (error) {
        console.error('Error fetching mental health data:', error);
        res.status(500).json({ error: 'Failed to fetch mental health data' });
    }
});

// Save onboarding data
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const { userId, answers } = req.body;

        const mentalHealthData = await MentalHealthData.findOneAndUpdate(
            { userId },
            {
                diagnosed: answers.diagnosed,
                support: answers.support,
                frequency: answers.frequency,
                goals: answers.goals,
                updatedAt: new Date()
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        res.json(mentalHealthData);
    } catch (error) {
        console.error('Error saving mental health data:', error);
        res.status(500).json({
            error: 'Failed to save mental health data',
            details: error.message
        });
    }
});

module.exports = router;