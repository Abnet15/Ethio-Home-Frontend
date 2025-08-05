import api, { endpoints } from '../config/api';

export const contactService = {
  // Submit contact form (public)
  submitContact: async (contactData) => {
    try {
      const response = await api.post(endpoints.contact.submit, contactData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to submit contact form' 
      };
    }
  },

  // Get all contacts (admin only)
  getAllContacts: async (params = {}) => {
    try {
      const response = await api.get(endpoints.contact.list, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch contacts' 
      };
    }
  },

  // Get contact by ID (admin only)
  getContact: async (id) => {
    try {
      const response = await api.get(endpoints.contact.get(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch contact' 
      };
    }
  },

  // Update contact status (admin only)
  updateContactStatus: async (id, updateData) => {
    try {
      const response = await api.patch(endpoints.contact.update(id), updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update contact' 
      };
    }
  },

  // Add note to contact (admin/employee)
  addNote: async (id, noteData) => {
    try {
      const response = await api.post(endpoints.contact.addNote(id), noteData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add note' 
      };
    }
  },

  // Delete contact (admin only)
  deleteContact: async (id) => {
    try {
      await api.delete(endpoints.contact.delete(id));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete contact' 
      };
    }
  },

  // Get contact statistics (admin only)
  getContactStats: async () => {
    try {
      const response = await api.get(endpoints.contact.stats);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch contact stats' 
      };
    }
  },

  // Assign contact to employee (admin only)
  assignContact: async (id, assignmentData) => {
    try {
      const response = await api.patch(endpoints.contact.assign(id), assignmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to assign contact' 
      };
    }
  },

  // Get contact departments
  getContactDepartments: async () => {
    try {
      const response = await api.get(endpoints.contact.departments);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch departments' 
      };
    }
  },

  // Get contact FAQs
  getContactFAQs: async (params = {}) => {
    try {
      const response = await api.get(endpoints.contact.faqs, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch FAQs' 
      };
    }
  },

  // Rate FAQ helpfulness (public)
  rateFAQ: async (id, helpful) => {
    try {
      const response = await api.post(endpoints.contact.rateFAQ(id), { helpful });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to rate FAQ' 
      };
    }
  },

  // Admin Department Management Functions

  // Get all departments (admin only)
  getAllDepartments: async (params = {}) => {
    try {
      const response = await api.get(endpoints.contact.adminDepartments.list, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch departments' 
      };
    }
  },

  // Create new department (admin only)
  createDepartment: async (departmentData) => {
    try {
      const response = await api.post(endpoints.contact.adminDepartments.create, departmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create department' 
      };
    }
  },

  // Update department (admin only)
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await api.patch(endpoints.contact.adminDepartments.update(id), departmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update department' 
      };
    }
  },

  // Delete department (admin only)
  deleteDepartment: async (id) => {
    try {
      await api.delete(endpoints.contact.adminDepartments.delete(id));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete department' 
      };
    }
  },

  // Admin FAQ Management Functions

  // Get all FAQs (admin only)
  getAllFAQs: async (params = {}) => {
    try {
      const response = await api.get(endpoints.contact.adminFAQs.list, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch FAQs' 
      };
    }
  },

  // Create new FAQ (admin only)
  createFAQ: async (faqData) => {
    try {
      const response = await api.post(endpoints.contact.adminFAQs.create, faqData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create FAQ' 
      };
    }
  },

  // Update FAQ (admin only)
  updateFAQ: async (id, faqData) => {
    try {
      const response = await api.patch(endpoints.contact.adminFAQs.update(id), faqData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update FAQ' 
      };
    }
  },

  // Delete FAQ (admin only)
  deleteFAQ: async (id) => {
    try {
      await api.delete(endpoints.contact.adminFAQs.delete(id));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete FAQ' 
      };
    }
  },

  // Get user's own contacts (for users to view their submissions)
  getMyContacts: async (id) => {
    try {
      const response = await api.get(endpoints.contact.myContacts(id));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch your contacts' 
      };
    }
  }
};

export default contactService;
