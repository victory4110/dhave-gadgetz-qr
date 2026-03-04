const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a cryptographically random token to use as the QR reference.
 * Never embed the raw account number in the QR code.
 */
function generateReference() {
    return `QR-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
}

/**
 * Build the payment URL that the QR code will point to.
 * The reference maps to the transaction in our DB — the payer never sees
 * the actual account number.
 *
 * @param {string} reference  - opaque token
 * @returns {string}          - full URL
 */
function buildPaymentUrl(reference) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/pay/${reference}`;
}

/**
 * Generate a QR code as a base64 data URL.
 *
 * @param {string} reference - opaque payment reference
 * @returns {Promise<string>} - data:image/png;base64,... string
 */
async function generateQRCode(reference) {
    const paymentUrl = buildPaymentUrl(reference);
    const dataUrl = await QRCode.toDataURL(paymentUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
            dark: '#1a1a2e',
            light: '#ffffff',
        },
        width: 300,
    });
    return dataUrl;
}

module.exports = {
    generateReference,
    buildPaymentUrl,
    generateQRCode,
};