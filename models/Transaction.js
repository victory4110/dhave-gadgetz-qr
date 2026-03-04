const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        reference: {
            type: String,
            required: true,
            unique: true,
        },
        accountNumber: {
            type: String,
            required: true,
        },
        accountName: {
            type: String,
            required: true,
        },
        bank: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
        },
        amount: {
            type: Number,
            required: false,
        },
        status: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending',
        },
        paystackReference: {
            type: String,
            default: null,
        },
        qrCodeDataUrl: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);


module.exports = mongoose.model('Transaction', transactionSchema);
