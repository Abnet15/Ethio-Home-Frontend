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
    <div className="pending-container" style={{ maxWidth: 720, margin: '40px auto', padding: 24 }}>
      <div className="card" style={{ padding: 24, border: '1px solid var(--border-primary)', borderRadius: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div className="loading-spinner" style={{ width: 40, height: 40, margin: '0 auto 12px', borderWidth: 4 }}></div>
          <h1 style={{ margin: 0 }}>We will verify your property soon</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Thank you for submitting your listing. Our team will review and verify it shortly. You will be notified once it is approved.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={goToDashboard}>Go to Dashboard</button>
          <button className="btn btn-secondary" onClick={viewProperty} disabled={!createdId}>View Submitted Property</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyVerificationPending;


