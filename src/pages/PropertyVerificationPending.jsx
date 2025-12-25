import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PropertyVerificationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const createdId = location.state?.createdId;

  const goToDashboard = () => {
    const role = JSON.parse(localStorage.getItem('user') || '{}')?.role;
    const path = role === 'agent' ? '/agent-dashboard' : role === 'seller' ? '/seller-dashboard' : '/dashboard';
    navigate(path);
  };

  const viewProperty = () => {
    if (createdId) navigate(`/properties/${createdId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-ethiopian-yellow to-ethiopian-yellow/90 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">We will verify your property soon</h1>
          <p className="text-gray-800">
            Thank you for submitting your listing. Our team will review and verify it shortly. You will be notified once it is approved.
          </p>
        </div>
        <div className="p-8 flex gap-4 justify-center">
          <button 
            className="px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-xl font-semibold hover:shadow-xl transition-all" 
            onClick={goToDashboard}
          >
            Go to Dashboard
          </button>
          <button 
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white rounded-xl font-semibold hover:border-ethiopian-green hover:text-ethiopian-green transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={viewProperty} 
            disabled={!createdId}
          >
            View Submitted Property
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyVerificationPending;


