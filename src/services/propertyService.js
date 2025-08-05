import api from '../config/api';
import { endpoints } from '../config/api';

export const propertyService = {
  // Get all properties with optional filters
  getProperties: async (filters = {}) => {
    try {
      const response = await api.get(endpoints.properties.list, { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch properties' 
      };
    }
  },

  // Get a single property by ID
  getProperty: async (id) => {
    try {
      const response = await api.get(endpoints.properties.get(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch property' 
      };
    }
  },

  // Create a new property
  createProperty: async (propertyData) => {
    try {
      const response = await api.post(endpoints.properties.create, propertyData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create property' 
      };
    }
  },

  // Update an existing property
  updateProperty: async (id, propertyData) => {
    // Try multiple HTTP methods to handle different backend configurations
   /*  const methods = ['post', 'put', 'patch'];
    
    for (const method of methods) {
      try {
        console.log(`Trying ${method.toUpperCase()} request for property update...`);
        const response = await api[method](endpoints.properties.update(id), propertyData);
        console.log(`${method.toUpperCase()} request successful for property update`);
        return { success: true, data: response.data };
      } catch (error) {
        console.log(`${method.toUpperCase()} request failed for property update:`, error.message);
        
        // If it's the last method, return the error
        if (method === methods[methods.length - 1]) {
          console.error('All HTTP methods failed for property update:', error);
          
          // Check if it's a CORS error
          if (error.message && error.message.includes('CORS')) {
            return {
              success: false,
              error: 'CORS error: Backend server needs to allow PATCH/POST/PUT requests. Please contact administrator to update CORS configuration.'
            };
          }
          
          return { 
            success: false, 
            error: error.response?.data?.message || `Failed to update property. All HTTP methods (${methods.join(', ').toUpperCase()}) are not allowed by CORS policy.` 
          };
        }
        // Continue to next method
        continue;
      }
    } */
      try {
        const response = await api.patch(endpoints.properties.update(id), propertyData);
        console.log("🤣🤣🤣",response);
        return { success: true, data: response.data };
      } catch (error) {
          console.log(error.response.data);
        return { 
          success: false, 
          error: error.response?.data.message || 'Failed to create property' 
        };
      }
  },

  // Delete a property
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(endpoints.properties.delete(id));
      return { success: true, data: response.data };
    } catch (error) {
       // console.log(error.response.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete property' 
      };
    }
  },

  // Get properties by seller/owner
  getPropertiesBySeller: async (ownerId) => {
    try {
      const response = await api.get(endpoints.properties.listSeller(ownerId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch seller properties' 
      };
    }
  },

  // Upload property images
  uploadPropertyImages: async (id, images) => {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.post(`/properties/${id}/upload-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      //console.log("🤣🤣🤣",error.response.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload images' 
      };
    }
  },

  // Remove property image
  removePropertyImage: async (id, imageIndex) => {
    try {
      const response = await api.delete(`/properties/${id}/remove-image`, {
        data: { imageIndex }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove image' 
      };
    }
  },

  // Cleanup orphaned property images (admin only)
  cleanupOrphanedImages: async () => {
    try {
      const response = await api.post('/properties/cleanup-orphaned-images');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cleanup orphaned images' 
      };
    }
  },

  // Get property statistics
  getPropertyStats: async () => {
    try {
      const response = await api.get(endpoints.properties.stats);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch property statistics' 
      };
    }
  },

  // Verify a property (approve for publication)
  verifyProperty: async (propertyId) => {
    const updateData = {
      status: 'verified',
      verified: true
    };

    // Try multiple HTTP methods to handle different backend configurations
    const methods = ['post', 'put', 'patch'];
    
    for (const method of methods) {
      try {
        console.log(`Trying ${method.toUpperCase()} request for property verification...`);
        const response = await api[method](endpoints.properties.update(propertyId), updateData);
        console.log(`${method.toUpperCase()} request successful for property verification`);
        return { success: true, data: response.data };
      } catch (error) {
        console.log(`${method.toUpperCase()} request failed for property verification:`, error.message);
        
        // If it's the last method, return the error
        if (method === methods[methods.length - 1]) {
          console.error('All HTTP methods failed for property verification:', error);
          
          // Check if it's a CORS error
          if (error.message && error.message.includes('CORS')) {
            return {
              success: false,
              error: 'CORS error: Backend server needs to allow PATCH/POST/PUT requests. Please contact administrator to update CORS configuration.'
            };
          }
          
          return { 
            success: false, 
            error: error.response?.data?.message || `Failed to verify property. All HTTP methods (${methods.join(', ').toUpperCase()}) are not allowed by CORS policy.` 
          };
        }
        // Continue to next method
        continue;
      }
    }
  },

  // Reject a property
  rejectProperty: async (propertyId) => {
    // First try the dedicated reject endpoint
    try {
      console.log('Trying dedicated reject endpoint...');
      const response = await api.post(endpoints.properties.rejectPost(propertyId));
      console.log('Dedicated reject endpoint successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Dedicated reject endpoint failed:', error.message);
      
      // Fallback to update endpoint with rejection data
      const updateData = {
        status: 'rejected',
        verified: false
      };

      // Try multiple HTTP methods to handle different backend configurations
      const methods = ['post', 'put', 'patch'];
      
      for (const method of methods) {
        try {
          console.log(`Trying ${method.toUpperCase()} request for property rejection...`);
          const response = await api[method](endpoints.properties.update(propertyId), updateData);
          console.log(`${method.toUpperCase()} request successful for property rejection`);
          return { success: true, data: response.data };
        } catch (error) {
          console.log(`${method.toUpperCase()} request failed for property rejection:`, error.message);
          
          // If it's the last method, return the error
          if (method === methods[methods.length - 1]) {
            console.error('All HTTP methods failed for property rejection:', error);
            
            // Check if it's a CORS error
            if (error.message && error.message.includes('CORS')) {
              return {
                success: false,
                error: 'CORS error: Backend server needs to allow PATCH/POST/PUT requests. Please contact administrator to update CORS configuration.'
              };
            }
            
            return { 
              success: false, 
              error: error.response?.data?.message || `Failed to reject property. All HTTP methods (${methods.join(', ').toUpperCase()}) are not allowed by CORS policy.` 
            };
          }
          // Continue to next method
          continue;
        }
      }
    }
  },

  // Alternative methods using PUT (if POST doesn't work)
  verifyPropertyPUT: async (propertyId) => {
    try {
      console.log("😋😋😋😋",propertyId);

      const response = await api.put(endpoints.properties.verify(propertyId));
      console.log("😁😁😁",response);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to verify property' 
      };
    }
  },

  rejectPropertyPUT: async (propertyId) => {
    try {
      const response = await api.put(endpoints.properties.reject(propertyId));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reject property' 
      };
    }
  }
};

export default propertyService;

