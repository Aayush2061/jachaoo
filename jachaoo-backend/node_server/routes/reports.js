const express = require('express');
const router = express.Router();
const MedicalReport = require('../models/MedicalReport');

// Create report record
// In routes/reports.js - Update the POST endpoint
// In routes/reports.js
router.post('/', async (req, res) => {
    try {
        const { cloudinaryId, url, analysis } = req.body;

        // Validate required fields
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const report = new MedicalReport({
            userId: req.auth.userId,
            cloudinaryId: cloudinaryId || "default-id", // Provide fallback
            url,
            analysis: analysis || null,
            createdAt: new Date()
        });

        await report.save();
        console.log("Report saved to DB:", report);
        res.status(201).json(report);
    } catch (err) {
        console.error("Error saving report:", err);
        res.status(400).json({
            error: err.message,
            details: err.errors // Mongoose validation errors if any
        });
    }
});

// Get user's reports (updated with sorting)
router.get('/', async (req, res) => {
    try {
        const reports = await MedicalReport.find({ userId: req.auth.userId })
            .sort({ createdAt: -1 }); // Newest first
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single report
router.get('/:id', async (req, res) => {
    try {
        const report = await MedicalReport.findOne({
            _id: req.params.id,
            userId: req.auth.userId
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete report
router.delete('/:id', async (req, res) => {
    try {
        const report = await MedicalReport.findOneAndDelete({
            _id: req.params.id,
            userId: req.auth.userId
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// In your reports.js router
router.patch('/:id/analysis', async (req, res) => {
    try {
        const report = await MedicalReport.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.auth.userId
            },
            {
                $set: {
                    analysis: req.body.analysis,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;