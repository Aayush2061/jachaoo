const express = require('express');
const router = express.Router();
const MedicalReport = require('../models/MedicalReport');

// Create report record
router.post('/', async (req, res) => {
    try {
        const { cloudinaryId, url } = req.body;

        const report = new MedicalReport({
            userId: req.auth.userId, // This comes from Clerk middleware
            cloudinaryId,
            url
        });

        await report.save();
        res.status(201).json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get user's reports
router.get('/', async (req, res) => {
    try {
        const reports = await MedicalReport.find({ userId: req.auth.userId });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;