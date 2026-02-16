require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import Models
const User = require('./models/User');
const Machine = require('./models/Machine');
const SensorReading = require('./models/SensorReading');
const Observation = require('./models/Observation');
const Prediction = require('./models/Prediction');
const Cycle = require('./models/Cycle');

const app = express();
const port = process.env.PORT || 5000;
const { getSystemKnowledge } = require('./data_knowledge');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Successfully connected to MongoDB.'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.warn('Warning: MONGODB_URI not found in environment variables. Database features will be limited.');
}

// Middleware
app.use(cors());
app.use(express.json());

// ─── USER SYNC ENDPOINT ──────────────────────────────────────────
app.post('/api/users/sync', async (req, res) => {
    try {
        const { firebaseUid, name, email, avatarUrl } = req.body;

        console.log(`Syncing user: ${email} (${firebaseUid})`);

        const user = await User.findOneAndUpdate(
            { firebaseUid },
            {
                name,
                email,
                avatarUrl,
                lastLogin: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, user });
    } catch (error) {
        console.error('User sync error:', error);
        res.status(500).json({ error: 'Failed to sync user', details: error.message });
    }
});

// ─── DEBUG ENDPOINT (TO VIEW DB ENTRIES) ─────────────────────────
app.get('/api/users/debug', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Gemini API Setup
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in environment variables.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
// Updated to gemini-2.5-flash as per available models
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// System Prompt for consistent output
const SYSTEM_PROMPT = `
You remain an expert industrial AI predictive maintenance system. 
Your task is to analyze sensor data from various industrial systems and predict their health status.
You MUST output ONLY valid JSON. Do not include markdown formatting like \`\`\`json ... \`\`\`.

Input Structure:
- System Info: Name, ID, Description
- Sensor Values: Key-value pairs of sensor readings

Output Structure (JSON Only):
{
  "rul": number, // Remaining Useful Life in days/hours (integer)
  "rulUnit": string, // "Cycles", "Days", "Hours"
  "healthIndex": number, // 0-100 (integer, 100 is best)
  "riskLevel": string, // "LOW", "MEDIUM", "HIGH", or "CRITICAL"
  "precursorProbability": number, // 0.00 to 1.00
  "confidence": number, // 0.00 to 1.00
  "shortTermRisk": number, // 0.00 to 1.00 (Risk within next 7 days)
  "failureMode": string, // Short description of potential failure
  "topSensors": [ // Array of top 3 contributing sensors
    { "name": "string", "impact": number, "direction": "up" | "down" } 
  ],
  "action": "string", // Recommended maintenance action
  "driftDetected": boolean // true/false
}

Logic:
- Analyze the sensor values relative to typical industrial ranges.
- High temperatures, vibrations, or pressures usually indicate lower health and higher risk.
- "rul" should decrease as health decreases.
- "riskLevel" should correlate with "healthIndex" (e.g., <50 is HIGH/CRITICAL).
- Be deterministic but realistic.
`;

app.post('/api/predict', async (req, res) => {
    try {
        const { systemInfo, inputs, temporalContext, operationalContext, spectralData, eventHistory } = req.body;

        console.log(`Received prediction request for: ${systemInfo.name}`);

        const knowledge = getSystemKnowledge(systemInfo.name);

        // Build enhanced context sections
        let enhancedContext = '';

        if (temporalContext && Object.keys(temporalContext).length > 0) {
            enhancedContext += `
      TEMPORAL DYNAMICS (sensor trends):
      ${JSON.stringify(temporalContext)}
      - Use trend direction (rising/stable/falling) and rate of change to assess whether degradation is accelerating.
      - Compare current values against 24h averages to detect sudden deviations.
      `;
        }

        if (operationalContext && (operationalContext.loadLevel || operationalContext.ambientTemp)) {
            enhancedContext += `
      OPERATIONAL CONTEXT:
      ${JSON.stringify(operationalContext)}
      - Interpret sensor readings relative to load level (e.g., high temp at idle is worse than at heavy load).
      - Consider ambient conditions when evaluating thermal or humidity-sensitive readings.
      `;
        }

        if (spectralData && (spectralData.dominantFrequency || spectralData.frequencyType)) {
            enhancedContext += `
      SPECTRAL / FREQUENCY DATA:
      ${JSON.stringify(spectralData)}
      - Use frequency type to identify the root cause: 1x RPM = unbalance, 2x RPM = misalignment, high-freq = bearing defect.
      - ISO vibration severity indicates the urgency of action.
      `;
        }

        if (eventHistory && (eventHistory.lastMaintenanceDate || eventHistory.recentErrorCodes)) {
            enhancedContext += `
      EVENT CORRELATION (maintenance history):
      ${JSON.stringify(eventHistory)}
      - If maintenance was very recent (< 7 days), elevated readings may be normal bedding-in behavior.
      - Error codes provide clues about recurring fault patterns.
      - Days since last failure indicates reliability trend.
      `;
        }

        const prompt = `
      System: ${JSON.stringify(systemInfo)}
      Sensor Inputs: ${JSON.stringify(inputs)}
      
      DOMAIN KNOWLEDGE FOR THIS SYSTEM TYPE:
      Description: ${knowledge.description}
      Specific Sensors: ${JSON.stringify(knowledge.sensors)}
      Known Failure Modes: ${JSON.stringify(knowledge.failureModes)}
      Rules to Apply: ${JSON.stringify(knowledge.rules)}
      ${enhancedContext}

      Analyze the inputs using ALL of the above context (Domain Knowledge, Temporal Dynamics, Operational Context, Spectral Data, and Event Correlation).
      - Map input keys to "Specific Sensors" to understand what they physically represent.
      - Check "Rules to Apply" against the values.
      - Use temporal trends to determine if degradation is accelerating or stable.
      - Factor in load level and ambient conditions when interpreting readings.
      - Use spectral data to identify specific mechanical fault types.
      - Consider maintenance history to avoid false positives from recent service.
      - Provide the predictive maintenance JSON output.
    `;

        const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
        const response = await result.response;
        let text = response.text();

        // Cleanup markdown if present (just in case the model ignores the "ONLY JSON" instruction slightly)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const prediction = JSON.parse(text);

        // Enforce confidence cap at 95%
        if (prediction.confidence > 0.95) {
            prediction.confidence = 0.95;
        }

        // Add some random simulation data that the AI might essentially halllucinate or keep static, 
        // but ensures the frontend graph works if the AI doesn't return it (though we asked for it).
        // Actually, let's just trust the AI but provide defaults if missing.

        const enhancedPrediction = {
            ...prediction,
            // Ensure strictly required fields exist if AI missed them
            longTermProjection: prediction.longTermProjection || [
                { cycle: 0, health: 100 },
                { cycle: 25, health: prediction.healthIndex + 5 },
                { cycle: 50, health: prediction.healthIndex },
                { cycle: 75, health: prediction.healthIndex - 10 },
                { cycle: 100, health: prediction.healthIndex - 20 }
            ],
            simulation: prediction.simulation || {
                maintenanceNow: { riskReduction: 85, healthImprovement: 15, cost: 4500 },
                maintenanceLater: { riskReduction: 10, healthImprovement: 2, cost: 28000 }
            },
            failureCluster: prediction.failureCluster || { id: "CL-GEN", label: prediction.failureMode, description: "AI Detected Pattern" },
            dataDrift: prediction.dataDrift || { detected: prediction.driftDetected, severity: "Medium", explanation: "AI analysis of input distribution." }
        };

        res.json(enhancedPrediction);

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            error: 'Failed to generate prediction',
            details: error.message,
            // Fallback mock for resilience
            fallback: {
                healthIndex: 50,
                riskLevel: "MEDIUM",
                action: "System Error - Check Backend Logs"
            }
        });
    }
});

// ─── DASHBOARD INTELLIGENCE ENDPOINT ─────────────────────────────
const DASHBOARD_PROMPT = `
You are an expert industrial AI analytics engine. Given a prediction result and system info, generate dashboard analytics.
You MUST output ONLY valid JSON. Do not include markdown formatting.

Output Structure (JSON Only):
{
  "assetIntelligence": {
    "load": number,
    "statusText": "string",
    "trendData": [ { "day": number, "health": number } ]
  },
  "insights": {
    "topSensors": [
      { "name": "string", "val": number, "fill": "string" }
    ],
    "aiDiagnostic": "string",
    "recommendation": "string",
    "estimatedDowntime": "string",
    "costImpact": number
  }
}

Rules:
- assetIntelligence.load: Estimate the operational load % based on the sensor readings and system context.
- assetIntelligence.statusText: A short status phrase like "Running", "Degrading", "Critical Load", etc.
- assetIntelligence.trendData: Generate 30 data points (day 1-30) showing a realistic health trend that ends near the prediction healthIndex.
- insights.topSensors: Convert the prediction's top sensors into bar chart data with name, val (impact as 0-100%), and fill color (use "#FF5C5C" for high impact, "#FFB020" for medium, "#00E0C6" for low).
- insights.aiDiagnostic: A 2-3 sentence expert diagnostic analysis synthesizing the prediction findings.
- insights.recommendation: A clear, actionable maintenance instruction derived from the prediction action.
- insights.estimatedDowntime: Estimated downtime for the recommended maintenance.
- insights.costImpact: Estimated cost in dollars if maintenance is deferred.
`;

app.post('/api/generate-dashboard', async (req, res) => {
    try {
        const { systemInfo, predictionResult, sensorInputs } = req.body;

        console.log(`Generating dashboard intelligence for: ${systemInfo?.name}`);

        const prompt = `
System: ${systemInfo?.name} (ID: ${systemInfo?.id})
Prediction Result: ${JSON.stringify(predictionResult)}
Sensor Inputs: ${JSON.stringify(sensorInputs)}

Generate the dashboard analytics JSON. Use the prediction's healthIndex (${predictionResult?.healthIndex}) for the trend endpoint.
The recommended action from the prediction is: "${predictionResult?.action}".
Top sensors from prediction: ${JSON.stringify(predictionResult?.topSensors)}.
        `;

        const result = await model.generateContent([DASHBOARD_PROMPT, prompt]);
        const response = await result.response;
        let text = response.text();

        // Clean markdown formatting if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const dashboardData = JSON.parse(text);

        // Build the complete intelligence response:
        // - prediction: raw prediction data passed through (used by KPI bar, command panel)
        // - assetIntelligence & insights: LLM-enhanced analytics
        const enhanced = {
            prediction: {
                healthIndex: predictionResult?.healthIndex || 75,
                rul: predictionResult?.rul || 120,
                rulUnit: predictionResult?.rulUnit || "Days",
                riskLevel: predictionResult?.riskLevel || "MEDIUM",
                confidence: predictionResult?.confidence || 0.5,
                precursorProbability: predictionResult?.precursorProbability || 0.3,
                shortTermRisk: predictionResult?.shortTermRisk || 0.2,
                failureMode: predictionResult?.failureMode || "Unknown",
                topSensors: predictionResult?.topSensors || [],
                action: predictionResult?.action || "Schedule inspection.",
                driftDetected: predictionResult?.driftDetected || false,
                dataDrift: predictionResult?.dataDrift || { detected: false, severity: "N/A", explanation: "No drift analysis available." },
                simulation: predictionResult?.simulation || {
                    maintenanceNow: { riskReduction: 0, healthImprovement: 0, cost: 0 },
                    maintenanceLater: { riskReduction: 0, healthImprovement: 0, cost: 0 }
                },
                longTermProjection: predictionResult?.longTermProjection || [],
                failureCluster: predictionResult?.failureCluster || { id: "N/A", label: "N/A", description: "N/A" }
            },
            assetIntelligence: {
                healthIndex: predictionResult?.healthIndex || 75,
                rul: predictionResult?.rul || 120,
                rulUnit: predictionResult?.rulUnit || "Days",
                load: dashboardData.assetIntelligence?.load || 65,
                assetName: systemInfo?.name || "Asset",
                statusText: dashboardData.assetIntelligence?.statusText || "Operating",
                trendData: dashboardData.assetIntelligence?.trendData || Array.from({ length: 30 }, (_, i) => ({
                    day: i + 1,
                    health: (predictionResult?.healthIndex || 75) - (i * 0.5) + (Math.sin(i) * 3)
                }))
            },
            insights: {
                topSensors: dashboardData.insights?.topSensors || (predictionResult?.topSensors || []).map((s, i) => ({
                    name: s.name,
                    val: Math.round(s.impact * 100),
                    fill: ["#FF5C5C", "#FFB020", "#00E0C6"][i] || "#00E0C6"
                })),
                aiDiagnostic: dashboardData.insights?.aiDiagnostic || "AI analysis based on current sensor readings.",
                recommendation: dashboardData.insights?.recommendation || predictionResult?.action || "Schedule inspection.",
                estimatedDowntime: dashboardData.insights?.estimatedDowntime || "4h",
                costImpact: dashboardData.insights?.costImpact || 4500
            }
        };

        res.json(enhanced);

    } catch (error) {
        console.error('Dashboard generation error:', error);
        res.status(500).json({
            error: 'Failed to generate dashboard intelligence',
            details: error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const CHAT_SYSTEM_PROMPT = `
You are "Forsee AI", an advanced industrial predictive maintenance assistant.
Your goal is to assist machine operators, engineers, and plant managers in ensuring optimal equipment health.

Traits:
- Professional, technical, yet accessible.
- Proactive in suggesting safety checks.
- Knowledgeable about industrial machinery (turbines, pumps, compressors, conveyor belts, etc.).

Capabilities:
- Explaining failure modes (e.g., "What causes bearing seizure?").
- Recommending maintenance actions.
- interpreting technical sensor data concepts (vibration analysis, thermography).
- Helping users navigate the Forsee AI dashboard (conceptually).

Guidelines:
- If asked about specific real-time data that you don't have access to, politely explain you are an AI assistant and ask the user to provide the readings or check the dashboard.
- Keep answers concise and actionable.
- Prioritize safety in all recommendations.
`;

const chatModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: CHAT_SYSTEM_PROMPT
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        console.log(`Received chat message: ${message}`);
        console.log(`History length: ${history?.length}`);

        // Construct chat history for Gemini
        const chat = chatModel.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });

    } catch (error) {
        console.error('Chat API Error Full Objects:', JSON.stringify(error, null, 2));
        console.error('Chat API Error Message:', error.message);

        let errorMessage = 'Failed to process chat message';

        // Handle common Gemini errors
        if (error.message?.includes('API key')) {
            errorMessage = 'Invalid API Key';
        } else if (error.message?.includes('SAFETY')) {
            errorMessage = 'Response blocked by safety filters';
        }

        res.status(500).json({ error: errorMessage, details: error.message });
    }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
