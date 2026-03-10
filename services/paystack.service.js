const axios = require('axios');

const PAYSTACK_BASE = 'https://api.paystack.co';

/**
 * Initialise a Paystack payment transaction.
 *
 * @param {object} opts
 * @param {string} opts.email
 * @param {number} opts.amount
 * @param {string} opts.reference
 * @param {string} opts.callbackUrl 
 * @returns {Promise<{authorizationUrl: string, accessCode: string}>}
 */
async function initializePayment({ email, amount, reference, callbackUrl }) {
    const response = await axios.post(
        `${PAYSTACK_BASE}/transaction/initialize`,
        {
            email,
            amount,
            reference,
            callback_url: callbackUrl,
            metadata: {
                cancel_action: callbackUrl,
            },
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );

    const { data } = response.data;
    return {
        authorizationUrl: data.authorization_url,
        accessCode: data.access_code,
    };
}

/**
 * Verify a completed Paystack transaction.
 *
 * @param {string} reference 
 * @returns {Promise<object>} 
 */
async function verifyPayment(reference) {
    const response = await axios.get(
        `${PAYSTACK_BASE}/transaction/verify/${reference}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        }
    );

    return response.data.data;
}

module.exports = { initializePayment, verifyPayment };
