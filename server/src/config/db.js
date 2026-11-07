import mongoose from 'mongoose';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore if custom DNS cannot be set
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localFallbackUri = 'mongodb://127.0.0.1:27017/internbridge';

  if (primaryUri) {
    try {
      console.log('[Database] Connecting to primary MongoDB...');
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`[Database Notice] Primary connection attempt failed: ${error.message}`);
      console.warn('[Database Notice] Attempting fallback to local MongoDB (127.0.0.1:27017)...');
    }
  }

  try {
    const localConn = await mongoose.connect(localFallbackUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Local MongoDB Connected: ${localConn.connection.host}`);
  } catch (localErr) {
    console.error(`[Database Error] Local MongoDB fallback failed: ${localErr.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
