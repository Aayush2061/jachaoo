require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node'); // Correct import
const app = express();

// Initialize Clerk
const clerkMiddleware = ClerkExpressRequireAuth();

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const healthDataRouter = require('./routes/healthData');
const reportsRouter = require('./routes/reports');

app.use('/api/health', healthDataRouter);
app.use('/api/reports', clerkMiddleware, reportsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));