const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Prevent process exit on unhandled rejections
process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the OkPay Clone API!' });
});

// Health check route for uptime and deployment verification
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true, service: 'okpay-backend' });
});

// Import and use routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/okpay-clone';

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Try MongoDB connection separately (non-blocking, non-crashing)
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(() => console.log('⚠️  MongoDB not available — using in-memory storage'));
