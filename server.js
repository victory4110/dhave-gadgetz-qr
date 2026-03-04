require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const accountRoutes = require('./routes/account.routes');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.static('public'));

app.use('/api/webhooks/paystack', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', accountRoutes);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});
app.use((err, _req, res, _next) => {
    console.error('Unhandled Error', err);
    res.status(500).json({ success: false, message: 'Unexpected server error.' });
});

async function start() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-payment');
        console.log('Connected to MongoDB');
        const Account = require('./models/Account');
        const fs = require('fs');
        const path = require('path');

        // Ensure the Master Account (DHAVE GADGETZ) exists
        await Account.findOneAndUpdate(
            { accountNumber: "5199540974" },
            {
                accountName: "DHAVE GADGETZ",
                bank: "Moniepoint",
                email: "merchant@example.com"
            },
            { upsert: true }
        );
        console.log('✅  Master Account (DHAVE GADGETZ) is ready.');

        const count = await Account.countDocuments();
        if (count <= 1) { // 1 because we just added/updated the master
            const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'accounts.json'), 'utf8'));
            // Filter out the master if it's already in the json to avoid duplicates
            const filteredData = data.filter(acc => acc.accountNumber !== "5199540974");
            if (filteredData.length > 0) {
                await Account.insertMany(filteredData);
                console.log('🌱  Database seeded with additional accounts');
            }
        }

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Health check → http://localhost:${PORT}/health`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
}

start();