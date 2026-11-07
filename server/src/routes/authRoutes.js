import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';
import { protect } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();
const attachCompanyProfile = async (userDoc) => {
  if (!userDoc || userDoc.role !== 'company') return null;
  try {
    const comp = await Company.findOne({ user: userDoc._id || userDoc.id }).select('name logoUrl industry verificationStatus');
    return comp ? { name: comp.name, logoUrl: comp.logoUrl, industry: comp.industry, verificationStatus: comp.verificationStatus } : null;
  } catch {
    return null;
  }
};


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'internbridge_secret_fallback', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Check if user email already exists
// @route   POST /api/v1/auth/check-user
// @access  Public
router.post('/check-user', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 400, 'Email is required');
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return sendSuccess(res, 200, 'User check completed', {
      exists: Boolean(user),
      role: user ? user.role : null,
      name: user ? user.name : null,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Register a new user with role-specific details
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      age,
      phone,
      authProvider,
      supabaseId,
      avatarUrl,
      studentDetails,
      studentData,
      companyDetails,
      companyData,
      reviewerDetails,
      reviewerData,
    } = req.body;

    const effectiveStudentDetails = studentDetails || studentData || {};
    const effectiveCompanyDetails = companyDetails || companyData || {};
    const effectiveReviewerDetails = reviewerDetails || reviewerData || {};

    const isOAuth = authProvider === 'supabase' || authProvider === 'google';

    if (!name || !email || (!isOAuth && !password)) {
      return sendError(res, 400, isOAuth ? 'Please provide name and email' : 'Please provide name, email, and password');
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(supabaseId ? [{ supabaseId }] : []),
      ],
    });

    if (user && !isOAuth) {
      return sendError(res, 400, 'User already exists with this email address');
    }

    const passwordHash = password ? await User.hashPassword(password) : undefined;
    const userRole = ['student', 'company', 'reviewer'].includes(role) ? role : 'student';
    const parsedAge = age ? parseInt(age, 10) : null;

    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        ...(passwordHash ? { passwordHash } : {}),
        role: userRole,
        age: isNaN(parsedAge) ? null : parsedAge,
        phone: phone ? phone.trim() : '',
        authProvider: isOAuth ? 'supabase' : 'local',
        supabaseId: supabaseId || null,
        avatarUrl: avatarUrl || null,
      });
    } else {
      user.role = userRole;
      if (name) user.name = name.trim();
      if (!isNaN(parsedAge) && parsedAge) user.age = parsedAge;
      if (phone) user.phone = phone.trim();
      if (isOAuth) user.authProvider = 'supabase';
      if (supabaseId) user.supabaseId = supabaseId;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }

    // Auto-create role-specific profile document
    if (userRole === 'student') {
      const skillsArray = Array.isArray(effectiveStudentDetails?.skills)
        ? effectiveStudentDetails.skills.map((s) => s.trim().toLowerCase()).filter(Boolean)
        : typeof effectiveStudentDetails?.skills === 'string'
        ? effectiveStudentDetails.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
        : [];

      await StudentProfile.create({
        user: user._id,
        university: effectiveStudentDetails?.university?.trim() || 'South Eastern University of Sri Lanka',
        degree: effectiveStudentDetails?.degree?.trim() || 'BSc in Information and Communication Technology',
        fieldOfStudy: effectiveStudentDetails?.fieldOfStudy?.trim() || 'Information and Communication Technology',
        academicYear: effectiveStudentDetails?.academicYear || '3rd Year',
        phone: phone?.trim() || effectiveStudentDetails?.phone?.trim() || '',
        whatsapp: effectiveStudentDetails?.whatsapp?.trim() || '',
        bio: effectiveStudentDetails?.bio?.trim() || '',
        skills: skillsArray,
        education: [],
        projects: [],
        certificates: [],
        badges: [],
        experience: [],
        links: { github: '', linkedin: '', portfolio: '' },
      });
    } else if (userRole === 'company') {
      const compAddress =
        effectiveCompanyDetails?.location?.address || effectiveCompanyDetails?.address || 'Colombo, Sri Lanka';
      const compCity =
        effectiveCompanyDetails?.location?.city || effectiveCompanyDetails?.city || 'Colombo';
      const compCountry =
        effectiveCompanyDetails?.location?.country || effectiveCompanyDetails?.country || 'Sri Lanka';

      let comp = await Company.findOne({ user: user._id });
      if (!comp) {
        await Company.create({
          user: user._id,
          name: effectiveCompanyDetails?.name?.trim() || name.trim(),
          description:
            effectiveCompanyDetails?.description?.trim() ||
            'Innovative technology and business organization offering professional internships.',
          industry: effectiveCompanyDetails?.industry?.trim() || 'Software Engineering',
          location: {
            address: compAddress,
            city: compCity,
            country: compCountry,
          },
          website: effectiveCompanyDetails?.website?.trim() || '',
          contactEmail: effectiveCompanyDetails?.contactEmail?.trim() || normalizedEmail,
          contactPhone: phone?.trim() || effectiveCompanyDetails?.contactPhone?.trim() || '',
          verificationStatus: 'unverified',
        });
      } else {
        if (effectiveCompanyDetails?.name) comp.name = effectiveCompanyDetails.name.trim();
        if (effectiveCompanyDetails?.industry) comp.industry = effectiveCompanyDetails.industry.trim();
        if (effectiveCompanyDetails?.city || effectiveCompanyDetails?.location?.city) {
          comp.location = comp.location || {};
          comp.location.city = effectiveCompanyDetails.city || effectiveCompanyDetails.location?.city;
        }
        await comp.save();
      }
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 201, 'Registration successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        phone: user.phone,
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

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
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
        age: user.age,
        phone: user.phone,
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
    const {
      email,
      name,
      avatarUrl,
      role,
      supabaseId,
      age,
      phone,
      studentDetails,
      studentData,
      companyDetails,
      companyData,
      reviewerDetails,
      reviewerData,
    } = req.body;

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

    const parsedAge = age ? parseInt(age, 10) : null;

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
      if (!user.age && !isNaN(parsedAge) && parsedAge) {
        user.age = parsedAge;
        modified = true;
      }
      if (!user.phone && phone) {
        user.phone = phone.trim();
        modified = true;
      }
      if (modified) {
        await user.save();
      }

      if (user.role === 'company') {
        let existingComp = await Company.findOne({ user: user._id });
        const effComp = companyDetails || companyData || {};
        if (!existingComp) {
          const compAddress = effComp?.location?.address || effComp?.address || 'Colombo, Sri Lanka';
          const compCity = effComp?.location?.city || effComp?.city || 'Colombo';
          const compCountry = effComp?.location?.country || effComp?.country || 'Sri Lanka';
          await Company.create({
            user: user._id,
            name: effComp?.name?.trim() || user.name || normalizedEmail.split('@')[0],
            description:
              effComp?.description?.trim() ||
              'Leading business organization offering impactful internship and recruitment opportunities.',
            industry: effComp?.industry?.trim() || 'Technology & Innovation',
            location: {
              address: compAddress,
              city: compCity,
              country: compCountry,
            },
            website: effComp?.website?.trim() || '',
            contactEmail: effComp?.contactEmail?.trim() || normalizedEmail,
            contactPhone: phone?.trim() || effComp?.contactPhone?.trim() || '',
            verificationStatus: 'unverified',
          });
        }
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
        age: isNaN(parsedAge) ? null : parsedAge,
        phone: phone ? phone.trim() : '',
        authProvider: 'supabase',
        supabaseId: supabaseId || null,
      });

      // Auto-initialize profile skeleton if student
      if (assignedRole === 'student') {
        const skillsArray = Array.isArray(studentDetails?.skills)
          ? studentDetails.skills.map((s) => s.trim().toLowerCase()).filter(Boolean)
          : typeof studentDetails?.skills === 'string'
          ? studentDetails.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
          : [];

        await StudentProfile.create({
          user: user._id,
          university: studentDetails?.university?.trim() || 'South Eastern University of Sri Lanka',
          degree: studentDetails?.degree?.trim() || 'BSc in Information and Communication Technology',
          fieldOfStudy: studentDetails?.fieldOfStudy?.trim() || 'Information and Communication Technology',
          academicYear: studentDetails?.academicYear || '3rd Year',
          phone: phone?.trim() || studentDetails?.phone?.trim() || '',
          whatsapp: studentDetails?.whatsapp?.trim() || '',
          bio: studentDetails?.bio?.trim() || '',
          skills: skillsArray,
          education: [],
          projects: [],
          certificates: [],
          badges: [],
          experience: [],
          links: { github: '', linkedin: '', portfolio: '' },
        });
      } else if (assignedRole === 'company') {
        const effComp = companyDetails || companyData || {};
        const compAddress = effComp?.location?.address || effComp?.address || 'Colombo, Sri Lanka';
        const compCity = effComp?.location?.city || effComp?.city || 'Colombo';
        const compCountry = effComp?.location?.country || effComp?.country || 'Sri Lanka';

        await Company.create({
          user: user._id,
          name: effComp?.name?.trim() || name || normalizedEmail.split('@')[0],
          description:
            effComp?.description?.trim() ||
            'Leading business organization offering impactful internship and recruitment opportunities.',
          industry: effComp?.industry?.trim() || 'Technology & Innovation',
          location: {
            address: compAddress,
            city: compCity,
            country: compCountry,
          },
          website: effComp?.website?.trim() || '',
          contactEmail: effComp?.contactEmail?.trim() || normalizedEmail,
          contactPhone: phone?.trim() || effComp?.contactPhone?.trim() || '',
          verificationStatus: 'unverified',
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
        age: user.age,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    // Handle race conditions where multiple requests created the user concurrently
    if (error.code === 11000) {
      try {
        const normalizedEmail = req.body.email ? req.body.email.toLowerCase().trim() : '';
        const user = await User.findOne({
          $or: [
            { email: normalizedEmail },
            ...(req.body.supabaseId ? [{ supabaseId: req.body.supabaseId }] : []),
          ],
        });
        if (user) {
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
        }
      } catch (innerErr) {
        return next(innerErr);
      }
    }
    next(error);
  }
});

// @desc    Get current logged in user session
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  const companyInfo = await attachCompanyProfile(req.user);
  return sendSuccess(res, 200, 'Current session retrieved', {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      age: req.user.age,
      phone: req.user.phone,
      avatarUrl: req.user.avatarUrl,
      createdAt: req.user.createdAt,
      company: companyInfo,
    },
  });
});

export default router;
