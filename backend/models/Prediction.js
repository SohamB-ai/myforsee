const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine'
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    riskScore: {
        type: Number,
        min: 0,
        max: 100
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    predictedFailureWindowHours: Number,
    contributingFactors: [{
        sensor: String,
        impact: Number
    }],
    recommendedAction: String,
    trend: {
        direction: {
            type: String,
            enum: ['stable', 'rising', 'falling'],
            default: 'stable'
        },
        slope: Number
    }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
