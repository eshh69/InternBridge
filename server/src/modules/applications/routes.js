import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import { sendSuccess } from '../../utils/apiResponse.js';

const router = express.Router();

// Member 4 (030) - Applications & Recruitment Routes
router.get('/my', protect, authorize('student'), (req, res) => {
  return sendSuccess(res, 200, 'Applications tracking endpoint ready for Module 4 implementation', {
    studentId: req.user._id,
    applications: [],
  });
});

export default router;
