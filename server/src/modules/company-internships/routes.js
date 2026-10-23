import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import { sendSuccess } from '../../utils/apiResponse.js';

const router = express.Router();

// Member 2 (033) - Company & Internship Routes
router.get('/my', protect, authorize('company'), (req, res) => {
  return sendSuccess(res, 200, 'Company internship endpoint ready for Module 2 implementation', {
    companyUserId: req.user._id,
  });
});

export default router;
