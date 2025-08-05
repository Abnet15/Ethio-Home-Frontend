import api, { endpoints } from '../config/api';

export const favoritesService = {
  // Get user's favorites
  getFavorites: async () => {
    try {
      const response = await api.get(endpoints.favorites.list);
      console.log("response.data",response.data)
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch favorites' 
      };
    }
  },

  // Add property to favorites
  addToFavorites: async (propertyId) => {
    console.log("propertyId::add to favorites",propertyId);
    try {
      const response = await api.post(endpoints.favorites.add, { propertyId });
      console.log("response",response);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add to favorites' 
      };
    }
  },

  // Remove property from favorites
  removeFromFavorites: async (propertyId) => {
    try {
      await api.delete(endpoints.favorites.remove(propertyId));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove from favorites' 
      };
    }
  },

  // Clear all favorites
  clearFavorites: async () => {
    try {
      await api.delete(endpoints.favorites.clear);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to clear favorites' 
      };
    }
  },

  // Check if property is in favorites
  checkFavorite: async (propertyId) => {
    try {
      const response = await api.get(endpoints.favorites.check(propertyId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check favorite status' 
      };
    }
  },

  // Toggle favorite status
  toggleFavorite: async (propertyId) => {
    try {
      const checkResult = await favoritesService.checkFavorite(propertyId);
      console.log("checkResult",checkResult);
      console.log("checkResult.data.data.isFavorite",checkResult.data.data.isFavorite);
      console.log("checkResult.data.status",checkResult.data.status);
      if (checkResult.data.status=="success" && checkResult.data.data.isFavorite) {
        console.log("removeFromFavorites");
        return await favoritesService.removeFromFavorites(propertyId);
      } else {
        console.log("addToFavorites");
        return await favoritesService.addToFavorites(propertyId);
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to toggle favorite' 
      };
    }
  }
};

export default favoritesService;
