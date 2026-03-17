const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Try to load PaymentLink model, fallback to in-memory store
let PaymentLink;
let useInMemory = false;
const inMemoryLinks = new Map();

try {
    PaymentLink = require('../models/PaymentLink');
} catch {
    useInMemory = true;
}

// Helper to check if mongoose is connected
const isDbConnected = () => {
    try {
        const mongoose = require('mongoose');
        return mongoose.connection.readyState === 1;
    } catch { return false; }
};

// In-memory CRUD helpers
const saveLink = async (linkData) => {
    if (isDbConnected() && PaymentLink) {
        const link = new PaymentLink(linkData);
        return await link.save();
    }
    // fallback to in-memory
    inMemoryLinks.set(linkData.linkId, { ...linkData, createdAt: new Date() });
    return inMemoryLinks.get(linkData.linkId);
};

const findLink = async (linkId) => {
    if (isDbConnected() && PaymentLink) {
        return await PaymentLink.findOne({ linkId });
    }
    return inMemoryLinks.get(linkId) || null;
};

const updateLink = async (linkId, updates) => {
    if (isDbConnected() && PaymentLink) {
        return await PaymentLink.findOneAndUpdate({ linkId }, updates, { new: true });
    }
    const link = inMemoryLinks.get(linkId);
    if (link) {
        Object.assign(link, updates);
        inMemoryLinks.set(linkId, link);
    }
    return link;
};

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────
// SEND MONEY ENDPOINTS
// ─────────────────────────────────────────────

// @route   POST /api/payment/create-order
// @desc    Create a new Razorpay Order (for Send Money)
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: "Amount is required" });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) {
            return res.status(500).json({ success: false, message: "Error creating order" });
        }

        res.json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment signature
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, linkId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // If this was a payment-link payment, mark it as paid
            if (linkId) {
                await updateLink(linkId, {
                    status: 'paid',
                    transactionId: razorpay_payment_id,
                    paidAt: new Date()
                });
            }
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Razorpay Verify Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// ─────────────────────────────────────────────
// RECEIVE MONEY / PAYMENT LINK ENDPOINTS
// ─────────────────────────────────────────────

// @route   POST /api/payment/create-link
// @desc    Create a new payment link for receiving money
router.post('/create-link', async (req, res) => {
    try {
        const { receiverName, receiverEmail, amount, description, expiry } = req.body;

        if (!receiverName) {
            return res.status(400).json({ success: false, message: "Receiver name is required" });
        }

        // Generate unique link ID
        const linkId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

        // Calculate expiry
        let expiresAt = null;
        if (expiry === '1h') expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
        else if (expiry === '24h') expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        else if (expiry === '7d') expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const linkData = {
            linkId,
            receiverName,
            receiverEmail: receiverEmail || '',
            amount: amount || 0,
            description: description || '',
            expiresAt,
            status: 'active'
        };

        await saveLink(linkData);

        res.json({
            success: true,
            linkId,
            paymentLink: linkData
        });
    } catch (error) {
        console.error("Create Link Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// @route   GET /api/payment/link/:linkId
// @desc    Get payment link details (for the pay page)
router.get('/link/:linkId', async (req, res) => {
    try {
        const { linkId } = req.params;
        const link = await findLink(linkId);

        if (!link) {
            return res.status(404).json({ success: false, message: "Payment link not found" });
        }

        // Check if expired
        if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
            await updateLink(linkId, { status: 'expired' });
            return res.status(410).json({ success: false, message: "Payment link has expired", link });
        }

        // Check if already paid
        if (link.status === 'paid') {
            return res.status(200).json({ success: true, message: "Already paid", link, alreadyPaid: true });
        }

        res.json({ success: true, link });
    } catch (error) {
        console.error("Get Link Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// @route   POST /api/payment/link/:linkId/pay
// @desc    Create Razorpay order for a payment link
router.post('/link/:linkId/pay', async (req, res) => {
    try {
        const { linkId } = req.params;
        const { amount } = req.body;

        const link = await findLink(linkId);
        if (!link) {
            return res.status(404).json({ success: false, message: "Payment link not found" });
        }
        if (link.status !== 'active') {
            return res.status(400).json({ success: false, message: `Link is ${link.status}` });
        }
        if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
            return res.status(410).json({ success: false, message: "Link expired" });
        }

        const payAmount = link.amount > 0 ? link.amount : Number(amount);
        if (!payAmount || payAmount <= 0) {
            return res.status(400).json({ success: false, message: "Valid amount required" });
        }

        const order = await razorpay.orders.create({
            amount: Math.round(payAmount * 100),
            currency: "INR",
            receipt: `link_${linkId}`,
        });

        res.json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID,
            link
        });
    } catch (error) {
        console.error("Link Pay Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

module.exports = router;
