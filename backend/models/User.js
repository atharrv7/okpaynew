const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    // Adding optional onboarding fields
    platform: { type: String, default: "" },
    website: { type: String, default: "" },
    pan: { type: String, default: "" },
    businessName: { type: String, default: "" },
    isKycCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
