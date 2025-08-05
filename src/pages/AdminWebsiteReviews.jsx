import React from 'react';

import ReviewManagement from '../components/ReviewManagement';

const AdminWebsiteReviews = () => {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Website Service Reviews</h3>
          </div>
          <div className="card-body">
            <ReviewManagement 
              userRole="admin" 
              showStats={true} 
              showActions={true} 
              forcedReviewType="website_service" 
              headerTitle="Website Service Reviews" 
              sidebarLayout={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWebsiteReviews;
