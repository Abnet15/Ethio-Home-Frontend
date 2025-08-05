import { Home, LayoutDashboard, ArrowRight } from 'lucide-react';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PurchasedProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="payment-container">
      <div className="success-container">
        <h1>Thank you for your purchase!</h1>
        <p>Your property is now available.</p>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate(propertyId ? `/properties/${propertyId}` : '/')}
          >
            <Home size={20} />
            {propertyId ? 'View Property' : 'Go Home'}
          </button>

          <button
            className="btn btn-outline"
            onClick={() => navigate('/buyer-dashboard')}
          >
            <LayoutDashboard size={20} />
            Go to Dashboard
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            <ArrowRight size={20} />
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchasedProperty;


