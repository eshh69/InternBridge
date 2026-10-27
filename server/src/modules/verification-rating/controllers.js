import { Verification } from '../../models/Verification.js';
import { Review } from '../../models/Review.js';
import { User } from '../../models/User.js';
import { Company } from '../../models/Company.js';
import { StudentProfile } from '../../models/StudentProfile.js';
import { Notification } from '../../models/Notification.js';
import { uploadFileToStorage } from '../../services/storageService.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { calculateAndSyncReputationScore } from './reputationService.js';
import { getIO } from '../../socket/index.js';

/**
 * Emit real-time notification to user room safely
 */
const emitSocketNotification = (userId, notification) => {
  try {
    const io = getIO();
    if (io) {
      io.to(`user_${userId.toString()}`).emit('notification', notification);
    }
  } catch (err) {
    // Socket server may not be initialized in test mode or socket disconnected
  }
};

/**
 * 1. Submit Verification Request
 * POST /api/v1/verifications/request
 * Access: Private (Role: reviewer, company)
 */
export const submitVerificationRequest = async (req, res) => {
  try {
    const { institutionOrOrg, designationOrRegNo } = req.body;
    let { verificationType } = req.body;

    // Automatically align verificationType with user's registered role if not explicitly provided
    if (!verificationType) {
      verificationType = req.user.role === 'company' ? 'company' : 'reviewer';
    }

    if (!['reviewer', 'company'].includes(verificationType)) {
      return sendError(res, 400, "verificationType must be either 'reviewer' or 'company'");
    }

    if (!institutionOrOrg || !designationOrRegNo) {
      return sendError(
        res,
        400,
        'Please provide both Institution/Organization name and Designation/Registration Number'
      );
    }

    let proofDocumentUrl = req.body.proofDocumentUrl;

    // If file uploaded via Multer
    if (req.file) {
      try {
        proofDocumentUrl = await uploadFileToStorage(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'verification_proofs'
        );
      } catch (uploadErr) {
        return sendError(res, 500, `Failed to upload proof document: ${uploadErr.message}`);
      }
    }

    if (!proofDocumentUrl) {
      return sendError(res, 400, 'Please upload a proof document or provide proofDocumentUrl');
    }

    // Check for existing pending request to avoid duplicates
    let verification = await Verification.findOne({
      requester: req.user._id,
      status: 'pending',
    });

    if (verification) {
      // Update the existing pending request with new details
      verification.verificationType = verificationType;
      verification.proofDocumentUrl = proofDocumentUrl;
      verification.institutionOrOrg = institutionOrOrg.trim();
      verification.designationOrRegNo = designationOrRegNo.trim();
      verification.adminNotes = '';
      await verification.save();
    } else {
      // Create new verification record
      verification = await Verification.create({
        requester: req.user._id,
        verificationType,
        proofDocumentUrl,
        institutionOrOrg: institutionOrOrg.trim(),
        designationOrRegNo: designationOrRegNo.trim(),
        status: 'pending',
      });
    }

    // If company, update verificationStatus to pending
    if (verificationType === 'company') {
      await Company.findOneAndUpdate(
        { user: req.user._id },
        { verificationStatus: 'pending' }
      );
    }

    return sendSuccess(res, 201, 'Verification request submitted successfully. Awaiting admin review.', {
      verification,
    });
  } catch (error) {
    return sendError(res, 500, `Failed to submit verification request: ${error.message}`);
  }
};

/**
 * 2. Get Current User's Verification Status
 * GET /api/v1/verifications/my-status
 * Access: Private (Any authenticated user)
 */
export const getMyVerificationStatus = async (req, res) => {
  try {
    const latestVerification = await Verification.findOne({ requester: req.user._id })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email');

    let companyDetails = null;
    if (req.user.role === 'company') {
      companyDetails = await Company.findOne({ user: req.user._id }).select('verificationStatus reputationScore reviewCount');
    }

    return sendSuccess(res, 200, 'Verification status retrieved', {
      verification: latestVerification || null,
      status: latestVerification ? latestVerification.status : 'unverified',
      company: companyDetails,
    });
  } catch (error) {
    return sendError(res, 500, `Failed to get verification status: ${error.message}`);
  }
};

/**
 * 3. Get Admin Verification Queue
 * GET /api/v1/verifications/pending
 * Access: Private (Role: admin)
 */
export const getPendingVerifications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    } else if (!status) {
      filter.status = 'pending';
    }

    const requests = await Verification.find(filter)
      .sort({ createdAt: -1 })
      .populate('requester', 'name email role avatarUrl')
      .populate('reviewedBy', 'name email');

    // Aggregate status counts for dashboard stats
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Verification.countDocuments({ status: 'pending' }),
      Verification.countDocuments({ status: 'approved' }),
      Verification.countDocuments({ status: 'rejected' }),
    ]);

    return sendSuccess(res, 200, 'Verification requests retrieved successfully', {
      requests,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      },
    });
  } catch (error) {
    return sendError(res, 500, `Failed to fetch verification queue: ${error.message}`);
  }
};

/**
 * 4. Admin Decision (Approve / Reject Verification)
 * PATCH /api/v1/verifications/:id/decision
 * Access: Private (Role: admin)
 */
export const reviewVerificationDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes = '' } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, 400, "Decision status must be either 'approved' or 'rejected'");
    }

    const verification = await Verification.findById(id).populate('requester', 'name email role');
    if (!verification) {
      return sendError(res, 404, 'Verification request not found');
    }

    verification.status = status;
    verification.adminNotes = adminNotes;
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    await verification.save();

    // If company verification, sync verification status with Company model
    if (verification.verificationType === 'company') {
      await Company.findOneAndUpdate(
        { user: verification.requester._id },
        { verificationStatus: status === 'approved' ? 'verified' : 'rejected' }
      );
    }

    // Send in-app notification to the requester
    const notification = await Notification.create({
      recipient: verification.requester._id,
      sender: req.user._id,
      type: 'verification_update',
      title: `Verification Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved'
        ? `Congratulations! Your ${verification.verificationType} verification has been approved.`
        : `Your verification request was rejected. Notes: ${adminNotes || 'Please check your submitted credentials.'}`,
      referenceId: verification._id,
    });

    emitSocketNotification(verification.requester._id, notification);

    return sendSuccess(res, 200, `Verification request successfully ${status}`, {
      verification,
    });
  } catch (error) {
    return sendError(res, 500, `Failed to process verification decision: ${error.message}`);
  }
};

/**
 * 5. Submit Multi-criteria Review
 * POST /api/v1/reviews
 * Access: Private (Role: reviewer)
 */
export const submitReview = async (req, res) => {
  try {
    const {
      targetType,
      targetStudentId,
      targetCompanyId,
      ratings = {},
      overallRating,
      comments,
    } = req.body;

    if (!['student', 'company'].includes(targetType)) {
      return sendError(res, 400, "targetType must be either 'student' or 'company'");
    }

    if (!comments || comments.trim().length === 0) {
      return sendError(res, 400, 'Review comment is required');
    }

    let targetStudent = null;
    let targetCompany = null;
    let targetOwnerUserId = null;

    if (targetType === 'student') {
      if (!targetStudentId) {
        return sendError(res, 400, 'targetStudentId is required when reviewing a student');
      }

      const studentUser = await User.findById(targetStudentId);
      if (!studentUser || studentUser.role !== 'student') {
        return sendError(res, 404, 'Target student user not found');
      }

      if (studentUser._id.toString() === req.user._id.toString()) {
        return sendError(res, 400, 'You cannot submit a review for yourself');
      }

      targetStudent = studentUser._id;
      targetOwnerUserId = studentUser._id;
    } else {
      if (!targetCompanyId) {
        return sendError(res, 400, 'targetCompanyId is required when reviewing a company');
      }

      // Check if targetCompanyId is Company _id or User _id
      const companyDoc = await Company.findOne({
        $or: [{ _id: targetCompanyId }, { user: targetCompanyId }],
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

    // Determine overall rating: if not provided or valid, compute average of criteria ratings
    let finalOverall = typeof overallRating === 'number' ? overallRating : 0;
    if (finalOverall < 1 || finalOverall > 5) {
      const ratingVals = Object.values(ratings).filter(
        (v) => typeof v === 'number' && v >= 1 && v <= 5
      );
      if (ratingVals.length > 0) {
        finalOverall = Math.round((ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length) * 10) / 10;
      } else {
        return sendError(res, 400, 'Please provide valid rating scores between 1 and 5');
      }
    }

    // Check if reviewer already reviewed this target
    const existingReviewQuery = {
      reviewer: req.user._id,
      targetType,
      ...(targetType === 'student' ? { targetStudent } : { targetCompany }),
    };

    let review = await Review.findOne(existingReviewQuery);

    if (review) {
      // Update existing review
      review.ratings = ratings;
      review.overallRating = finalOverall;
      review.comments = comments.trim();
      review.isVerifiedReview = true;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        reviewer: req.user._id,
        targetType,
        targetStudent,
        targetCompany,
        ratings,
        overallRating: finalOverall,
        comments: comments.trim(),
        isVerifiedReview: true,
      });
    }

    // Recalculate and synchronize aggregate reputation score for the target
    const syncTargetId = targetType === 'student' ? targetStudent : targetCompany;
    const reputationMetrics = await calculateAndSyncReputationScore(targetType, syncTargetId);

    // Send notification to the entity
    if (targetOwnerUserId) {
      const notification = await Notification.create({
        recipient: targetOwnerUserId,
        sender: req.user._id,
        type: 'new_review',
        title: 'New Academic Evaluation Received',
        message: `A verified academic evaluation with rating ${finalOverall}/5.0 has been posted.`,
        referenceId: review._id,
      });

      emitSocketNotification(targetOwnerUserId, notification);
    }

    return sendSuccess(res, 201, 'Review submitted successfully', {
      review,
      reputationMetrics,
    });
  } catch (error) {
    return sendError(res, 500, `Failed to submit review: ${error.message}`);
  }
};

/**
 * 6. Get Verified Reviews for Target Entity
 * GET /api/v1/reviews/target/:targetId
 * Access: Public / Authenticated
 */
export const getTargetReviews = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { targetType } = req.query;

    const query = {
      isVerifiedReview: true,
      $or: [{ targetStudent: targetId }, { targetCompany: targetId }],
    };

    if (targetType) {
      query.targetType = targetType;
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .populate('reviewer', 'name email avatarUrl');

    // Determine target type if not explicitly supplied
    let detectedTargetType = targetType;
    if (!detectedTargetType && reviews.length > 0) {
      detectedTargetType = reviews[0].targetType;
    }

    // If still unknown, check if targetId matches a user or company
    if (!detectedTargetType) {
      const maybeUser = await User.findById(targetId);
      detectedTargetType = maybeUser?.role === 'student' ? 'student' : 'company';
    }

    // Fetch aggregate reputation summary
    const summary = await calculateAndSyncReputationScore(detectedTargetType, targetId);

    return sendSuccess(res, 200, 'Reviews retrieved successfully', {
      reviews,
      summary,
    });
  } catch (error) {
    return sendError(res, 500, `Failed to retrieve reviews: ${error.message}`);
  }
};

/**
 * 7. Get Reviews Submitted by Logged-in Reviewer
 * GET /api/v1/reviews/my-reviews
 * Access: Private (Role: reviewer)
 */
export const getMySubmittedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('targetStudent', 'name email avatarUrl')
      .populate('targetCompany', 'name industry logoUrl');

    return sendSuccess(res, 200, 'Your submitted reviews retrieved successfully', {
      reviews,
    });
  } catch (error) {
    return sendError(res, 500, `Failed to retrieve submitted reviews: ${error.message}`);
  }
};

/**
 * 8. Search Review Targets (Students & Companies)
 * GET /api/v1/verifications/targets or GET /api/v1/reviews/targets
 * Access: Private (Reviewer, Admin)
 */
export const getReviewTargets = async (req, res) => {
  try {
    const { type = 'student', q = '' } = req.query;
    const searchQuery = q.trim();

    if (type === 'student') {
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

      // Attach profile info if available
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
    return sendError(res, 500, `Failed to fetch review targets: ${error.message}`);
  }
};
