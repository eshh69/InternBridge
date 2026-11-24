import express from 'express';
import jwt from 'jsonwebtoken';
import { Internship } from '../../models/Internship.js';
import { StudentProfile } from '../../models/StudentProfile.js';
import { Company } from '../../models/Company.js';
import { User } from '../../models/User.js';
import { protect, authorize } from '../../middleware/auth.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import {
  calculateInternshipMatch,
  calculateCandidateMatch,
  normalizeSkill,
  SKILL_SYNONYMS,
} from './matchingEngine.js';

const router = express.Router();
export const matchRoutes = express.Router();

const escapeRegex = (str = '') => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getOptionalStudentProfile = async (req) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'internbridge_secret_fallback'
    );
    if (!decoded?.id) return null;

    const user = await User.findById(decoded.id).select('role status');
    if (!user || user.status === 'suspended' || user.role !== 'student') {
      return null;
    }

    const profile = await StudentProfile.findOne({ user: user._id });
    return profile;
  } catch {
    return null;
  }
};

const handleSearchInternships = async (req, res) => {
  try {
    const {
      keyword,
      skills,
      locationType,
      area,
      durationMonths,
      isPaid,
      minMatch,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { status: 'published' };

    if (keyword && keyword.trim()) {
      const escaped = escapeRegex(keyword.trim());
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { area: regex },
        { location: regex },
      ];
    }

    if (skills && skills.trim()) {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      if (skillsArray.length > 0) {
        const queryVariants = new Set(skillsArray);
        for (const s of skillsArray) {
          const canonical = normalizeSkill(s);
          if (canonical && SKILL_SYNONYMS[canonical]) {
            for (const alias of SKILL_SYNONYMS[canonical]) {
              queryVariants.add(alias);
            }
          }
          if (['html', 'css', 'html5', 'css3', 'html & css'].includes(s)) {
            queryVariants.add('html & css');
            queryVariants.add('html');
            queryVariants.add('css');
          }
        }

        filter.requiredSkills = {
          $in: Array.from(queryVariants).map((s) => new RegExp(`^${escapeRegex(s)}$`, 'i')),
        };
      }
    }

    if (locationType && locationType !== 'All' && ['On-site', 'Remote', 'Hybrid'].includes(locationType)) {
      filter.locationType = locationType;
    }

    if (area && area !== 'All' && area.trim()) {
      filter.area = new RegExp(escapeRegex(area.trim()), 'i');
    }

    if (durationMonths && !isNaN(Number(durationMonths))) {
      filter.durationMonths = { $lte: Number(durationMonths) };
    }

    if (isPaid === 'true') {
      filter['stipend.isPaid'] = true;
    }

    const studentProfile = await getOptionalStudentProfile(req);

    let sortOptions = { createdAt: -1 };
    if (sort === 'deadline') {
      sortOptions = { deadline: 1 };
    } else if (sort === 'duration') {
      sortOptions = { durationMonths: 1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));

    if (sort === 'highest_match' && studentProfile) {
      const allInternships = await Internship.find(filter)
        .populate('company', 'name logoUrl location industry description website verificationStatus reputationScore reviewCount')
        .lean();

      let scoredItems = allInternships.map((item) => {
        const matchResult = calculateInternshipMatch(studentProfile, item);
        return {
          ...item,
          matchScore: matchResult.matchScore,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          matchLevel: matchResult.matchLevel,
          matchBreakdown: matchResult.breakdown,
        };
      });

      if (minMatch && !isNaN(Number(minMatch))) {
        const threshold = Number(minMatch);
        scoredItems = scoredItems.filter((item) => item.matchScore >= threshold);
      }

      scoredItems.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      const total = scoredItems.length;
      const pages = Math.ceil(total / limitNum) || 1;
      const paginatedItems = scoredItems.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return sendSuccess(res, 200, 'Internships retrieved successfully', {
        items: paginatedItems,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages,
        },
      });
    }

    const total = await Internship.countDocuments(filter);
    const pages = Math.ceil(total / limitNum) || 1;

    const rawInternships = await Internship.find(filter)
      .sort(sortOptions)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('company', 'name logoUrl location industry description website verificationStatus reputationScore reviewCount')
      .lean();

    const items = rawInternships.map((item) => {
      if (studentProfile) {
        const matchResult = calculateInternshipMatch(studentProfile, item);
        return {
          ...item,
          matchScore: matchResult.matchScore,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          matchLevel: matchResult.matchLevel,
          matchBreakdown: matchResult.breakdown,
        };
      }
      return item;
    });

    return sendSuccess(res, 200, 'Internships retrieved successfully', {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages,
      },
    });
  } catch (error) {
    console.error('Error searching internships:', error);
    return sendError(res, 500, 'Failed to search internships: ' + error.message);
  }
};

const handleSearchStudents = async (req, res) => {
  try {
    const {
      skills,
      degree,
      university,
      fieldOfStudy,
      academicYear,
      minGpa,
      keyword,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (academicYear && academicYear !== 'All') {
      filter.academicYear = academicYear;
    }

    if (university && university.trim()) {
      filter.university = new RegExp(escapeRegex(university.trim()), 'i');
    }

    if (degree && degree.trim()) {
      filter.degree = new RegExp(escapeRegex(degree.trim()), 'i');
    }

    if (fieldOfStudy && fieldOfStudy.trim()) {
      filter.fieldOfStudy = new RegExp(escapeRegex(fieldOfStudy.trim()), 'i');
    }

    if (minGpa && !isNaN(Number(minGpa))) {
      filter.gpa = { $gte: Number(minGpa) };
    }

    const parsedSkills = skills
      ? skills
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [];

    if (parsedSkills.length > 0) {
      filter.skills = {
        $in: parsedSkills.map((s) => new RegExp(`^${escapeRegex(s)}$`, 'i')),
      };
    }

    if (keyword && keyword.trim()) {
      const kwRegex = new RegExp(escapeRegex(keyword.trim()), 'i');
      filter.$or = [
        { university: kwRegex },
        { degree: kwRegex },
        { fieldOfStudy: kwRegex },
        { bio: kwRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));

    const rawProfiles = await StudentProfile.find(filter)
      .populate({
        path: 'user',
        select: 'name email avatarUrl status',
        match: { status: 'active' },
      })
      .lean();

    const activeProfiles = rawProfiles.filter((p) => p.user !== null);

    const scoredCandidates = activeProfiles.map((candidate) => {
      const matchResult = calculateCandidateMatch(candidate, parsedSkills, fieldOfStudy || '');
      return {
        ...candidate,
        matchScore: matchResult.matchScore,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
      };
    });

    if (parsedSkills.length > 0) {
      scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
    } else {
      scoredCandidates.sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0));
    }

    const total = scoredCandidates.length;
    const pages = Math.ceil(total / limitNum) || 1;
    const paginatedItems = scoredCandidates.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return sendSuccess(res, 200, 'Candidate students retrieved successfully', {
      items: paginatedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages,
      },
    });
  } catch (error) {
    console.error('Error searching candidate students:', error);
    return sendError(res, 500, 'Failed to search candidate students: ' + error.message);
  }
};

const handleStudentMatchRecommendations = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id }).lean();

    if (!studentProfile) {
      return sendSuccess(res, 200, 'Please complete your student portfolio to view personalized match recommendations', {
        items: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      });
    }

    const internships = await Internship.find({ status: 'published' })
      .populate('company', 'name logoUrl location industry description website verificationStatus reputationScore reviewCount')
      .lean();

    const scored = internships.map((item) => {
      const matchResult = calculateInternshipMatch(studentProfile, item);
      return {
        ...item,
        matchScore: matchResult.matchScore,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        matchLevel: matchResult.matchLevel,
        matchBreakdown: matchResult.breakdown,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    const total = scored.length;
    const pages = Math.ceil(total / limitNum) || 1;
    const paginatedItems = scored.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return sendSuccess(res, 200, 'Personalized matching internships retrieved successfully', {
      items: paginatedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages,
      },
    });
  } catch (error) {
    console.error('Error matching internships for student:', error);
    return sendError(res, 500, 'Failed to match internships: ' + error.message);
  }
};

const handlePostCandidateMatching = async (req, res) => {
  try {
    const { id } = req.params;
    const internship = await Internship.findById(id).lean();

    if (!internship) {
      return sendError(res, 404, 'Internship listing not found');
    }

    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user._id }).lean();
      if (!company || String(internship.company) !== String(company._id)) {
        return sendError(res, 403, 'Access denied. You can only view candidate matches for your own internships.');
      }
    }

    const profiles = await StudentProfile.find()
      .populate({
        path: 'user',
        select: 'name email avatarUrl status',
        match: { status: 'active' },
      })
      .lean();

    const activeProfiles = profiles.filter((p) => p.user !== null);

    const scoredCandidates = activeProfiles.map((candidate) => {
      const matchResult = calculateInternshipMatch(candidate, internship);
      return {
        ...candidate,
        matchScore: matchResult.matchScore,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        matchLevel: matchResult.matchLevel,
        matchBreakdown: matchResult.breakdown,
      };
    });

    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    const total = scoredCandidates.length;
    const pages = Math.ceil(total / limitNum) || 1;
    const paginatedItems = scoredCandidates.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return sendSuccess(res, 200, 'Ranked candidates for internship retrieved successfully', {
      internship: {
        id: internship._id,
        title: internship.title,
        requiredSkills: internship.requiredSkills,
      },
      items: paginatedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages,
      },
    });
  } catch (error) {
    console.error('Error matching candidates for internship:', error);
    return sendError(res, 500, 'Failed to match candidates: ' + error.message);
  }
};

router.get('/internships', handleSearchInternships);
router.get('/students', protect, authorize('company', 'admin'), handleSearchStudents);
router.get('/match/internships', protect, authorize('student'), handleStudentMatchRecommendations);
router.get('/match/internship/:id/candidates', protect, authorize('company', 'admin'), handlePostCandidateMatching);

matchRoutes.get('/internships', protect, authorize('student'), handleStudentMatchRecommendations);
matchRoutes.get('/internship/:id/candidates', protect, authorize('company', 'admin'), handlePostCandidateMatching);

export default router;
