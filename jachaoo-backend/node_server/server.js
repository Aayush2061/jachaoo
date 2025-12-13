require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ClerkExpressRequireAuth, ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node'); // Correct import
const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(ClerkExpressWithAuth());


// Initialize Clerk
const clerkMiddleware = ClerkExpressRequireAuth();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const healthDataRouter = require('./routes/healthData');
const reportsRouter = require('./routes/reports');
const periodDataRouter = require('./routes/periodData');
const mentalHealthRouter = require('./routes/mentalHealth');
const symptomsRouter = require('./routes/symptoms');
const symptomsRouterV2 = require('./routes/symptoms_v2');
const firstAidRouter = require('./routes/firstAid');
const menstrualChatRouter = require('./routes/menstrualChat');
const periodAnalysisRouter = require('./routes/periodAnalysis');
const dailyGoalsRouter = require('./routes/dailyGoals');
const mentalHealthChatRouter = require('./routes/mentalHealthChat');
const healthTipsRouter = require('./routes/healthTips');
const accountDeletionRouter = require('./routes/accountDeletion');

app.use('/api/health', healthDataRouter);
app.use('/api/reports', clerkMiddleware, reportsRouter);
app.use('/api/periods', clerkMiddleware, periodDataRouter);
app.use('/api/mental-health', clerkMiddleware, mentalHealthRouter);
app.use('/api/symptoms', clerkMiddleware, symptomsRouter);
app.use('/api/v2/symptoms', clerkMiddleware, symptomsRouterV2);  // v2 route
app.use('/api/firstaid', clerkMiddleware, firstAidRouter);
app.use('/api/menstrual-chat', clerkMiddleware, menstrualChatRouter);
app.use('/api/daily-analysis', clerkMiddleware, periodAnalysisRouter);
app.use('/api/daily-goals', clerkMiddleware, dailyGoalsRouter);
app.use('/api/mental-chat', clerkMiddleware, mentalHealthChatRouter);
app.use('/api/health-tips', healthTipsRouter);
app.use('/api/account', clerkMiddleware, accountDeletionRouter);
// app.use('/api/periods', periodDataRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));