import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let ioInstance = null;

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'internbridge_secret_fallback');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Invalid socket token: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.userId} (socket ${socket.id})`);

    // Join personal notification room
    socket.join(`user_${socket.userId}`);

    // Join conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(`chat_${conversationId}`);
      console.log(`[Socket.IO] User ${socket.userId} joined chat_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`chat_${conversationId}`);
      console.log(`[Socket.IO] User ${socket.userId} left chat_${conversationId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User disconnected: ${socket.userId}`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return ioInstance;
};
