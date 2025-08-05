import api, { endpoints } from "../config/api";

export const authService = {
  // User signup
  signup: async (userData) => {
    try {
      const response = await api.post(endpoints.auth.signup, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to sign up",
      };
    }
  },

  // User login
  login: async (credentials) => {
    console.log(credentials);
    try {
      const response = await api.post(endpoints.auth.login, credentials);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to login",
      };
    }
  },

  // User logout
  logout: async () => {
    try {
      await api.get(endpoints.auth.logout);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to logout",
      };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post(endpoints.auth.forgotPassword, { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send reset email",
      };
    }
  },

  // Reset password
  resetPassword: async (token, password, passwordConfirm) => {
    try {
      const response = await api.patch(endpoints.auth.resetPassword(token), {
        password,
        passwordConfirm,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to reset password",
      };
    }
  },

  // Update password
  updatePassword: async (password, currentPassword, passwordConfirm) => {
    try {
      const response = await api.patch(endpoints.auth.updatePassword, {
        password, // user's current password
        currentPassword, // new password (backend expects this key)
        passwordConfirm, // confirm new password
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.log(error.response.data);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update password",
      };
    }
  },

  // Verify email
  verifyEmail: async (userId) => {
    try {
      const response = await api.patch(endpoints.auth.verifyEmail(userId));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to verify email",
      };
    }
  },

  // Send verification email again
  sendVerification: async (userId) => {
    try {
      const response = await api.patch(endpoints.auth.sendVerification(userId));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to send verification email",
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Get stored user data
  getStoredUser: () => {
    // Try both storage keys for backward compatibility
    const user =
      localStorage.getItem("ethio_home_user") || localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Store authentication data
  storeAuthData: (token, user) => {
    //console.log('Storing auth data - Token:', Boolean(token), 'User:', user ? 'present' : 'missing');

    if (token) {
      localStorage.setItem("token", token);
    }

    if (user) {
      // Use consistent key for user data
      localStorage.setItem("ethio_home_user", JSON.stringify(user));
      // Also store in old key for backward compatibility
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  // Clear authentication data
  clearAuthData: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ethio_home_user");
    localStorage.removeItem("user");
  },
};

export default authService;
