const mongoose = require('mongoose');

const CycleSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: Date,
    cycleCount: {
        type: Number,
        default: 0
    },
    mode: {
        type: String,
        enum: ['time-based', 'rotation-based', 'production-based'],
        default: 'time-based'
    }
});

module.exports = mongoose.model('Cycle', CycleSchema);
