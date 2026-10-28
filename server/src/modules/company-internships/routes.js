import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getMyCompanyProfile,
  updateMyCompanyProfile,
  getCompanyById,
} from './companyController.js';
import {
  createInternship,
  getMyInternships,
  getInternshipById,
  updateInternship,
  updateInternshipStatus,
  deleteInternship,
} from './internshipController.js';

// ==========================================
// 1. Company Profile Routes (/api/v1/companies)
// ==========================================
export const companyRoutes = express.Router();

// Current company profile management
companyRoutes.get('/me', protect, authorize('company'), getMyCompanyProfile);
companyRoutes.put('/me', protect, authorize('company'), updateMyCompanyProfile);

// Public/authenticated company profile view
companyRoutes.get('/:id', protect, getCompanyById);

// ==========================================
// 2. Internship Routes (/api/v1/internships)
// ==========================================
export const internshipRoutes = express.Router();

// List & Create
internshipRoutes.post('/', protect, authorize('company'), createInternship);
internshipRoutes.get('/my', protect, authorize('company'), getMyInternships);

// Single Item Operations
internshipRoutes.get('/:id', getInternshipById);
internshipRoutes.put('/:id', protect, authorize('company'), updateInternship);
internshipRoutes.patch('/:id/status', protect, authorize('company'), updateInternshipStatus);
internshipRoutes.delete('/:id', protect, authorize('company'), deleteInternship);

// Default export for company routes
export default companyRoutes;
