import express from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

const router = express.Router();

// Member 3 (035) - Search & Matching Routes
router.get('/internships', (req, res) => {
  return sendSuccess(res, 200, 'Search & Matching endpoint ready for Module 3 implementation', {
    query: req.query,
    items: [],
  });
});

export default router;
