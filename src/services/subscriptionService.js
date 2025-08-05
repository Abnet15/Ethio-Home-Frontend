import api, { endpoints } from '../config/api';

export const subscriptionService = {
  // Plans
  createPlan: async (data) => {
    try {
      const response = await api.post(endpoints.subscription.createPlan, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create plan' };
    }
  },
  listPlans: async (params) => {
    try {
      // Use explicit path to match backend routes: /subscription/plans
      const response = await api.get('/subscription/plans', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch plans' };
    }
  },
  listAdminPlans: async () => {
    try {
      const response = await api.get('/subscription/admin/plans');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch admin plans' };
    }
  },
  updatePlan: async (planId, data) => {
    try {
      // /subscription/plans/:planId
      const response = await api.patch(`/subscription/plans/${planId}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update plan' };
    }
  },
  deletePlan: async (planId) => {
    try {
      // /subscription/plans/:planId
      await api.delete(`/subscription/plans/${planId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete plan' };
    }
  },
  setPlanStatus: async (planId, data) => {
    try {
      // PUT /subscription/plans/:planId updates status
      const response = await api.put(`/subscription/plans/${planId}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update plan status' };
    }
  },

  // Predefined plans
  getPredefinedPlans: async () => {
    try {
      const response = await api.get(endpoints.subscription.predefinedPlans);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch predefined plans' };
    }
  },
  createPredefinedPlan: async (data) => {
    try {
      const response = await api.post(endpoints.subscription.createPredefinedPlan, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create predefined plan' };
    }
  },
  updatePredefinedPlan: async (id, data) => {
    try {
      const response = await api.patch(endpoints.subscription.updatePredefinedPlan(id), data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update predefined plan' };
    }
  },
  deletePredefinedPlan: async (id) => {
    try {
      await api.delete(endpoints.subscription.deletePredefinedPlan(id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete predefined plan' };
    }
  },

  // Check subscription status
  checkSubscriptionStatus: async () => {
    try {
      const response = await api.get(endpoints.subscription.checkStatus);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to check subscription status' };
    }
  },

  // Get user's subscription details including property limits
  getUserSubscriptionDetails: async () => {
    try {
      const response = await api.get(endpoints.subscription.checkStatus);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to get subscription details' };
    }
  },

  // Payment verification
  verifyPayment: async (txRef) => {
    try {
      //console.log(txRef);
      const response = await api.get(endpoints.subscription.paymentVerify(txRef));
      //console.log(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to verify subscription payment' };
    }
  },
  receiveWebhook: async (payload) => {
    try {
      const response = await api.post('/subscription/verify-subscription-webhook', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to submit webhook' };
    }
  },
};

export default subscriptionService;


