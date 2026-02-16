const mongoose = require('mongoose');

const ObservationSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    observationType: {
        type: String,
        enum: ['noise', 'heat', 'vibration', 'leak', 'smell'],
        required: true
    },
    severity: {
        type: String,
        enum: ['none', 'mild', 'moderate', 'severe'],
        default: 'none'
    },
    location: {
        type: String,
        enum: ['bearing', 'motor', 'coupling'],
        required: true
    },
    duration: {
        type: String,
        enum: ['momentary', 'continuous'],
        default: 'momentary'
    },
    confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    context: {
        type: String,
        enum: [
            'routine inspection',
            'after trip',
            'after overload',
            'during abnormal operation',
            'post-maintenance'
        ],
        default: 'routine inspection'
    },
    reportedBy: String
});

module.exports = mongoose.model('Observation', ObservationSchema);
