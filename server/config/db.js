import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      console.log('Attempting connection to MongoDB at', mongoUri, 'with 3s timeout...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log('✓ Successfully connected to MongoDB:', mongoose.connection.host);
      return mongoose.connection;
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed or timed out:', err.message);
      console.log('Falling back to embedded in-memory MongoDB (mongodb-memory-server)...');
    }
  } else {
    console.log('No MONGO_URI configured in environment. Starting embedded mongodb-memory-server...');
  }

  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log('✓ Connected to embedded in-memory MongoDB at:', memoryUri);
    return mongoose.connection;
  } catch (memErr) {
    console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
