require('dotenv').config();
const mongoose = require('mongoose');
const Machine = require('../models/Machine');
const SensorReading = require('../models/SensorReading');
const Observation = require('../models/Observation');
const Prediction = require('../models/Prediction');
const User = require('../models/User');

async function seed() {
    console.log('🌱 Starting database seeding...');
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('Error: MONGODB_URI not found in environment');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Atlas.');

        // 1. Clear existing collections in forsee_ai
        console.log('Cleaning existing collections...');
        await Machine.deleteMany({});
        await SensorReading.deleteMany({});
        await Observation.deleteMany({});
        await Prediction.deleteMany({});
        // We keep Users to avoid locking out the logged-in user, 
        // but let's ensure at least one admin exists.

        // 2. Insert Sample Machine
        console.log('Creating sample machine...');
        const turbine = await Machine.create({
            name: "Turbine A-11",
            type: "Turbofan Engine",
            location: "North Hangar - Section 4",
            operationMode: "continuous",
            cycleDefinition: {
                unit: "time",
                expectedDurationMinutes: 480,
                description: "Standard flight cycle"
            },
            sensors: [
                { name: "T2", unit: "°R", normalMin: 500, normalMax: 520 },
                { name: "P15", unit: "psia", normalMin: 450, normalMax: 500 },
                { name: "Vibration", unit: "mm/s", normalMin: 0.1, normalMax: 0.5 }
            ],
            createdBy: "admin@forsee.ai"
        });

        // 3. Insert Sensor Readings (10 samples)
        console.log('Generating sensor telemetry...');
        const readings = [];
        const now = new Date();
        for (let i = 9; i >= 0; i--) {
            readings.push({
                machineId: turbine._id,
                timestamp: new Date(now.getTime() - i * 3600000), // 1 hour intervals
                readings: {
                    temperature: 512 + Math.random() * 5,
                    vibration: 0.3 + Math.random() * 0.1,
                    pressure: 475 + Math.random() * 10,
                    rpm: 12000 + Math.random() * 500,
                    voltage: 115,
                    acoustic: 65 + Math.random() * 5
                },
                operationContext: {
                    shift: "Day",
                    loadPercentage: 85,
                    runningState: "running"
                }
            });
        }
        await SensorReading.insertMany(readings);

        // 4. Insert Human Observation
        console.log('Adding human inspection log...');
        await Observation.create({
            machineId: turbine._id,
            observationType: "vibration",
            severity: "moderate",
            location: "bearing",
            duration: "continuous",
            confidence: "high",
            context: "routine inspection",
            reportedBy: "Senior Engineer"
        });

        // 5. Insert AI Prediction Result
        console.log('Generating AI prediction baseline...');
        await Prediction.create({
            machineId: turbine._id,
            riskScore: 72,
            riskLevel: "high",
            predictedFailureWindowHours: 120,
            contributingFactors: [
                { sensor: "Vibration", impact: 0.85 },
                { sensor: "T2", impact: 0.15 }
            ],
            recommendedAction: "Borescope inspection of bearing housing required within 48 hours.",
            trend: {
                direction: "rising",
                slope: 0.12
            }
        });

        console.log('✅ Seeding complete! Database is production-ready.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
