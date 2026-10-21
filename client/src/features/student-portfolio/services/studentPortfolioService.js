import apiClient from '../../../services/apiClient';

/**
 * Student Portfolio API Service
 * Communicates with /api/v1/students endpoints
 */

export const studentPortfolioService = {
  /**
   * Fetch current authenticated student's profile
   */
  getMyProfile: async () => {
    const response = await apiClient.get('/students/me');
    return response.data?.profile;
  },

  /**
   * Update student profile details (skills, bio, education, projects, etc.)
   */
  updateMyProfile: async (profileData) => {
    const response = await apiClient.put('/students/me', profileData);
    return response.data?.profile;
  },

  /**
   * Upload CV file to Supabase storage via backend
   */
  uploadCv: async (file) => {
    const formData = new FormData();
    formData.append('cv', file);

    const response = await apiClient.post('/students/upload-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Fetch a student's public portfolio by ID
   */
  getPublicProfile: async (id) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data?.profile;
  },
};

export default studentPortfolioService;
