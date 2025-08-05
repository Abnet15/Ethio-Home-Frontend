import api, { endpoints } from '../config/api';

export const sellingService = {
  // Initiate payment (buyer/admin contexts) - Chapa integration
  processPayment: async (payload) => {
    try {
      const { propertyId, ...paymentData } = payload;
      const response = await api.post(endpoints.selling.paymentInit(propertyId), paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to initiate payment',
      };
    }
  },

  // Verify payment by tx_ref
  verifyPayment: async (txRef) => {
    try {
      const response = await api.get(endpoints.selling.paymentVerify(txRef));
      console.log("payment verification response",response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify payment',
      };
    }
  },

  // Admin/employee: list selling records
  list: async (params = {}) => {
    try {
      const response = await api.get(endpoints.selling.list, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch selling records' };
    }
  },

  // Admin: create selling record
  create: async (data) => {
    try {
      const response = await api.post(endpoints.selling.list, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create selling record' };
    }
  },

  // Admin: stats
  stats: async () => {
    try {
      const response = await api.get(endpoints.selling.stats);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch selling stats' };
    }
  },

  // CRUD by id
  get: async (id) => {
    try {
      const response = await api.get(endpoints.selling.get(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch selling record' };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.patch(endpoints.selling.update(id), data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update selling record' };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(endpoints.selling.delete(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete selling record' };
    }
  }
};

export default sellingService;


