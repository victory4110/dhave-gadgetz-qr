const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
    {
        accountNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        accountName: {
            type: String,
            required: true,
            trim: true,
        },
        bank: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);