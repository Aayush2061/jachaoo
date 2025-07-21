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

app.use('/api/health', healthDataRouter);
app.use('/api/reports', clerkMiddleware, reportsRouter);
app.use('/api/periods', clerkMiddleware, periodDataRouter);
app.use('/api/mental-health', clerkMiddleware, mentalHealthRouter);
app.use('/api/symptoms', clerkMiddleware, symptomsRouter);
// app.use('/api/periods', periodDataRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));