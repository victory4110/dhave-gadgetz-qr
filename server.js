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

        if (!process.env.VERCEL) {
            console.log('✅  Master Account (DHAVE GADGETZ) is ready.');
        }

        cachedDb = db;
        return db;
    } catch (err) {
        if (!process.env.VERCEL) {
            console.error("Failed to connect to MongoDB:", err.message);
        }
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

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve index.html for the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Local Server Start Logic
if (!process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Health check → http://localhost:${PORT}/health`);
        try {
            await connectToDatabase();
            console.log('Connected to MongoDB');
        } catch (err) {
            // Error already logged in connectToDatabase
        }
    });
}

module.exports = app;