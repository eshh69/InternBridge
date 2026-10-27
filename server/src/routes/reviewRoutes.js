import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createReview,
  getTargetReviewsAndReputation,
  getMySubmittedReviews,
  getReviewTargets,
} from '../controllers/reviewController.js';

const router = express.Router();

// 1. Submit review
// POST /
router.post('/', protect, authorize('reviewer'), createReview);

// 2. Search review targets & my reviews (must be defined before /:targetId)
router.get('/targets', protect, authorize('reviewer', 'admin'), getReviewTargets);
router.get('/my-reviews', protect, authorize('reviewer'), getMySubmittedReviews);

// 3. Get target reviews and reputation score
// GET /:targetId
router.get('/:targetId', getTargetReviewsAndReputation);

// Compatibility alias for /target/:targetId
router.get('/target/:targetId', getTargetReviewsAndReputation);

export default router;
