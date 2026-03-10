const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Pre-load Models
const Account = require('./models/Account');

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection Middleware (Robust for Serverless)
let cachedDb = null;
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    console.log("=> Connecting to database");
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        // Ensure Master Account exists right after connection
        await Account.findOneAndUpdate(
            { accountNumber: "5199540974" },
            {
                accountName: "DHAVE GADGETZ",
                bank: "Moniepoint",
                email: "merchant@example.com"
            },
            { upsert: true }
        );
        console.log("✅ Master account verified.");

        cachedDb = db;
        return db;
    } catch (err) {
        console.error("Database connection failed:", err.message);
        throw err;
    }
}

// Global middleware to connect to DB
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: "Server connection failed. Check your database URI." });
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const accountRoutes = require('./routes/account.routes');
app.use('/api', accountRoutes);

// Health Check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// For Vercel, serve static files explicitly via Express if not handled by vercel.json
app.use(express.static('public'));

// Local Server Start Logic
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running locally on http://localhost:${PORT}`);
    });
}

module.exports = app;