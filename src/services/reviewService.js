import api, { endpoints } from '../config/api';

export const reviewService = {
  // Get all reviews with filtering
  getReviews: async (params = {}) => {
    try {
      const response = await api.get(endpoints.reviews.list, { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Review API error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch reviews' 
      };
    }
  },

  // Get website service reviews (for home page)
  getWebsiteServiceReviews: async (limit = 10) => {
    try {
      const response = await api.get(endpoints.reviews.websiteService, { 
        params: { limit } 
      });
      console.log('response of website service reviews', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch website service reviews' 
      };
    }
  },

  // Get property reviews
  getPropertyReviews: async (propertyId, params = {}) => {
    try {
      const response = await api.get(endpoints.reviews.property(propertyId), { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch property reviews' 
      };
    }
  },

  // Create a new review
  createReview: async (reviewData) => {
    try {
      const response = await api.post(endpoints.reviews.create, reviewData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create review' 
      };
    }
  },

  // Get a specific review
  getReview: async (reviewId) => {
    try {
      const response = await api.get(endpoints.reviews.get(reviewId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch review' 
      };
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.patch(endpoints.reviews.update(reviewId), reviewData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update review' 
      };
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      await api.delete(endpoints.reviews.delete(reviewId));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete review' 
      };
    }
  },

  // Update review status (admin/employee only)
  updateReviewStatus: async (reviewId, statusData) => {
    try {
      const response = await api.patch(endpoints.reviews.status(reviewId), statusData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update review status' 
      };
    }
  },

  // Get user's reviews
  getUserReviews: async (userId, params = {}) => {
    try {
      const response = await api.get(endpoints.reviews.user(userId), { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch user reviews' 
      };
    }
  },

  // Get review statistics
  getReviewStats: async () => {
    try {
      const response = await api.get(endpoints.reviews.stats);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch review statistics' 
      };
    }
  }
};

export default reviewService;



