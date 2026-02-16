require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    console.log('Attempting to connect to MongoDB Atlas...');
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('Error: MONGODB_URI not found in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('SUCCESS: Connection established to MongoDB Atlas.');
        await mongoose.connection.db.admin().ping();
        console.log('SUCCESS: Pinged database successfully.');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB Atlas.');
        console.error(err);
        process.exit(1);
    }
}

testConnection();
