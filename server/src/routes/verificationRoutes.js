import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth.js';
import {
  submitVerification,
  getAllVerifications,
  updateVerificationStatus,
  getMyVerificationStatus,
} from '../controllers/verificationController.js';
import { getReviewTargets } from '../controllers/reviewController.js';

// Multer memory storage for optional file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

// 1. Submit verification request
// POST /request
router.post(
  '/request',
  protect,
  authorize('reviewer', 'company'),
  upload.single('proofDocument'),
  submitVerification
);

// 2. Get all verification requests (Admin queue)
// GET /
router.get('/', protect, authorize('admin'), getAllVerifications);

// 3. Update verification request status (Approve / Reject)
// PUT /:id/status
router.put('/:id/status', protect, authorize('admin'), updateVerificationStatus);

// Compatibility aliases for existing routes
router.get('/pending', protect, authorize('admin'), getAllVerifications);
router.patch('/:id/decision', protect, authorize('admin'), updateVerificationStatus);
router.get('/my-status', protect, getMyVerificationStatus);
router.get('/targets', protect, authorize('reviewer', 'admin'), getReviewTargets);

export default router;
