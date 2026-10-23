import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../../middleware/auth.js';
import {
  submitVerificationRequest,
  getMyVerificationStatus,
  getPendingVerifications,
  reviewVerificationDecision,
  submitReview,
  getTargetReviews,
  getMySubmittedReviews,
  getReviewTargets,
} from './controllers.js';

// Multer memory storage configuration for document upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, JPG, PNG, and DOC documents are allowed.'));
    }
  },
});

// Primary Verifications Router (mounted at /api/v1/verifications)
const verificationRouter = express.Router();

// 1. Submit Verification Request (Company & Reviewer)
verificationRouter.post(
  '/request',
  protect,
  authorize('reviewer', 'company'),
  upload.single('proofDocument'),
  submitVerificationRequest
);

// 2. Get Current Authenticated User's Verification Status
verificationRouter.get('/my-status', protect, getMyVerificationStatus);

// 3. Admin Verification Queue
verificationRouter.get('/pending', protect, authorize('admin'), getPendingVerifications);

// 4. Admin Decision (Approve / Reject)
verificationRouter.patch('/:id/decision', protect, authorize('admin'), reviewVerificationDecision);

// 5. Search potential review targets (students & companies)
verificationRouter.get('/targets', protect, authorize('reviewer', 'admin'), getReviewTargets);

// Fallback/Direct review routes on verifications router
verificationRouter.post('/reviews', protect, authorize('reviewer'), submitReview);
verificationRouter.get('/reviews/target/:targetId', getTargetReviews);
verificationRouter.get('/reviews/my-reviews', protect, authorize('reviewer'), getMySubmittedReviews);

// Standalone Reviews Router (mounted at /api/v1/reviews according to docs/API_CONTRACTS.md)
export const reviewRoutes = express.Router();

reviewRoutes.post('/', protect, authorize('reviewer'), submitReview);
reviewRoutes.get('/target/:targetId', getTargetReviews);
reviewRoutes.get('/my-reviews', protect, authorize('reviewer'), getMySubmittedReviews);
reviewRoutes.get('/targets', protect, authorize('reviewer', 'admin'), getReviewTargets);

export default verificationRouter;
