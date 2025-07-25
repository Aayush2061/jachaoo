// routes/mentalHealthChat.js
const express = require('express');
const router = express.Router();
const { createRateLimiter, incrementRateLimit } = require('../middleware/rateLimiter');
const MAX_MESSAGE_LENGTH = 300;

router.post(
    '/',
    createRateLimiter("mentalHealthChat"), // Apply rate limiting (15 messages/day like menstrual chat)
    async (req, res) => {
        try {
            const { message, chat_history, user_context } = req.body;

            // Validate message length (matches frontend limit)
            if (message.length > MAX_MESSAGE_LENGTH) {
                return res.status(400).json({
                    error: "Message exceeds maximum length"
                });
            }

            // Forward to Flask API
            const flaskResponse = await fetch(`${process.env.FLASK_API_URL}/mental-chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization // Pass through auth
                },
                body: JSON.stringify({
                    message,
                    chat_history,
                    user_context: {
                        diagnosed: user_context.diagnosed,
                        support: user_context.support,
                        frequency: user_context.frequency,
                        goals: user_context.goals
                    }
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