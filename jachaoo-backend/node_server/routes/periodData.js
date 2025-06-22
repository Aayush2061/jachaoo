// routes/periodData.js
const express = require('express');
const router = express.Router();
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const PeriodData = require('../models/PeriodData');

// Middleware to check if user has period data
router.get('/:userId', ClerkExpressRequireAuth(), async (req, res) => {
    console.log('Request received from Clerk user:', req.auth.userId); // 🔍 Add this

    try {
        const periodData = await PeriodData.findOne({ userId: req.params.userId });
        res.json(periodData || { exists: false });
    } catch (error) {
        console.error('Error fetching period data:', error);
        res.status(500).json({ error: 'Failed to fetch period data' });
    }
});


// Create or update period data
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        console.log('Received data:', req.body); // Log incoming data
        const { userId, ...data } = req.body;

        const periodData = await PeriodData.findOneAndUpdate(
            { userId },
            data,
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log('Saved data:', periodData); // Log saved data
        res.json(periodData);
    } catch (error) {
        console.error('Detailed error:', error); // More detailed error logging
        res.status(500).json({
            error: 'Failed to save period data',
            details: error.message
        });
    }
});

module.exports = router;