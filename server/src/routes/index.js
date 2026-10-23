import express from 'express';
import authRoutes from './authRoutes.js';
import studentPortfolioRoutes from '../modules/student-portfolio/routes.js';
import companyInternshipRoutes from '../modules/company-internships/routes.js';
import searchMatchingRoutes from '../modules/search-matching/routes.js';
import applicationsRoutes from '../modules/applications/routes.js';
import verificationRatingRoutes, { reviewRoutes } from '../modules/verification-rating/routes.js';

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
router.use('/companies', companyInternshipRoutes);
router.use('/search', searchMatchingRoutes);
router.use('/applications', applicationsRoutes);
router.use('/verifications', verificationRatingRoutes);
router.use('/reviews', reviewRoutes);

export default router;
