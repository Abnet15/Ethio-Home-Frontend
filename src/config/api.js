import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ethio-home-backend.onrender.com/api/v1';
export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || 'https://ethio-home-backend.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 200000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    //console.log("here is to understand what to do in the system of the front end code 🙂🙂🙂☺☺☺😚😚😶🙄🙄🙄😶",config);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not force-redirect on 401 globally; public pages (e.g., property details)
    // may request restricted resources (like an owner profile) that should not
    // kick the whole app back to login. Let callers handle it gracefully.
    // Only clear auth data if we're sure the token is invalid (not just expired)
    // Let PrivateRoute and components handle authentication state
    if (error.response?.status === 401) {
      // Don't clear localStorage here - let the auth context handle it
      // This prevents race conditions where auth is cleared before context updates
      console.warn('API 401 error - authentication may be required');
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    signup: '/users/signup',
    login: '/users/login',
    logout: '/users/logout',
    forgotPassword: '/users/forgotPassword',
    resetPassword: (token) => `/users/resetPassword/${token}`,
    updatePassword: '/users/updateMyPassword',
    verifyEmail: (userId) => `/users/verifyEmail/${userId}`,
    sendVerification: (userId) => `/users/send/${userId}`,
  },

  // User endpoints
  users: {
    me: '/users/me',
    updateMe: '/users/updateMe',
    deleteMe: '/users/deleteMe',
    list: '/users',
    create:'/users',
    get: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    uploadPhoto: '/users/upload-photo',
    removePhoto: '/users/remove-photo',
    getfavorites: `/users/favorites`,
    createfavorites: `/users/favorites`,
    deletefavorites: (propertyId)=>`/users/favorites/${propertyId}`,
    clearfavorites: '/users/favorites',
  },

  // Property endpoints
  properties: {
    list: '/properties',
    listSeller: (ownerId)=>`/properties/seller/${ownerId}`,
    create: '/properties',
    get: (id) => `/properties/${id}`,
    update: (id) => `/properties/${id}`,
    delete: (id) => `/properties/${id}`,
    verify: (id) => `/properties/${id}`,
    reject: (id) => `/properties/${id}/reject`,
    // Alternative endpoints for verification (to avoid CORS issues)
    verifyPost: (id) => `/properties/${id}/verify`,
    rejectPost: (id) => `/properties/${id}/reject`,
    stats: '/properties/property-stats',
  },

  // Interest endpoints
  interests: {
    // Buyer-scoped interest endpoints
    buyer: {
      list: '/interest/buyer',
      create: '/interest/buyer',
      get: (id) => `/interest/buyer/${id}`,
      update: (id) => `/interest/buyer/${id}`,
      delete: (id) => `/interest/buyer/${id}`,
      deleteForSeller: (id) => `/interest/buyer/${id}`,
    },
    // interest Nested under properties 
    property: {
      getInterest: (propertyId) =>`/properties/${propertyId}/interest/buyer`,
      create: (propertyId)=> `/properties/${propertyId}/interest/buyer`,
      get: (id,propertyId) => `/properties/${propertyId}/interest/buyer/${id}`,
      update: (id, propertyId) => `/properties/${propertyId}/interest/buyer/${id}`,
      delete: (id, propertyId) => `/properties/${propertyId}/interest/buyer/${id}`,
      list: (propertyId) => `/properties/${propertyId}/interest`,
      status: (id, propertyId) => `/properties/${propertyId}/interest/status/${id}`,
    },
    // Seller interests by owner
    seller: {
      list: (ownerId) => `/interest/${ownerId}`,
    },
    // Admin status update
    status: (id) => `/interest/status/${id}`,
  },

  // Review endpoints
  reviews: {
    list: '/reviews',
    websiteService: '/reviews/website-service',
    property: (propertyId) => `/reviews/property/${propertyId}`,
    create: '/reviews',
    get: (reviewId) => `/reviews/${reviewId}`,
    update: (reviewId) => `/reviews/${reviewId}`,
    delete: (reviewId) => `/reviews/${reviewId}`,
    status: (reviewId) => `/reviews/${reviewId}/status`,
    user: (userId) => `/reviews/user/${userId}`,
    stats: '/reviews/stats',
  },

  // Selling endpoints
  selling: {
    paymentInit: (propertyId) => `/properties/${propertyId}/selling/process-payment`,
    paymentVerify: (tx_ref) => `/selling/verify-payment/${tx_ref}`,
    create: (propertyId) => `/properties/${propertyId}/selling`,
    list: `/selling`,
    get: (sellingId) => `/selling/${sellingId}`,
    update: (sellingId) => `/selling/${sellingId}`,
    delete: (sellingId) => `/selling/${sellingId}`,
    stats: `/selling/selling-stats`,
  },

  // Subscription endpoints
  subscription: {
    // User subscription plans (admin/seller/agent)
    plans: '/subscription/plans',
    // Legacy keys kept for backward-compat; prefer plans/plans/:id going forward
    list: '/subscription/plans',
    create: '/subscription/plans',
    createPlan: '/subscription/create-plan',
    get: (id) => `/subscription/plans/${id}`,
    update: (id) => `/subscription/plans/${id}`,
    delete: (id) => `/subscription/plans/${id}`,
    paymentVerify: (tx_ref) => `/subscription/verify-payment/${tx_ref}`,
    predefinedPlans: '/subscription/plans/predefined',
    checkStatus: '/subscription/check-status',
    createPredefinedPlan: '/subscription/plans/predefined/create',
    updatePredefinedPlan: (id) => `/subscription/plans/predefined/${id}`,
    deletePredefinedPlan: (id) => `/subscription/plans/predefined/${id}`,
  },

  // Message endpoints
  messages: {
    list: '/messages',
    create: '/messages',
    property: '/messages/property',
    adminEmployee: '/messages/admin-employee',
    get: (id) => `/messages/${id}`,
    update: (id) => `/messages/${id}`,
    delete: (id) => `/messages/${id}`,
    myMessages: '/messages/my-messages',
    sent: '/messages/sent',
    received: '/messages/received',
    markRead: (id) => `/messages/${id}/read`,
    archive: (id) => `/messages/${id}/archive`,
    stats: '/messages/stats',
    bulk: '/messages/bulk',
    templates: '/messages/templates',
    createTemplate: '/messages/templates',
    // New enhanced endpoints
    search: '/messages/search',
    thread: (threadId) => `/messages/thread/${threadId}`,
    reply: (id) => `/messages/${id}/reply`,
    unreadCount: '/messages/unread-count',
    markMultipleRead: '/messages/mark-multiple-read',
    analytics: '/messages/analytics',
  },

  // Favorites endpoints
  favorites: {
    list: '/users/favorites',
    add: '/users/favorites',
    remove: (propertyId) => `/users/favorites/${propertyId}`,
    clear: '/users/favorites',
    check: (propertyId) => `/users/favorites/${propertyId}/check`,
  },

  // Contact endpoints
  contact: {
    submit: '/contact/submit',
    list: '/contact',
    get: (id) => `/contact/${id}`,
    update: (id) => `/contact/${id}`,
    delete: (id) => `/contact/${id}`,
    stats: '/contact/stats',
    addNote: (id) => `/contact/${id}/notes`,
    assign: (id) => `/contact/${id}/assign`,
    departments: '/contact/departments',
    faqs: '/contact/faqs',
    myContacts:(id)=> `/contact/${id}`,
    // Admin department management
    adminDepartments: {
      list: '/contact/admin/departments',
      create: '/contact/admin/departments',
      update: (id) => `/contact/admin/departments/${id}`,
      delete: (id) => `/contact/admin/departments/${id}`,
    },
    // Admin FAQ management
    adminFAQs: {
      list: '/contact/admin/faqs',
      create: '/contact/admin/faqs',
      update: (id) => `/contact/admin/faqs/${id}`,
      delete: (id) => `/contact/admin/faqs/${id}`,
    },
    // Public FAQ rating
    rateFAQ: (id) => `/contact/faqs/${id}/rate`,
  },

  // Notification endpoints
  notifications: {
    list: '/notifications',
    stats: '/notifications/stats',
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    delete: (id) => `/notifications/${id}`,
    unreadCount: '/notifications/unread-count',
  },

  // About endpoints
  about: {
    content: '/about',
    update: '/about',
  },
};

export default api;
