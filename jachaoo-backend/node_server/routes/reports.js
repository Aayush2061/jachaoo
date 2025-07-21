const express = require('express');
const router = express.Router();
const MedicalReport = require('../models/MedicalReport');
const { deleteFromCloudinary } = require('../utils/cloudinary')
const AnalysisLimit = require('../models/AnalysisLimit');
const MAX_DAILY_ANALYSES = 2;

// Helper function to check and update analysis count
async function checkAnalysisLimit(userId) {
    // Get current date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let limitRecord = await AnalysisLimit.findOne({ userId });

    // If no record exists or it's a new day, reset the count
    if (!limitRecord || limitRecord.lastAnalysisDate < today) {
        limitRecord = await AnalysisLimit.findOneAndUpdate(
            { userId },
            {
                count: 0,
                lastAnalysisDate: new Date()
            },
            {
                upsert: true,
                new: true
            }
        );
    }

    // Check if user has exceeded daily limit
    if (limitRecord.count >= MAX_DAILY_ANALYSES) {
        return false;
    }

    // Increment the count
    await AnalysisLimit.updateOne(
        { userId },
        { $inc: { count: 1 } }
    );

    return true;
}

router.post('/', async (req, res) => {
    try {
        // Check analysis limit first
        const canAnalyze = await checkAnalysisLimit(req.auth.userId);

        if (!canAnalyze) {
            return res.status(429).json({
                error: {
                    message: `You've reached your daily limit of ${MAX_DAILY_ANALYSES} report analyses. Please try again tomorrow.`,
                    limit: MAX_DAILY_ANALYSES
                }
            });
        }

        const { cloudinaryId, url, analysis, reportName, labName } = req.body;

        // Validate required fields
        if (!url || !reportName || !labName) {
            return res.status(400).json({
                error: "URL, report name, and lab name are required"
            });
        }

        const report = new MedicalReport({
            userId: req.auth.userId,
            cloudinaryId: cloudinaryId || "default-id",
            url,
            reportName,
            labName,
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
            details: err.errors
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
        // 1. Find the report first
        const report = await MedicalReport.findOne({
            _id: req.params.id,
            userId: req.auth.userId
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // 2. Delete from Cloudinary (with enhanced logging)
        console.log(`Starting deletion process for report ${report._id}`);
        console.log(`Cloudinary ID: ${report.cloudinaryId}`);

        let cloudinaryDeleted = false;
        if (report.cloudinaryId && report.cloudinaryId !== 'default-id') {
            cloudinaryDeleted = await deleteFromCloudinary(report.cloudinaryId);
            console.log(`Cloudinary deletion ${cloudinaryDeleted ? 'succeeded' : 'failed'}`);
        } else {
            console.log('Skipping Cloudinary deletion - no valid cloudinaryId');
            cloudinaryDeleted = true;
        }

        // 3. Delete from database
        await MedicalReport.deleteOne({ _id: req.params.id });
        console.log(`Successfully deleted report ${req.params.id} from database`);

        res.json({
            message: 'Report deleted successfully',
            cloudinaryDeleted
        });
    } catch (err) {
        console.error('Error deleting report:', {
            error: err.message,
            stack: err.stack,
            params: req.params
        });
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