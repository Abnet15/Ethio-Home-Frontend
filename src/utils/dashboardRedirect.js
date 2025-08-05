/**
 * Utility function to get the appropriate dashboard path based on user role
 * @param {string} userRole - The user's role
 * @returns {string} The dashboard path for the user's role
 */
export const getDashboardPath = (userRole) => {
  switch (userRole) {
    case 'buyer':
      return '/buyer-dashboard';
    case 'seller':
      return '/seller-dashboard';
    case 'agent':
      return '/agent-dashboard';
    case 'admin':
      return '/admin-dashboard';
    case 'employee':
      return '/employee-dashboard';
    default:
      return '/buyer-dashboard'; // Default fallback
  }
};

/**
 * Utility function to redirect user to their role-specific dashboard
 * @param {string} userRole - The user's role
 * @param {function} navigate - React Router's navigate function
 * @param {object} options - Navigation options (optional)
 */
export const redirectToDashboard = (userRole, navigate, options = {}) => {
  const dashboardPath = getDashboardPath(userRole);
  navigate(dashboardPath, options);
};

