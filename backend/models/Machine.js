const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    location: String,
    operationMode: {
        type: String,
        enum: ['continuous', 'shift-based', 'batch-based'],
        default: 'continuous'
    },
    cycleDefinition: {
        unit: {
            type: String,
            enum: ['time', 'rotation', 'production_count'],
            default: 'time'
        },
        expectedDurationMinutes: Number,
        description: String
    },
    sensors: [{
        name: String,
        unit: String,
        normalMin: Number,
        normalMax: Number
    }],
    createdBy: {
        type: String, // email or id
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Machine', MachineSchema);
