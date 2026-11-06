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
   * Delete student CV file from storage and clear URL
   */
  deleteCv: async () => {
    const response = await apiClient.delete('/students/cv');
    return response.data;
  },

  /**
   * Upload and update student profile photo (avatar)
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/students/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Remove student profile photo
   */
  deleteAvatar: async () => {
    const response = await apiClient.delete('/students/avatar');
    return response.data;
  },

  /**
   * Upload project cover image/screenshot to Supabase storage
   */
  uploadProjectImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/students/upload-project-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data?.imageUrl;
  },

  /**
   * Upload certificate or badge file (PDF or image) to Supabase storage
   */
  uploadCertificateFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/students/upload-certificate-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data?.fileUrl;
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
