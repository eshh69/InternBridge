import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internbridge');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // In development without DB, don't crash immediately so tests and API can be inspected
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
