import express from 'express';
import authRoutes from './authRoutes.js';
import studentPortfolioRoutes from '../modules/student-portfolio/routes.js';
import chatRoutes from '../modules/student-portfolio/chatRoutes.js';
import companyInternshipRoutes from '../modules/company-internships/routes.js';
import searchMatchingRoutes, { matchRoutes } from '../modules/search-matching/routes.js';
import applicationsRoutes from '../modules/applications/routes.js';
import verificationRatingRoutes from '../modules/verification-rating/routes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'InternBridge API',
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/students', studentPortfolioRoutes);
router.use('/conversations', chatRoutes);
router.use('/companies', companyInternshipRoutes);
router.use('/search', searchMatchingRoutes);
router.use('/match', matchRoutes);
router.use('/applications', applicationsRoutes);
router.use('/verifications', verificationRatingRoutes);

export default router;
