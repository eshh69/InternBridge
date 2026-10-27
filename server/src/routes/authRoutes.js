import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { protect } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'internbridge_secret_fallback', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'User already exists with this email address');
    }

    const passwordHash = await User.hashPassword(password);
    const userRole = role && ['student', 'company', 'reviewer'].includes(role) ? role : 'student';

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: userRole,
    });

    const token = generateToken(user._id);

    return sendSuccess(res, 201, 'Registration successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Login user & get token
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (user.status === 'suspended') {
      return sendError(res, 403, 'Account is suspended. Please contact administrator.');
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 200, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Authenticate via Supabase Auth (Google, OAuth, etc.)
// @route   POST /api/v1/auth/supabase-login
// @access  Public
router.post('/supabase-login', async (req, res, next) => {
  try {
    const { email, name, avatarUrl, role, supabaseId } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email is required from Supabase authentication');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists in MongoDB
    let user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(supabaseId ? [{ supabaseId }] : []),
      ],
    });

    if (user) {
      if (user.status === 'suspended') {
        return sendError(res, 403, 'Account is suspended. Please contact administrator.');
      }

      let modified = false;
      if (!user.supabaseId && supabaseId) {
        user.supabaseId = supabaseId;
        modified = true;
      }
      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // Create new user in MongoDB
      const assignedRole = role && ['student', 'company', 'reviewer'].includes(role)
        ? role
        : 'student';

      user = await User.create({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        avatarUrl: avatarUrl || null,
        role: assignedRole,
        authProvider: 'supabase',
        supabaseId: supabaseId || null,
      });

      // Auto-initialize profile skeleton if student
      if (assignedRole === 'student') {
        await StudentProfile.create({
          user: user._id,
          university: 'South Eastern University of Sri Lanka',
          degree: 'BSc in Information and Communication Technology',
          fieldOfStudy: 'Information and Communication Technology',
          academicYear: '3rd Year',
          skills: [],
          education: [],
          projects: [],
          certificates: [],
          badges: [],
          experience: [],
          links: { github: '', linkedin: '', portfolio: '' },
        });
      }
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 200, 'Supabase authentication successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged in user session
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  return sendSuccess(res, 200, 'Current session retrieved', {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatarUrl: req.user.avatarUrl,
      createdAt: req.user.createdAt,
    },
  });
});

export default router;
