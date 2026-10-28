import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  submitApplication,
  getMyApplications,
  getInternshipApplicants,
  getCompanyApplicants,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from './controller.js';

const router = express.Router();

/**
 * Member 4 (SEU/IS/22/ICT/030) — Application & Recruitment Routes
 */

// Student: Submit new application
router.post('/', protect, authorize('student'), submitApplication);

// Student: View own submitted applications
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/my-applications', protect, authorize('student'), getMyApplications); // alias

// Company/Admin: View all candidates for company
router.get('/company/all', protect, authorize('company', 'admin'), getCompanyApplicants);

// Company/Admin: View applicants for a specific internship listing
router.get('/internship/:id', protect, authorize('company', 'admin'), getInternshipApplicants);

// Specific Application: View details
router.get('/:id', protect, getApplicationById);

// Company/Admin: Update recruitment status
router.patch('/:id/status', protect, authorize('company', 'admin'), updateApplicationStatus);

// Student: Withdraw application (only allowed while still in 'applied' status)
router.delete('/:id', protect, authorize('student'), withdrawApplication);

export default router;
