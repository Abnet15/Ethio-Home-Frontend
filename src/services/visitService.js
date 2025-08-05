import api, { endpoints } from '../config/api';

export const visitService = {
  // Schedule a property visit
  scheduleVisit: async (visitData) => {
    try {
      const response = await api.post(endpoints.interests.property.create(visitData.propertyId), visitData);
      console.log(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to schedule visit' 
      };
    }
  },

  // Get scheduled visits for a user
  getScheduledVisits: async () => {
    try {
      const response = await api.get(endpoints.interests.buyer.list);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch scheduled visits' 
      };
    }
  },

  // Update visit details
  updateVisit: async (visitId, updateData) => {
    try {
      const response = await api.patch(endpoints.interests.buyer.update(visitId), updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update visit' 
      };
    }
  },

  // Cancel a scheduled visit
  cancelVisit: async (visitId) => {
    try {
      const response = await api.delete(endpoints.interests.buyer.delete(visitId));
      return { success: true, data: response.data };
    } catch ( error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel visit' 
      };
    }
  }
};

export default visitService;
