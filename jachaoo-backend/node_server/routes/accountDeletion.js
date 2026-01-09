const express = require('express');
const router = express.Router();
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const mongoose = require('mongoose');

// Import all your models
const HealthData = require('../models/HealthData');
const MedicalReport = require('../models/MedicalReport');
const PeriodData = require('../models/PeriodData');
const MentalHealthData = require('../models/MentalHealthData');
const AnalysisLimit = require('../models/AnalysisLimit');
const DailyGoal = require('../models/DailyGoal');
const UserTip = require('../models/UserTip');

// Delete user account and all associated data
router.delete('/', ClerkExpressRequireAuth(), async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const userId = req.auth.userId;

            // 1. Delete user data from all collections
            await Promise.all([
                HealthData.deleteOne({ userId }).session(session),
                MedicalReport.deleteMany({ userId }).session(session),
                PeriodData.deleteOne({ userId }).session(session),
                MentalHealthData.deleteOne({ userId }).session(session),
                AnalysisLimit.deleteOne({ userId }).session(session),
                DailyGoal.deleteOne({ userId }).session(session),
                UserTip.deleteOne({ userId }).session(session)
            ]);

            // 2. Delete user from Clerk using the direct API call
            const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Failed to delete user from Clerk: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
            }

            res.json({
                message: 'Account and all associated data deleted successfully',
                success: true
            });
        });
    } catch (error) {
        console.error('Error deleting account:', error);

        // More specific error handling
        if (error.message.includes('404')) {
            return res.status(404).json({
                error: 'User not found in authentication system'
            });
        }

        res.status(500).json({
            error: 'Failed to delete account',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        await session.endSession();
    }
});

module.exports = router;