// routes/firstAid.js
const express = require("express");
const router = express.Router();
const { createRateLimiter, incrementRateLimit } = require("../middleware/rateLimiter");
const MAX_MESSAGE_LENGTH = 300

router.post(
    '/',
    createRateLimiter("firstAidMessage"),  // 👈 Apply rate limiting
    async (req, res) => {
        try {
            const { message } = req.body;

            if (message.length > MAX_MESSAGE_LENGTH) { // Match frontend limit
                return res.status(400).json({
                    error: "Message exceeds maximum length"
                });
            }

            // Forward to Flask (your existing Gemini API)
            const flaskResponse = await fetch(`${process.env.FLASK_API_URL}/firstaid`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            if (!flaskResponse.ok) throw new Error("Flask request failed");

            const data = await flaskResponse.json();

            // Only increment count if Flask succeeds
            await incrementRateLimit(req, res, () => { });

            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;