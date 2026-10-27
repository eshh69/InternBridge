import apiClient from '../../../services/apiClient';

/**
 * Chat & Messaging API Service
 * Interacts with /api/v1/conversations
 */
export const chatService = {
  /**
   * Fetch all active conversations for the authenticated user
   */
  getConversations: async () => {
    const response = await apiClient.get('/conversations');
    return response.data?.conversations || [];
  },

  /**
   * Fetch companies directory to initiate new chat (student only)
   */
  getCompanies: async () => {
    const response = await apiClient.get('/conversations/companies');
    return response.data?.companies || [];
  },

  /**
   * Start or get an existing conversation
   * @param {Object} payload - { companyId } for student, { studentId } for company
   */
  startConversation: async (payload) => {
    const response = await apiClient.post('/conversations', payload);
    return response.data?.conversation;
  },

  /**
   * Retrieve chat messages history for a conversation
   * @param {string} conversationId
   */
  getMessages: async (conversationId) => {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  /**
   * Send a message via REST endpoint
   * @param {string} conversationId
   * @param {string} content
   */
  sendMessage: async (conversationId, content) => {
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, { content });
    return response.data?.message;
  },
};

export default chatService;
