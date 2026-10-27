import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

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
      if (conversationId) {
        socket.join(`chat_${conversationId}`);
        console.log(`[Socket.IO] User ${socket.userId} joined chat_${conversationId}`);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`chat_${conversationId}`);
        console.log(`[Socket.IO] User ${socket.userId} left chat_${conversationId}`);
      }
    });

    // Real-time message sending via WebSocket
    socket.on('send_message', async ({ conversationId, content }, callback) => {
      try {
        if (!conversationId || !content || !content.trim()) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Invalid message data' });
          }
          return;
        }

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Invalid conversation ID' });
          }
          return;
        }

        const conversation = await Conversation.findById(conversationId).populate('company');
        if (!conversation) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Conversation not found' });
          }
          return;
        }

        const isStudent = conversation.student.toString() === socket.userId.toString();
        const isCompany =
          conversation.company?.user &&
          conversation.company.user.toString() === socket.userId.toString();

        if (!isStudent && !isCompany) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Unauthorized to send message in this chat' });
          }
          return;
        }

        const sender = socket.userId;
        const receiver = isStudent ? conversation.company.user : conversation.student;

        if (!receiver) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Unable to identify recipient' });
          }
          return;
        }

        const message = await Message.create({
          conversation: conversationId,
          sender,
          receiver,
          content: content.trim(),
          readStatus: false,
        });

        conversation.lastMessage = content.trim();
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatarUrl role')
          .populate('receiver', 'name avatarUrl role')
          .lean();

        // Broadcast to everyone in the chat room (including sender)
        io.to(`chat_${conversationId}`).emit('new_message', { message: populatedMessage });

        // Emit notification to receiver's personal room
        io.to(`user_${receiver.toString()}`).emit('notification', {
          type: 'new_message',
          title: 'New Message',
          message: content.trim().substring(0, 100),
          referenceId: conversationId,
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: populatedMessage });
        }
      } catch (err) {
        console.error('[Socket.IO] send_message error:', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    // Real-time typing indicators
    socket.on('typing', ({ conversationId, userName }) => {
      if (conversationId) {
        socket.to(`chat_${conversationId}`).emit('user_typing', {
          userId: socket.userId,
          userName: userName || 'Someone',
          conversationId,
        });
      }
    });

    socket.on('stop_typing', ({ conversationId }) => {
      if (conversationId) {
        socket.to(`chat_${conversationId}`).emit('user_stop_typing', {
          userId: socket.userId,
          conversationId,
        });
      }
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
