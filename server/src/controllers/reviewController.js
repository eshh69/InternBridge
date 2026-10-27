import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { calculateAndSyncReputationScore } from '../modules/verification-rating/reputationService.js';
import { getIO } from '../socket/index.js';

/**
 * Helper to emit real-time notifications via Socket.IO
 */
const emitSocketNotification = (userId, notification) => {
  try {
    const io = getIO();
    if (io) {
      io.to(`user_${userId.toString()}`).emit('notification', notification);
    }
  } catch (err) {
    // Socket server may not be active in test modes
  }
};

/**
 * 1. Create Multi-Criteria Review
 * POST /api/reviews
 * Access: Private (Role: Reviewer)
 */
export const createReview = async (req, res, next) => {
  try {
    const {
      targetId,
      targetType,
      targetStudentId,
      targetCompanyId,
      ratingCriteria = {},
      ratings = {},
      comments,
    } = req.body;

    const actualTargetId = targetId || targetStudentId || targetCompanyId;
    if (!actualTargetId) {
      return sendError(res, 400, 'targetId is required');
    }

    if (!mongoose.Types.ObjectId.isValid(actualTargetId)) {
      return sendError(res, 400, 'Invalid targetId format');
    }

    const normalizedTargetType = (targetType || (targetCompanyId ? 'Company' : 'Student'))
      .toLowerCase();

    if (!['student', 'company'].includes(normalizedTargetType)) {
      return sendError(res, 400, "targetType must be either 'Student' or 'Company'");
    }

    if (!comments || comments.trim().length === 0) {
      return sendError(res, 400, 'Review comment is required');
    }

    // Merge criteria inputs
    const mergedCriteria = { ...ratings, ...ratingCriteria };

    // Automatically calculate overallRating as the average of the criteria
    const criteriaValues = Object.values(mergedCriteria).filter(
      (val) => typeof val === 'number' && val >= 1 && val <= 5
    );

    let overallRating;
    if (criteriaValues.length > 0) {
      const sum = criteriaValues.reduce((acc, curr) => acc + curr, 0);
      overallRating = Math.round((sum / criteriaValues.length) * 10) / 10;
    } else if (typeof req.body.overallRating === 'number') {
      overallRating = req.body.overallRating;
    } else {
      return sendError(res, 400, 'Please provide valid rating scores between 1 and 5');
    }

    let targetStudent = null;
    let targetCompany = null;
    let targetOwnerUserId = null;

    if (normalizedTargetType === 'student') {
      const studentUser = await User.findById(actualTargetId);
      if (!studentUser || studentUser.role !== 'student') {
        return sendError(res, 404, 'Target student user not found');
      }

      if (studentUser._id.toString() === req.user._id.toString()) {
        return sendError(res, 400, 'You cannot submit a review for yourself');
      }

      targetStudent = studentUser._id;
      targetOwnerUserId = studentUser._id;
    } else {
      const companyDoc = await Company.findOne({
        $or: [{ _id: actualTargetId }, { user: actualTargetId }],
      });

      if (!companyDoc) {
        return sendError(res, 404, 'Target company not found');
      }

      if (companyDoc.user.toString() === req.user._id.toString()) {
        return sendError(res, 400, 'You cannot submit a review for your own company');
      }

      targetCompany = companyDoc._id;
      targetOwnerUserId = companyDoc.user;
    }

    // Check for existing review by this reviewer for the target
    let review = await Review.findOne({
      $or: [{ reviewerId: req.user._id }, { reviewer: req.user._id }],
      $or: [
        { targetId: actualTargetId },
        { targetStudent: actualTargetId },
        { targetCompany: actualTargetId },
      ],
    });

    const isStudent = normalizedTargetType === 'student';

    if (review) {
      // Update existing review
      review.targetId = actualTargetId;
      review.targetType = isStudent ? 'Student' : 'Company';
      review.ratingCriteria = mergedCriteria;
      review.ratings = mergedCriteria;
      review.overallRating = overallRating;
      review.comments = comments.trim();
      review.isVerified = true;
      review.isVerifiedReview = true;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        reviewerId: req.user._id,
        reviewer: req.user._id,
        targetId: actualTargetId,
        targetType: isStudent ? 'Student' : 'Company',
        targetStudent,
        targetCompany,
        ratingCriteria: mergedCriteria,
        ratings: mergedCriteria,
        overallRating,
        comments: comments.trim(),
        isVerified: true,
        isVerifiedReview: true,
      });
    }

    // Synchronize aggregate reputation score
    const syncTargetId = isStudent ? targetStudent : targetCompany;
    const reputationMetrics = await calculateAndSyncReputationScore(normalizedTargetType, syncTargetId);

    // Send in-app notification to the target entity
    if (targetOwnerUserId) {
      const notification = await Notification.create({
        recipient: targetOwnerUserId,
        sender: req.user._id,
        type: 'new_review',
        title: 'New Verified Evaluation Received',
        message: `An evaluation with overall rating ${overallRating}/5.0 has been posted.`,
        referenceId: review._id,
      });

      emitSocketNotification(targetOwnerUserId, notification);
    }

    return sendSuccess(res, 201, 'Review submitted successfully', {
      review,
      overallRating,
      reputationMetrics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get All Reviews & Reputation for Target Entity
 * GET /api/reviews/:targetId
 * Access: Public / Authenticated
 */
export const getTargetReviewsAndReputation = async (req, res, next) => {
  try {
    const { targetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return sendError(res, 400, 'Invalid targetId format');
    }

    const reviews = await Review.find({
      $or: [
        { targetId },
        { targetStudent: targetId },
        { targetCompany: targetId },
      ],
      $or: [{ isVerified: true }, { isVerifiedReview: true }],
    })
      .sort({ createdAt: -1 })
      .populate('reviewerId reviewer', 'name email avatarUrl');

    const totalReviews = reviews.length;

    let averageRating = 0;
    let reputationScore = 0; // out of 100

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => acc + (curr.overallRating || 0), 0);
      averageRating = Math.round((sum / totalReviews) * 10) / 10;
      reputationScore = Math.round((averageRating / 5) * 100);
    }

    // Determine target type
    let targetType = 'Student';
    if (reviews.length > 0) {
      targetType = reviews[0].targetType;
    } else {
      const maybeUser = await User.findById(targetId);
      if (maybeUser && maybeUser.role === 'company') {
        targetType = 'Company';
      }
    }

    // Also get detailed breakdown for frontend components
    const summary = await calculateAndSyncReputationScore(targetType.toLowerCase(), targetId);

    return sendSuccess(res, 200, 'Target reviews and reputation retrieved successfully', {
      targetId,
      totalReviews,
      averageRating,
      reputationScore, // out of 100
      summary,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Reviews Submitted by Current Reviewer
 * GET /api/reviews/my-reviews
 */
export const getMySubmittedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      $or: [{ reviewerId: req.user._id }, { reviewer: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('targetStudent', 'name email avatarUrl')
      .populate('targetCompany', 'name industry logoUrl')
      .populate('targetId', 'name email avatarUrl');

    return sendSuccess(res, 200, 'Your submitted reviews retrieved successfully', {
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search Review Targets (Students & Companies)
 * GET /api/reviews/targets
 */
export const getReviewTargets = async (req, res, next) => {
  try {
    const { type = 'student', q = '' } = req.query;
    const searchQuery = q.trim();

    if (type.toLowerCase() === 'student') {
      const filter = { role: 'student', status: 'active' };
      if (searchQuery) {
        filter.$or = [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
        ];
      }

      const students = await User.find(filter)
        .select('name email avatarUrl')
        .limit(20);

      const studentIds = students.map((s) => s._id);
      const profiles = await StudentProfile.find({ user: { $in: studentIds } })
        .select('user university degree fieldOfStudy reputationScore reviewCount');

      const profileMap = new Map();
      profiles.forEach((p) => profileMap.set(p.user.toString(), p));

      const results = students.map((s) => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        avatarUrl: s.avatarUrl,
        profile: profileMap.get(s._id.toString()) || null,
      }));

      return sendSuccess(res, 200, 'Student candidates retrieved', { targets: results });
    } else {
      const filter = {};
      if (searchQuery) {
        filter.$or = [
          { name: { $regex: searchQuery, $options: 'i' } },
          { industry: { $regex: searchQuery, $options: 'i' } },
        ];
      }

      const companies = await Company.find(filter)
        .select('name industry location logoUrl verificationStatus reputationScore reviewCount user')
        .limit(20);

      return sendSuccess(res, 200, 'Company targets retrieved', { targets: companies });
    }
  } catch (error) {
    next(error);
  }
};
