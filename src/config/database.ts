import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    logger.error('MONGODB_URI is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error connecting to MongoDB: ${message}`);
    process.exit(1);
  }
};
