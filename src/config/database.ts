import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
