const express = require('express');
const router = express.Router();
const DailyGoal = require('../models/DailyGoal');
const dailyTasks = [
    {
        task: "Talk for 10 minutes with parents or someone you love.",
        why: "Talking with loved ones builds emotional connection and reduces stress hormones like cortisol.",
    },
    {
        task: "Spend 20 minutes talking with a good friend.",
        why: "Meaningful conversations improve mood and reduce feelings of loneliness.",
    },
    {
        task: "Write 3 things you are thankful for today.",
        why: "Practicing gratitude enhances overall happiness and rewires your brain for positivity.",
    },
    {
        task: "Do 10 minutes of deep breathing or meditation.",
        why: "Calms your nervous system, lowers anxiety, and improves emotional regulation.",
    },
    {
        task: "Stretch or do light yoga for 15 minutes.",
        why: "Increases body awareness and releases muscle tension which improves mental clarity.",
    },
    {
        task: "Listen to 2 favorite songs and notice how you feel.",
        why: "Music stimulates dopamine release and helps process emotions.",
    },
    {
        task: "Go for a 10-minute walk outside and look around.",
        why: "Exposure to nature lowers cortisol levels and improves mood and focus.",
    },
    {
        task: "Write 5 positive things about yourself.",
        why: "Boosts self-esteem and reduces negative self-talk patterns.",
    },
    {
        task: "Read something inspiring for 10-15 minutes.",
        why: "Uplifting content helps shift your mindset and cultivates hope.",
    },
    {
        task: "Take 5 minutes to imagine your best future self.",
        why: "Future visualization increases motivation and long-term goal commitment.",
    },
    {
        task: "Have at least 1 hour with no screens or social media.",
        why: "Reduces information overload and improves mental presence and attention span.",
    },
    {
        task: "Draw anything you like most.",
        why: "Creative expression allows emotional release and reduces anxiety.",
    },
    {
        task: "Have tea or coffee quietly without phone or TV.",
        why: "Mindful sipping encourages relaxation and increases present-moment awareness.",
    },
    {
        task: "Watch a short funny video for 10 minutes.",
        why: "Laughter reduces stress and increases serotonin production.",
    },
    {
        task: "Write down your biggest worry and 1 small solution.",
        why: "Externalizing worry and identifying action steps reduces overwhelm.",
    },
    {
        task: "Spend 10 minutes visualizing success.",
        why: "Mental rehearsal strengthens confidence and improves goal outcomes.",
    },
    {
        task: "Look at old happy photos for 10 minutes.",
        why: "Triggers positive memories and enhances your sense of well-being.",
    },
    {
        task: "Write freely about your thoughts for 10 minutes.",
        why: "Journaling helps organize thoughts and reduce emotional clutter.",
    },
    {
        task: "Stand in sunlight for 5 minutes.",
        why: "Boosts vitamin D, regulates mood, and resets circadian rhythms.",
    },
    {
        task: "Have a cold water bath for 10 minutes.",
        why: "Cold exposure increases alertness and reduces stress by activating endorphins.",
    },
    {
        task: "Write where you wish to be in five years for 10 minutes.",
        why: "Goal setting gives direction and fosters long-term motivation.",
    },
];

// Get or create daily goal for user
router.get('/:userId', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let goal = await DailyGoal.findOne({ userId: req.params.userId });

        if (!goal) {
            // Initialize new user's daily goals
            goal = new DailyGoal({
                userId: req.params.userId,
                currentTaskIndex: 0,
                streak: 0,
                lastShownDate: today
            });
            await goal.save();
        } else {
            // Check if we need to rotate to next task (after 24 hours)
            if (goal.lastShownDate !== today) {
                goal.currentTaskIndex = (goal.currentTaskIndex + 1) % dailyTasks.length;
                goal.lastShownDate = today;
                await goal.save();
            }
        }

        res.json({
            currentTaskIndex: goal.currentTaskIndex,
            streak: goal.streak,
            lastCompletedDate: goal.lastCompletedDate,
            isCompletedToday: goal.lastCompletedDate === today
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update completed task
router.post('/:userId/complete', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const goal = await DailyGoal.findOne({ userId: req.params.userId });

        if (!goal) {
            return res.status(404).json({ error: "User goal not found" });
        }

        // Prevent duplicate completions
        if (goal.lastCompletedDate === today) {
            return res.json({
                success: true,
                streak: goal.streak,
                alreadyCompleted: true
            });
        }

        // Calculate streak
        let streak = 1;
        if (goal.lastCompletedDate) {
            const lastDate = new Date(goal.lastCompletedDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                streak = goal.streak + 1;
            }
        }

        // Update goal
        goal.streak = streak;
        goal.lastCompletedDate = today;
        await goal.save();

        res.json({
            success: true,
            streak: streak
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;