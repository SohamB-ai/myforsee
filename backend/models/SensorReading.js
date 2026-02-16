const mongoose = require('mongoose');

const SensorReadingSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    readings: {
        temperature: Number,
        vibration: Number,
        pressure: Number,
        rpm: Number,
        voltage: Number,
        acoustic: Number
    },
    operationContext: {
        shift: String,
        loadPercentage: Number,
        runningState: {
            type: String,
            enum: ['idle', 'running', 'stopped'],
            default: 'running'
        }
    }
});

module.exports = mongoose.model('SensorReading', SensorReadingSchema);
