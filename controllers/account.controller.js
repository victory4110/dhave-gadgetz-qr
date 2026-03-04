const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { generateReference, generateQRCode } = require('../services/qr.service');
const { initializePayment, verifyPayment } = require('../services/paystack.service');

// ─── Fetch Account Details ──────────────────────────────────────────────────
/**
 * GET /api/accounts/details/:accountNumber
 * 
 * This is the CORE of the project. It fetches the bank details 
 * for a specific account number from the database.
 */
async function getAccountDetails(req, res) {
    try {
        const { accountNumber } = req.params;
        console.log(`[API] Fetching bank details for account: ${accountNumber}`);
        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found.' });
        }

        return res.status(200).json({
            success: true,
            data: {
                accountNumber: account.accountNumber,
                accountName: account.accountName,
                bank: account.bank,
                email: account.email
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// ─── Scanned QR Redirection ─────────────────────────────────────────────────
/**
 * GET /api/pay/:accountNumber
 * 
 * When the "Profile QR" is scanned, it redirects the user 
 * to the visual profile page to see the details.
 * 
 * The QR code URL is now: /api/pay/5199540974
 */
async function handleScan(req, res) {
    try {
        const { accountNumber } = req.params;
        console.log(`[Scan] QR code scanned for account: ${accountNumber}`);

        // Ensure the account exists before redirecting
        const account = await Account.findOne({ accountNumber });
        if (!account) return res.status(404).send("Account not found.");

        // Visual redirect to profile page
        return res.redirect(`/profile.html?acc=${accountNumber}`);
    } catch (err) {
        return res.status(500).send("Error");
    }
}

// ─── Generate Account QR Code ───────────────────────────────────────────────
/**
 * POST /api/accounts/generate-qr
 * 
 * Connects to the generator UI. 
 * Creates a permanent QR code linked specifically to this bank detail.
 */
async function generateQR(req, res) {
    try {
        const { accountNumber, accountName, bank, email } = req.body;

        if (!accountNumber) return res.status(400).json({ success: false, message: 'Required info missing.' });

        // UPSERT the account details (Create or Update)
        const account = await Account.findOneAndUpdate(
            { accountNumber },
            { accountName, bank, email },
            { upsert: true, returnDocument: 'after' }
        );

        // Generate the QR code URL (links to the handleScan endpoint)
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const scanUrl = `${baseUrl}/api/pay/${accountNumber}`;

        const qrcode = require('qrcode');
        const qrDataUrl = await qrcode.toDataURL(scanUrl, { width: 400, margin: 2 });

        return res.status(201).json({
            success: true,
            data: {
                accountNumber: account.accountNumber,
                accountName: account.accountName,
                bank: account.bank,
                qrCode: qrDataUrl,
                scanUrl: scanUrl
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Generation failed.' });
    }
}

// (Keeping existing payment logic for completeness below)
async function processPayment(req, res) {
    try {
        const { accountNumber } = req.params;
        const { amount, email } = req.query;

        const account = await Account.findOne({ accountNumber });
        if (!account) return res.status(404).json({ success: false, message: 'Account not found.' });

        const amountKobo = Math.round(Number(amount) * 100);
        const reference = `QR-${Date.now()}`;

        // Create a transaction record
        await Transaction.create({
            reference,
            accountNumber,
            accountName: account.accountName,
            bank: account.bank,
            email: email || account.email,
            amount: amountKobo
        });

        const callbackUrl = `${process.env.BASE_URL}/api/pay/callback?reference=${reference}`;
        const { authorizationUrl } = await initializePayment({
            email: email || account.email,
            amount: amountKobo,
            reference,
            callbackUrl,
        });

        return res.redirect(authorizationUrl);
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Paystack failed.' });
    }
}

async function paymentCallback(req, res) {
    try {
        const { reference } = req.query;
        const paymentData = await verifyPayment(reference);

        if (paymentData.status === 'success') {
            await Transaction.updateOne({ reference }, { status: 'success', paystackReference: paymentData.reference });
            return res.redirect(`/success.html?ref=${reference}&amount=${paymentData.amount / 100}`);
        } else {
            return res.send("Payment failed.");
        }
    } catch (err) {
        return res.status(500).send("Callback error.");
    }
}

async function paystackWebhook(req, res) {
    return res.status(200).send();
}

module.exports = {
    getAccountDetails,
    handleScan,
    generateQR,
    processPayment,
    paymentCallback,
    paystackWebhook
};