import api, { endpoints } from '../config/api';

export const paymentService = {
  // Initialize payment for property purchase using Chapa
  initializePayment: async (propertyId, paymentData) => {
    try {
      const response = await api.post(endpoints.selling.paymentInit(propertyId), paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to initialize payment' 
      };
    }
  },

  // Verify payment using tx_ref
  verifyPayment: async (txRef) => {
    try {
      const response = await api.get(endpoints.selling.paymentVerify(txRef));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to verify payment' 
      };
    }
  },

  // Get payment history
  getPaymentHistory: async (userId) => {
    try {
      const response = await api.get(endpoints.selling.list);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch payment history' 
      };
    }
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(endpoints.selling.get(paymentId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get payment status' 
      };
    }
  },

  // Cancel payment
  cancelPayment: async (paymentId) => {
    try {
      const response = await api.delete(endpoints.selling.delete(paymentId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel payment' 
      };
    }
  }
};

export default paymentService;
