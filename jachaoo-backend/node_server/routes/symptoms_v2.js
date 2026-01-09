const express = require('express');
const router = express.Router();
const { createRateLimiter, incrementRateLimit } = require('../middleware/rateLimiter');

router.post('/start',
    createRateLimiter('symptomAnalysis'), // Check limit before processing
    async (req, res, next) => {
        try {
            const {
                sex,
                age,
                weight,
                diabetes,
                blood_pressure,
                illnesses,
                other_illness,
                smoker
            } = req.body;


            // Validate required fields
            if (!sex || !age || !weight || diabetes === undefined || blood_pressure === undefined || smoker === undefined) {
                return res.status(400).json({
                    error: "Sex, age, weight, diabetes, blood pressure, and smoker status are required"
                });
            }
            // Forward to Flask backend
            const flaskResponse = await fetch(`${process.env.FLASK_API_URL}/v2/symptoms/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sex,
                    age,
                    weight,
                    diabetes,
                    blood_pressure,
                    illnesses: illnesses || [],
                    other_illness: other_illness || "",
                    smoker
                })
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