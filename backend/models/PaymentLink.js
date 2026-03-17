const mongoose = require('mongoose');

const paymentLinkSchema = new mongoose.Schema({
    linkId: {
        type: String,
        required: true,
        unique: true
    },
    receiverName: {
        type: String,
        required: true
    },
    receiverEmail: {
        type: String,
        default: ''
    },
    amount: {
        type: Number,
        default: 0  // 0 means payer decides amount
    },
    description: {
        type: String,
        default: ''
    },
    expiresAt: {
        type: Date,
        default: null  // null means never expires
    },
    status: {
        type: String,
        enum: ['active', 'paid', 'expired', 'cancelled'],
        default: 'active'
    },
    // Transaction details (filled after payment)
    transactionId: {
        type: String,
        default: ''
    },
    senderName: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        default: ''
    },
    paidAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentLink', paymentLinkSchema);
