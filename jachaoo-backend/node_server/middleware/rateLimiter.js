// middleware/rateLimiter.js
const AnalysisLimit = require('../models/AnalysisLimit');

const createRateLimiter = (type) => {
    const limits = {
        reportAnalysis: 2,  // 2 report analyses per day
        symptomAnalysis: 5,  // 5 symptom analyses per day
        firstAidMessage: 15
    };

    return async (req, res, next) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            let limitRecord = await AnalysisLimit.findOne({ userId: req.auth.userId });

            // Reset counts if new day or no record exists
            if (!limitRecord || limitRecord.lastAnalysisDate < today) {
                limitRecord = await AnalysisLimit.findOneAndUpdate(
                    { userId: req.auth.userId },
                    {
                        reportAnalysisCount: 0,
                        symptomAnalysisCount: 0,
                        lastAnalysisDate: new Date()
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );
            }

            // Check the specific limit
            const countField = `${type}Count`;
            const currentCount = limitRecord[countField] || 0;
            const maxLimit = limits[type];

            if (currentCount >= maxLimit) {
                return res.status(429).json({
                    error: {
                        message: `You've reached your daily limit of ${maxLimit} ${type.replace('Analysis', '')} analyses. Please try again tomorrow.`,
                        limit: maxLimit
                    }
                });
            }

            // Attach limit info to the request for potential use
            req.rateLimitInfo = {
                type,
                current: currentCount,
                limit: maxLimit,
                remaining: maxLimit - currentCount - 1
            };

            next();
        } catch (err) {
            console.error("Rate limiter error:", err);
            // Fail open - allow the request if rate limiting fails
            next();
        }
    };
};

// Middleware to increment the count after successful operation
const incrementRateLimit = async (req, res, next) => {
    if (!req.rateLimitInfo) return next();

    try {
        await AnalysisLimit.updateOne(
            { userId: req.auth.userId },
            { $inc: { [`${req.rateLimitInfo.type}Count`]: 1 } }
        );
        next();
    } catch (err) {
        console.error("Failed to increment rate limit:", err);
        next();
    }
};

module.exports = {
    createRateLimiter,
    incrementRateLimit
};