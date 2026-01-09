const express = require('express');
const router = express.Router();
const healthTips = require('../data/health_tips.json');
const UserTip = require('../models/UserTip');

// Simple in-memory cache that resets daily
const dailyTipCache = new Map();

// Get a random health tip that persists for the day
router.get('/random', async (req, res) => {
    try {
        const today = new Date().toDateString();
        const userId = req.auth?.userId || 'anonymous';

        // Check if we already have a tip for this user today
        if (dailyTipCache.has(`${userId}-${today}`)) {
            return res.json(dailyTipCache.get(`${userId}-${today}`));
        }

        // Get a random tip
        const randomIndex = Math.floor(Math.random() * healthTips.length);
        const tip = healthTips[randomIndex];

        // Store in cache
        dailyTipCache.set(`${userId}-${today}`, tip);

        res.json(tip);
    } catch (error) {
        console.error('Error fetching health tip:', error);
        res.status(500).json({ message: 'Error fetching health tip' });
    }
});

module.exports = router;