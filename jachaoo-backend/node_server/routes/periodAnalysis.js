const express = require('express');
const router = express.Router();
const { createRateLimiter, incrementRateLimit } = require('../middleware/rateLimiter');

router.post(
    '/',
    createRateLimiter("periodAnalysis"), // Apply rate limiting
    async (req, res) => {
        try {
            const requestData = req.body;

            // Forward to Flask
            const flaskResponse = await fetch(`${process.env.FLASK_API_URL}/daily-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization
                },
                body: JSON.stringify(requestData),
            });

            if (!flaskResponse.ok) {
                const error = await flaskResponse.json();
                throw new Error(error.message || 'Analysis request failed');
            }

            const data = await flaskResponse.json();

            // Only increment count if successful
            await incrementRateLimit(req, res, () => { });

            res.json(data);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);

module.exports = router;