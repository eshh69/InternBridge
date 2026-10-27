import express from 'express';
import mongoose from 'mongoose';
import { protect, authorize } from '../../middleware/auth.js';
import { Conversation } from '../../models/Conversation.js';
import { Message } from '../../models/Message.js';
import { Company } from '../../models/Company.js';
import { User } from '../../models/User.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { getIO } from '../../socket/index.js';

const router = express.Router();

/**
 * @desc    Get all active conversations for the authenticated user
 * @route   GET /api/v1/conversations
 * @access  Private (student, company)
 */
router.get('/', protect, authorize('student', 'company'), async (req, res, next) => {
  try {
    let query = {};
    const isStudent = req.user.role === 'student';

    if (isStudent) {
      query.student = req.user._id;
    } else {
      // Find or auto-initialize company profile for this user
      let company = await Company.findOne({ user: req.user._id });
      if (!company) {
        company = await Company.create({
          user: req.user._id,
          name: req.user.name || 'Company Partner',
          description: 'Hiring company partner on InternBridge.',
          industry: 'Technology & Software',
          location: {
            address: 'Colombo Office',
            city: 'Colombo',
            country: 'Sri Lanka',
          },
          website: 'https://internbridge.lk',
          contactEmail: req.user.email,
          contactPhone: '',
          logoUrl: null,
          verificationStatus: 'verified',
        });
      }
      query.company = company._id;
    }

    const conversations = await Conversation.find(query)
      .populate('student', 'name email avatarUrl role')
      .populate({
        path: 'company',
        select: 'name logoUrl industry location contactEmail website user verificationStatus',
      })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Attach unread count to each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: req.user._id,
          readStatus: false,
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    return sendSuccess(res, 200, 'Conversations retrieved successfully', {
      conversations: conversationsWithUnread,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get directory of companies available to start a chat with
 * @route   GET /api/v1/conversations/companies
 * @access  Private (student)
 */
router.get('/companies', protect, authorize('student'), async (req, res, next) => {
  try {
    const companies = await Company.find({}, 'name logoUrl industry location contactEmail website verificationStatus')
      .sort({ name: 1 })
      .lean();

    return sendSuccess(res, 200, 'Companies retrieved successfully', { companies });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Start or retrieve existing 1-on-1 conversation
 * @route   POST /api/v1/conversations
 * @access  Private (student, company)
 */
router.post('/', protect, authorize('student', 'company'), async (req, res, next) => {
  try {
    const isStudent = req.user.role === 'student';
    let studentId;
    let companyId;

    if (isStudent) {
      studentId = req.user._id;
      companyId = req.body.companyId;

      if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
        return sendError(res, 400, 'Valid companyId is required');
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return sendError(res, 404, 'Company not found');
      }
    } else {
      // Authenticated user is a company
      let company = await Company.findOne({ user: req.user._id });
      if (!company) {
        company = await Company.create({
          user: req.user._id,
          name: req.user.name || 'Company Partner',
          description: 'Hiring company partner on InternBridge.',
          industry: 'Technology & Software',
          location: {
            address: 'Colombo Office',
            city: 'Colombo',
            country: 'Sri Lanka',
          },
          website: 'https://internbridge.lk',
          contactEmail: req.user.email,
          contactPhone: '',
          logoUrl: null,
          verificationStatus: 'verified',
        });
      }
      companyId = company._id;
      studentId = req.body.studentId;

      if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        return sendError(res, 400, 'Valid studentId is required');
      }

      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        return sendError(res, 404, 'Student account not found');
      }
    }

    // Find existing or create new conversation
    let conversation = await Conversation.findOne({ student: studentId, company: companyId })
      .populate('student', 'name email avatarUrl role')
      .populate({
        path: 'company',
        select: 'name logoUrl industry location contactEmail website user verificationStatus',
      });

    if (!conversation) {
      conversation = await Conversation.create({
        student: studentId,
        company: companyId,
        lastMessage: '',
        lastMessageAt: new Date(),
      });

      conversation = await conversation.populate('student', 'name email avatarUrl role');
      conversation = await conversation.populate({
        path: 'company',
        select: 'name logoUrl industry location contactEmail website user verificationStatus',
      });
    }

    return sendSuccess(res, 201, 'Conversation ready', { conversation });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get messages for a conversation and mark as read
 * @route   GET /api/v1/conversations/:id/messages
 * @access  Private (participant only)
 */
router.get('/:id/messages', protect, authorize('student', 'company'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid conversation ID');
    }

    const conversation = await Conversation.findById(id)
      .populate('student', 'name email avatarUrl role')
      .populate({
        path: 'company',
        select: 'name logoUrl industry location contactEmail website user',
      });

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    // Verify user is a participant
    const isStudentParticipant = conversation.student._id.toString() === req.user._id.toString();
    const isCompanyParticipant =
      conversation.company?.user && conversation.company.user.toString() === req.user._id.toString();

    if (!isStudentParticipant && !isCompanyParticipant) {
      return sendError(res, 403, 'You are not authorized to view messages in this conversation');
    }

    // Mark unread messages sent to current user as read
    await Message.updateMany(
      {
        conversation: id,
        receiver: req.user._id,
        readStatus: false,
      },
      {
        $set: { readStatus: true },
      }
    );

    // Retrieve full chat history ordered chronologically
    const messages = await Message.find({ conversation: id })
      .populate('sender', 'name avatarUrl role')
      .populate('receiver', 'name avatarUrl role')
      .sort({ createdAt: 1 })
      .lean();

    return sendSuccess(res, 200, 'Messages retrieved successfully', {
      conversation,
      messages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Send a message in a conversation (REST fallback)
 * @route   POST /api/v1/conversations/:id/messages
 * @access  Private (participant only)
 */
router.post('/:id/messages', protect, authorize('student', 'company'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid conversation ID');
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return sendError(res, 400, 'Message content cannot be empty');
    }

    if (content.trim().length > 3000) {
      return sendError(res, 400, 'Message cannot exceed 3000 characters');
    }

    const conversation = await Conversation.findById(id).populate('company');
    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    // Identify participants and receiver
    const isStudent = conversation.student.toString() === req.user._id.toString();
    const isCompany =
      conversation.company?.user && conversation.company.user.toString() === req.user._id.toString();

    if (!isStudent && !isCompany) {
      return sendError(res, 403, 'You are not a participant in this conversation');
    }

    const sender = req.user._id;
    const receiver = isStudent ? conversation.company.user : conversation.student;

    if (!receiver) {
      return sendError(res, 400, 'Unable to identify message recipient');
    }

    const message = await Message.create({
      conversation: id,
      sender,
      receiver,
      content: content.trim(),
      readStatus: false,
    });

    // Update last message in conversation
    conversation.lastMessage = content.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatarUrl role')
      .populate('receiver', 'name avatarUrl role')
      .lean();

    // Broadcast via Socket.IO if available
    try {
      const io = getIO();
      if (io) {
        io.to(`chat_${id}`).emit('new_message', { message: populatedMessage });
        io.to(`user_${receiver.toString()}`).emit('notification', {
          type: 'new_message',
          title: `New message from ${req.user.name}`,
          message: content.trim(),
          referenceId: id,
        });
      }
    } catch {
      // Ignore if socket is not initialized
    }

    return sendSuccess(res, 201, 'Message sent successfully', { message: populatedMessage });
  } catch (error) {
    next(error);
  }
});

export default router;
