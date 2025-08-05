import api, { endpoints } from '../config/api';

export const interestService = {
  // Get buyer's interests (current user)
  getInterests: async (params = {}) => {
    try {
      // Fetch interests for the currently authenticated buyer
      const response = await api.get(endpoints.interests.buyer.list, { params });
      console.log(response.data)
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch interests' 
      };
    }
  },

  // Get buyer's interests (alias of getInterests)
  getBuyerInterests: async () => {
    try {
      const response = await api.get(endpoints.interests.buyer.list);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch interests' 
      };
    }
  },

  // Submit interest (buyer)
  submitInterest: async (id,interestData) => {
    try {
      const response = await api.post(endpoints.interests.property.create(id), interestData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to submit interest' 
      };
    }
  },

  // Get single interest
  getInterest: async (id) => {
    try {
      const response = await api.get(endpoints.interests.buyer.get(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch interest' 
      };
    }
  },

  // Update interest
  updateInterest: async (id, interestData) => {
    try {
      const response = await api.patch(endpoints.interests.buyer.update(id), interestData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update interest' 
      };
    }
  },

  // Delete interest
  deleteInterest: async (id) => {
    try {
      await api.delete(endpoints.interests.buyer.delete(id));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete interest' 
      };
    }
  },

  // Get seller's interests (for sellers/admin/employees)
  getSellerInterests: async (ownerId) => {
    try {
      const response = await api.get(endpoints.interests.seller.list(ownerId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch seller interests' 
      };
    }
  },

  // Update interest status (for sellers/agents)
  updateInterestStatus: async (interestId, status, additionalData = {}) => {
    try {
      const updateData = { status, ...additionalData };
      const response = await api.patch(endpoints.interests.buyer.update(interestId), updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update interest status' 
      };
    }
  },

  // Schedule visit for interest
  scheduleVisit: async (interestId, visitDate) => {
    try {
      const updateData = {
        status: 'schedule',
        visitScheduled: true,
        visitDate: visitDate
      };
      const response = await api.patch(endpoints.interests.buyer.update(interestId), updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to schedule visit' 
      };
    }
  },

  // Mark interest as contacted
  markAsContacted: async (interestId) => {
    try {
      const response = await api.patch(endpoints.interests.buyer.update(interestId), { status: 'contacted' });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark as contacted' 
      };
    }
  },

  // Reject interest
  rejectInterest: async (interestId) => {
    try {
      const response = await api.patch(endpoints.interests.buyer.update(interestId), { status: 'rejected' });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reject interest' 
      };
    }
  },

  // Mark visit as completed
  markVisitCompleted: async (interestId) => {
    try {
      const response = await api.patch(endpoints.interests.buyer.update(interestId), { status: 'visited' });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark visit as completed' 
      };
    }
  },

  // Delete buyer interest (for seller/agent)
  deleteBuyerInterest: async (interestId) => {
    try {
      await api.delete(endpoints.interests.buyer.deleteForSeller(interestId));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete buyer interest' 
      };
    }
  }
};

export default interestService;

