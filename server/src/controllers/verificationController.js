import { Verification } from '../models/Verification.js';
import { Company } from '../models/Company.js';
import { Notification } from '../models/Notification.js';
import { uploadFileToStorage } from '../services/storageService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
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
 * 1. Submit Verification Request
 * POST /api/verifications/request
 * Access: Private (Role: Reviewer, Company)
 */
export const submitVerification = async (req, res, next) => {
  try {
    let {
      verificationType,
      documentUrl,
      description = '',
      institutionOrOrg,
      designationOrRegNo,
    } = req.body;

    // Automatically align verificationType with user's role if not explicitly provided
    if (!verificationType) {
      verificationType = req.user.role === 'company' ? 'Company' : 'Reviewer';
    }

    const normalizedType = verificationType.toLowerCase();
    if (!['reviewer', 'company'].includes(normalizedType)) {
      return sendError(res, 400, "verificationType must be either 'Reviewer' or 'Company'");
    }

    // If file was uploaded via Multer
    if (req.file) {
      try {
        documentUrl = await uploadFileToStorage(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          'verification_proofs'
        );
      } catch (uploadErr) {
        return sendError(res, 500, `Failed to upload proof document: ${uploadErr.message}`);
      }
    }

    // Also support body field proofDocumentUrl
    if (!documentUrl && req.body.proofDocumentUrl) {
      documentUrl = req.body.proofDocumentUrl;
    }

    if (!documentUrl) {
      return sendError(res, 400, 'Proof document is required. Please provide a documentUrl or upload a file.');
    }

    // Check for existing pending request to prevent duplicate pending submissions
    const existingPending = await Verification.findOne({
      $or: [{ targetId: req.user._id }, { requester: req.user._id }],
      status: { $in: ['Pending', 'pending'] },
    });

    if (existingPending) {
      return sendError(
        res,
        400,
        'A pending verification request already exists for this account. Please wait for administrator review.'
      );
    }

    // Create verification request
    const verification = await Verification.create({
      targetId: req.user._id,
      targetModel: normalizedType === 'company' ? 'Company' : 'User',
      requester: req.user._id,
      verificationType: normalizedType === 'company' ? 'Company' : 'Reviewer',
      documentUrl,
      proofDocumentUrl: documentUrl,
      description: description.trim(),
      institutionOrOrg: (institutionOrOrg || description || req.user.name).trim(),
      designationOrRegNo: (designationOrRegNo || 'Pending Verification').trim(),
      status: 'Pending',
    });

    // If user is a company, update company verificationStatus to 'pending'
    if (req.user.role === 'company') {
      await Company.findOneAndUpdate(
        { user: req.user._id },
        { verificationStatus: 'pending' }
      );
    }

    return sendSuccess(
      res,
      201,
      'Verification request submitted successfully. Awaiting administrator review.',
      { verification }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get All Verification Requests
 * GET /api/verifications
 * Access: Private (Role: Admin)
 */
export const getAllVerifications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      // Support case-insensitive status matching (Pending/pending, Approved/approved, etc.)
      filter.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    const verifications = await Verification.find(filter)
      .sort({ createdAt: -1 })
      .populate('targetId', 'name email role avatarUrl')
      .populate('requester', 'name email role avatarUrl')
      .populate('reviewedBy', 'name email');

    // Aggregate statistics
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Verification.countDocuments({ status: { $in: ['Pending', 'pending'] } }),
      Verification.countDocuments({ status: { $in: ['Approved', 'approved'] } }),
      Verification.countDocuments({ status: { $in: ['Rejected', 'rejected'] } }),
    ]);

    return sendSuccess(res, 200, 'Verification requests retrieved successfully', {
      verifications,
      requests: verifications, // Backwards compatibility for frontend
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Update Verification Status (Approve / Reject)
 * PUT /api/verifications/:id/status
 * Access: Private (Role: Admin)
 */
export const updateVerificationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { status, adminNotes = '' } = req.body;

    if (!status) {
      return sendError(res, 400, "Please provide status ('Approved' or 'Rejected')");
    }

    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (!['Approved', 'Rejected'].includes(normalizedStatus)) {
      return sendError(res, 400, "Status must be either 'Approved' or 'Rejected'");
    }

    const verification = await Verification.findById(id).populate('targetId requester', 'name email role');
    if (!verification) {
      return sendError(res, 404, 'Verification request not found');
    }

    verification.status = normalizedStatus;
    verification.adminNotes = adminNotes;
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    await verification.save();

    const targetUserId = verification.targetId?._id || verification.requester?._id || verification.targetId;
    const isCompanyVerification = verification.verificationType?.toLowerCase() === 'company';

    // If company verification, sync verificationStatus on Company document
    if (isCompanyVerification && targetUserId) {
      await Company.findOneAndUpdate(
        { user: targetUserId },
        { verificationStatus: normalizedStatus === 'Approved' ? 'verified' : 'rejected' }
      );
    }

    // Send notification to the user
    if (targetUserId) {
      const notification = await Notification.create({
        recipient: targetUserId,
        sender: req.user._id,
        type: 'verification_update',
        title: `Verification Request ${normalizedStatus}`,
        message: normalizedStatus === 'Approved'
          ? `Congratulations! Your ${verification.verificationType} verification has been approved.`
          : `Your verification request was rejected. Notes: ${adminNotes || 'Please check your submitted credentials.'}`,
        referenceId: verification._id,
      });

      emitSocketNotification(targetUserId, notification);
    }

    return sendSuccess(res, 200, `Verification request successfully ${normalizedStatus.toLowerCase()}`, {
      verification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User's Verification Status
 * GET /api/verifications/my-status
 * Access: Private (Any authenticated user)
 */
export const getMyVerificationStatus = async (req, res, next) => {
  try {
    const latestVerification = await Verification.findOne({
      $or: [{ targetId: req.user._id }, { requester: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email');

    let companyDetails = null;
    if (req.user.role === 'company') {
      companyDetails = await Company.findOne({ user: req.user._id }).select('verificationStatus reputationScore reviewCount');
    }

    return sendSuccess(res, 200, 'Verification status retrieved', {
      verification: latestVerification || null,
      status: latestVerification ? latestVerification.status.toLowerCase() : 'unverified',
      company: companyDetails,
    });
  } catch (error) {
    next(error);
  }
};
