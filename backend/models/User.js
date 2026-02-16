const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: String,
    role: {
        type: String,
        enum: ['admin', 'operator', 'viewer'],
        default: 'operator'
    },
    organization: String,
    avatarUrl: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date
});

module.exports = mongoose.model('User', UserSchema);
