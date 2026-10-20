import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import { sendSuccess } from '../../utils/apiResponse.js';

const router = express.Router();

// Member 1 (032) - Student Portfolio Routes
router.get('/me', protect, authorize('student'), (req, res) => {
  return sendSuccess(res, 200, 'Student profile endpoint ready for Module 1 implementation', {
    userId: req.user._id,
  });
});

export default router;
