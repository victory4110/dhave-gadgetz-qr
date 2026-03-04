const express = require('express');
const router = express.Router();

const {
    getAccountDetails,
    handleScan,
    generateQR,
    processPayment,
    paymentCallback,
    paystackWebhook
} = require('../controllers/account.controller');

// Generator Endpoint
router.post('/accounts/generate-qr', generateQR);

// *** THE PROJECT CORE: Fetch Bank Details ***
// GET /api/accounts/details/:accountNumber
// This fetches the actual bank info for the scanner/profile page
router.get('/accounts/details/:accountNumber', getAccountDetails);

// Scanning Redirection
// GET /api/pay/:accountNumber
// Scanned QR code lands here -> redirects to profile page
router.get('/pay/callback', paymentCallback);
router.get('/pay/:accountNumber', handleScan);

// Final Payment Step
router.get('/pay/process/:accountNumber', processPayment);

module.exports = router;