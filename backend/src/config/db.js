const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      try {
        console.log(`[DB] Attempting connection to configured MONGODB_URI...`);
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
        console.log(`[DB] Connected to MongoDB at: ${mongoUri}`);
        return;
      } catch (externalErr) {
        console.warn(`[DB] Configured MONGODB_URI failed (${externalErr.message}). Switching to MongoMemoryServer...`);
      }
    }

    console.log('[DB] Starting embedded MongoMemoryServer engine...');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    console.log(`[DB] Connected to embedded MongoDB successfully at: ${uri}`);
  } catch (error) {
    console.error('[DB] Database connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('[DB] Error disconnecting:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
