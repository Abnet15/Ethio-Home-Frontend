import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  console.log('PrivateRoute rendering');
  
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('AuthProvider not available:', error);
    return (
      <div className="error-container">
        <p>Authentication service is not available. Please refresh the page.</p>
      </div>
    );
  }
  
  const { user, isAuthenticated, loading } = authContext;
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Note: Backend removes isVerified from user object when user is verified
  // If user exists and has a token, they are considered verified and can access protected routes

  // If allowedRoles is specified, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated, verified, and has required role
  return children;
};

export default PrivateRoute;


