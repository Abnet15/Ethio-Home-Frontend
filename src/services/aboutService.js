import api, { endpoints } from "../config/api";

export const aboutService = {
  // Get about content (public)
  getAboutContent: async () => {
    try {
      const response = await api.get(endpoints.about.content);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch about content",
      };
    }
  },

  // Update about content (admin only)
  updateAboutContent: async (contentData) => {
    try {
      const response = await api.patch(endpoints.about.update, contentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to update about content",
      };
    }
  },

  // Get properties count for stats
  getPropertiesCount: async () => {
    try {
      const response = await api.get("/api/properties/count");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch properties count",
      };
    }
  },

  // Get users count for stats
  getUsersCount: async () => {
    try {
      const response = await api.get("/api/users/count");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch users count",
      };
    }
  },

  // Get verified properties percentage
  getVerifiedPropertiesPercentage: async () => {
    try {
      const response = await api.get("/api/properties/verified-percentage");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch verified properties percentage",
      };
    }
  },
};

export default aboutService;