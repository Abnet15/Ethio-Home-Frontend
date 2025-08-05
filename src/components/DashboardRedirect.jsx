import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { redirectToDashboard } from '../utils/dashboardRedirect';

const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect based on user role
    redirectToDashboard(user?.role, navigate);
  }, [user, isAuthenticated, navigate]);

  // Show loading state while redirecting
  return (
    <div className="dashboard-redirect">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Redirecting to your dashboard...</p>
      </div>

      <style>{`
        .dashboard-redirect {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }

        .loading-container {
          text-align: center;
          color: var(--text-secondary);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DashboardRedirect;

