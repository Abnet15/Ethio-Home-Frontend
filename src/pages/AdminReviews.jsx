import React, { useState } from 'react';

import ReviewManagement from '../components/ReviewManagement';

const AdminReviews = () => {
  const [type, setType] = useState('website_service');

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Reviews</h3>
              <div className="flex items-center gap-2">
                <button 
                  className={`btn btn-sm ${type === 'website_service' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setType('website_service')}
                >
                  Website Reviews
                </button>
                <button 
                  className={`btn btn-sm ${type === 'property' ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setType('property')}
                >
                  Property Reviews
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <ReviewManagement 
              userRole="admin" 
              showStats={true} 
              showActions={true} 
              forcedReviewType={type} 
              headerTitle={type === 'website_service' ? 'Website Service Reviews' : 'Property Reviews'}
              sidebarLayout={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
