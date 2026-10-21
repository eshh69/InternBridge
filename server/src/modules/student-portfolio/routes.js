import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { protect, authorize } from '../../middleware/auth.js';
import { StudentProfile } from '../../models/StudentProfile.js';
import { uploadFileToStorage } from '../../services/storageService.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

const router = express.Router();

// Memory storage for multer file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
  },
});

// Middleware wrapper for multer error handling
const handleUpload = (req, res, next) => {
  upload.single('cv')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 400, 'File size exceeds the 5MB limit');
      }
      return sendError(res, 400, `Upload error: ${err.message}`);
    } else if (err) {
      return sendError(res, 400, err.message);
    }
    next();
  });
};

// @desc    Get current student profile
// @route   GET /api/v1/students/me
// @access  Private (student)
router.get('/me', protect, authorize('student'), async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email avatarUrl role'
    );

    if (!profile) {
      // Auto-initialize profile skeleton for the authenticated student
      profile = await StudentProfile.create({
        user: req.user._id,
        university: 'South Eastern University of Sri Lanka',
        degree: 'BSc in Information and Communication Technology',
        fieldOfStudy: 'Information and Communication Technology',
        academicYear: '3rd Year',
        gpa: null,
        bio: '',
        skills: [],
        education: [],
        projects: [],
        certificates: [],
        badges: [],
        experience: [],
        links: {
          github: '',
          linkedin: '',
          portfolio: '',
        },
      });

      profile = await profile.populate('user', 'name email avatarUrl role');
    }

    return sendSuccess(res, 200, 'Student profile retrieved successfully', { profile });
  } catch (error) {
    next(error);
  }
});

// @desc    Update current student profile
// @route   PUT /api/v1/students/me
// @access  Private (student)
router.put('/me', protect, authorize('student'), async (req, res, next) => {
  try {
    const {
      university,
      degree,
      fieldOfStudy,
      academicYear,
      gpa,
      bio,
      skills,
      education,
      projects,
      certificates,
      badges,
      experience,
      links,
    } = req.body;

    const updateFields = {};

    if (university !== undefined) updateFields.university = university.trim();
    if (degree !== undefined) updateFields.degree = degree.trim();
    if (fieldOfStudy !== undefined) updateFields.fieldOfStudy = fieldOfStudy.trim();
    if (academicYear !== undefined) updateFields.academicYear = academicYear;
    if (gpa !== undefined) updateFields.gpa = gpa === '' || gpa === null ? null : Number(gpa);
    if (bio !== undefined) updateFields.bio = bio.trim();

    // Sanitize skills: ensure array of lowercase, trimmed, unique strings
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        updateFields.skills = Array.from(
          new Set(
            skills
              .filter((s) => typeof s === 'string' && s.trim().length > 0)
              .map((s) => s.trim().toLowerCase())
          )
        );
      } else {
        updateFields.skills = [];
      }
    }

    if (education !== undefined && Array.isArray(education)) {
      updateFields.education = education;
    }

    if (projects !== undefined && Array.isArray(projects)) {
      updateFields.projects = projects;
    }

    if (certificates !== undefined && Array.isArray(certificates)) {
      updateFields.certificates = certificates;
    }

    if (badges !== undefined && Array.isArray(badges)) {
      updateFields.badges = badges;
    }

    if (experience !== undefined && Array.isArray(experience)) {
      updateFields.experience = experience;
    }

    if (links !== undefined && typeof links === 'object') {
      updateFields.links = {
        github: links.github || '',
        linkedin: links.linkedin || '',
        portfolio: links.portfolio || '',
      };
    }

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email avatarUrl role');

    return sendSuccess(res, 200, 'Student profile updated successfully', {
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload CV to storage and update profile
// @route   POST /api/v1/students/upload-cv
// @access  Private (student)
router.post('/upload-cv', protect, authorize('student'), handleUpload, async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please select a CV file to upload');
    }

    const folder = `resumes/${req.user._id}`;
    const cvUrl = await uploadFileToStorage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { cvUrl } },
      { new: true, upsert: true }
    ).populate('user', 'name email avatarUrl role');

    return sendSuccess(res, 200, 'CV uploaded successfully', {
      cvUrl,
      profile,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    View public student profile
// @route   GET /api/v1/students/:id
// @access  Private (any authenticated role)
router.get('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid student ID format');
    }

    let profile = await StudentProfile.findById(id).populate(
      'user',
      'name email avatarUrl role'
    );

    if (!profile) {
      profile = await StudentProfile.findOne({ user: id }).populate(
        'user',
        'name email avatarUrl role'
      );
    }

    if (!profile) {
      return sendError(res, 404, 'Student profile not found');
    }

    return sendSuccess(res, 200, 'Student profile retrieved successfully', { profile });
  } catch (error) {
    next(error);
  }
});

export default router;
