const express = require('express');
const router = express.Router();
const healthTips = require('../data/health_tips.json');
const UserTip = require('../models/UserTip');

// Get a random health tip
router.get('/random', async (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * healthTips.length);
        const tip = healthTips[randomIndex];
        res.json(tip);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching health tip' });
    }
});

// Get all tips (for future use)
router.get('/', async (req, res) => {
    res.json(healthTips);
});

module.exports = router;