import api, { endpoints } from '../config/api';

export const userService = {
  // Get current user profile
  getMe: async () => {
    try {
      const response = await api.get(endpoints.users.me);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch user profile' 
      };
    }
  },

  // Update current user profile
  updateMe: async (userData) => {
    try {
      console.log("😍😍😍11")
      const response = await api.patch(endpoints.users.updateMe, userData);
      console.log("😍😍😍")
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  },

  // Delete current user account
  deleteMe: async () => {
    try {
      await api.delete(endpoints.users.deleteMe);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete account' 
      };
    }
  },

  // Get all users (admin/employee only)
  getUsers: async (params) => {
    try {
      const response = await api.get(endpoints.users.list, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch users' 
      };
    }
  },

  // Create user (admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post(endpoints.users.list, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create user'
      };
    }
  },

  // Get single user by ID (admin/employee only)
  getUser: async (id) => {
    try {
      const response = await api.get(endpoints.users.get(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch user' 
      };
    }
  },

  // Update user by ID (admin/employee only)
  updateUser: async (id, userData) => {
    console.log('here1');
    console.log(userData);  
    try {
      const response = await api.patch(endpoints.users.update(id), userData);
      console.log('here2');
      console.log(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update user' 
      };
    }
  },

  // Update a user's password (admin only)
  updateUserPassword: async (id, password, passwordConfirm) => {
    try {
      const response = await api.patch(endpoints.users.update(id) + '/password', { password, passwordConfirm });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user password'
      };
    }
  },

  // Delete user by ID (admin only)
  deleteUser: async (id) => {
    try {
      await api.delete(endpoints.users.delete(id));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete user' 
      };
    }
  },

  // Upload user photo
  uploadUserPhoto: async (photo) => {
    try {
      const formData = new FormData();
      formData.append('photo', photo);

      const response = await api.patch(endpoints.users.updateMe, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload photo' 
      };
    }
  },

  // Upload profile photo (new method)
  uploadPhoto: async (formData) => {
    try {
      const response = await api.post(endpoints.users.uploadPhoto, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload photo' 
      };
    }
  },

  // Remove profile photo
  removePhoto: async () => {
    try {
      const response = await api.delete(endpoints.users.removePhoto);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove photo' 
      };
    }
  }
};

export default userService;



