// routes/periodData.js
const express = require('express');
const router = express.Router();
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const PeriodData = require('../models/PeriodData');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose')

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

// Rate limiting for symptom updates
const symptomUpdateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each user to 20 symptom updates per window
    handler: (req, res) => {  // Changed from 'message' to 'handler'
        res.status(429).json({
            error: 'Too many requests',
            message: 'Too many symptom updates, please try again later'
        });
    }
});

// Audit log schema
const symptomAuditSchema = new mongoose.Schema({
    userId: String,
    oldSymptoms: [String],
    newSymptoms: [String],
    updatedAt: { type: Date, default: Date.now }
});
const SymptomAudit = mongoose.model('SymptomAudit', symptomAuditSchema);

router.patch('/:userId', ClerkExpressRequireAuth(), symptomUpdateLimiter, async (req, res) => {
    try {
        // 1. Input Validation
        if (!req.body.symptoms || !Array.isArray(req.body.symptoms)) {
            return res.status(400).json({
                error: 'Invalid input',
                details: 'Symptoms must be provided as an array'
            });
        }

        // 2. Deduplication and Cleaning
        const uniqueSymptoms = [...new Set(req.body.symptoms
            .map(s => s.trim())
            .filter(s => s.length > 0)
        )];

        // 3. Maximum Limit Check (configurable)
        // const MAX_SYMPTOMS = 15;
        // if (uniqueSymptoms.length > MAX_SYMPTOMS) {
        //     return res.status(400).json({
        //         error: 'Limit exceeded',
        //         details: `Maximum ${MAX_SYMPTOMS} symptoms allowed`
        //     });
        // }

        // 4. Get existing data for audit
        const existingData = await PeriodData.findOne({ userId: req.params.userId });
        const oldSymptoms = existingData?.symptoms || [];

        // 5. Update with validation
        const updatedData = await PeriodData.findOneAndUpdate(
            { userId: req.params.userId },
            {
                $set: {
                    symptoms: uniqueSymptoms,
                    lastUpdated: new Date()
                }
            },
            {
                new: true,
                runValidators: true,
                upsert: true
            }
        );

        // 6. Create audit log
        await SymptomAudit.create({
            userId: req.params.userId,
            oldSymptoms,
            newSymptoms: uniqueSymptoms
        });

        // 7. Success response
        res.json({
            success: true,
            symptoms: updatedData.symptoms,
            changes: {
                added: uniqueSymptoms.filter(s => !oldSymptoms.includes(s)),
                removed: oldSymptoms.filter(s => !uniqueSymptoms.includes(s))
            }
        });

    } catch (error) {
        console.error('PATCH error:', error);

        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.message
            });
        }

        res.status(500).json({
            error: 'Failed to update symptoms',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;