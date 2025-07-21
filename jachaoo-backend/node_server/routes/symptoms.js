const express = require('express');
const router = express.Router();
const { createRateLimiter, incrementRateLimit } = require('../middleware/rateLimiter');

router.post('/start',
    createRateLimiter('symptomAnalysis'), // Check limit before processing
    async (req, res, next) => {
        try {
            const { smoker, diabetes, blood_pressure } = req.body;

            // Validate required fields
            if (smoker === undefined || diabetes === undefined || blood_pressure === undefined) {
                return res.status(400).json({
                    error: "Smoker, diabetes, and blood pressure status are required"
                });
            }

            // Forward to Flask backend
            const flaskResponse = await fetch(`${process.env.FLASK_API_URL}/symptoms/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ smoker, diabetes, blood_pressure })
            });

            const data = await flaskResponse.json();

            if (!flaskResponse.ok) {
                throw new Error(data.message || 'Symptom analysis failed');
            }

            req.symptomData = data; // Attach to request for next middleware
            next(); // Proceed to increment count
        } catch (err) {
            next(err);
        }
    },
    incrementRateLimit, // Only increment count if successful
    (req, res) => {
        // Final response handler
        res.json(req.symptomData);
    }
);

// Error handling middleware for this router
router.use((err, req, res, next) => {
    console.error("Error in symptom analysis:", err);
    res.status(500).json({ error: err.message });
});

module.exports = router;