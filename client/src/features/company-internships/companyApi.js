import { apiClient } from '../../services/apiClient.js';

/**
 * Company & Internship Management API Client
 * Module: Company & Internship Management
 * Connects to /api/v1/companies and /api/v1/internships endpoints
 */

/**
 * Fetch the authenticated user's company profile
 * @route GET /api/v1/companies/me
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const getMyCompanyProfile = async () => {
  return await apiClient.get('/companies/me');
};

/**
 * Create or update the authenticated user's company profile
 * @route PUT /api/v1/companies/me
 * @param {object} profileData - Company details (name, description, industry, location, contactEmail, etc.)
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const updateMyCompanyProfile = async (profileData) => {
  return await apiClient.put('/companies/me', profileData);
};

/**
 * Fetch public company profile by Company ID
 * @route GET /api/v1/companies/:id
 * @param {string} companyId - MongoDB ObjectId of the company
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const getCompanyById = async (companyId) => {
  return await apiClient.get(`/companies/${companyId}`);
};

/**
 * Fetch all internships posted by the authenticated company with dashboard KPI stats
 * @route GET /api/v1/internships/my
 * @param {object} [params] - Optional query parameters (e.g. { status: 'published' | 'draft' | 'closed' })
 * @returns {Promise<{ success: boolean, message: string, data: { internships: Array, company: object, stats: object } }>}
 */
export const getMyInternships = async (params = {}) => {
  return await apiClient.get('/internships/my', { params });
};

/**
 * Fetch details of a single internship listing by ID
 * @route GET /api/v1/internships/:id
 * @param {string} internshipId - MongoDB ObjectId of the internship
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const getInternshipById = async (internshipId) => {
  return await apiClient.get(`/internships/${internshipId}`);
};

/**
 * Create a new internship listing
 * @route POST /api/v1/internships
 * @param {object} internshipData - Full internship details (title, description, area, requiredSkills, etc.)
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const createInternship = async (internshipData) => {
  return await apiClient.post('/internships', internshipData);
};

/**
 * Update an existing internship listing (Owner only)
 * @route PUT /api/v1/internships/:id
 * @param {string} internshipId - MongoDB ObjectId of the internship
 * @param {object} internshipData - Fields to update
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const updateInternship = async (internshipId, internshipData) => {
  return await apiClient.put(`/internships/${internshipId}`, internshipData);
};

/**
 * Update the status of an internship listing ('draft' | 'published' | 'closed')
 * @route PATCH /api/v1/internships/:id/status
 * @param {string} internshipId - MongoDB ObjectId of the internship
 * @param {string} status - New status ('draft' | 'published' | 'closed')
 * @returns {Promise<{ success: boolean, message: string, data: object }>}
 */
export const updateInternshipStatus = async (internshipId, status) => {
  return await apiClient.patch(`/internships/${internshipId}/status`, { status });
};

/**
 * Delete an internship listing (Owner only)
 * @route DELETE /api/v1/internships/:id
 * @param {string} internshipId - MongoDB ObjectId of the internship
 * @returns {Promise<{ success: boolean, message: string, data: { id: string } }>}
 */
export const deleteInternship = async (internshipId) => {
  return await apiClient.delete(`/internships/${internshipId}`);
};

// Default export consolidating all functions
export const companyApi = {
  getMyCompanyProfile,
  updateMyCompanyProfile,
  getCompanyById,
  getMyInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  updateInternshipStatus,
  deleteInternship,
};

export default companyApi;
