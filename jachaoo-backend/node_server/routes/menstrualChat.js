const express = require('express');
const router = express.Router();
const { createRateLimiter, incrementRateLimit } = require('../middleware/rateLimiter');

router.post(
    '/',
    createRateLimiter("menstrualChat"), // Apply rate limiting
    async (req, res) => {
        try {
            const { message, chat_history, user_context } = req.body;

            // Forward to Flask
            const flaskResponse = await fetch(`${process.env.FLASK_API_URL}/menstrual-chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization // Pass through auth
                },
                body: JSON.stringify({
                    message,
                    chat_history,
                    user_context
                })
            });

            if (!flaskResponse.ok) {
                const error = await flaskResponse.json();
                throw new Error(error.message || 'Flask request failed');
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