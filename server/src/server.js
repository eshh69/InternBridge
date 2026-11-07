import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {}

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initializeSocket } from './socket/index.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start Server
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  InternBridge Server Running on Port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`=========================================`);
});
