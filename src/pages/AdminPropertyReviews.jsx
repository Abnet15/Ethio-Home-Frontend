import React from 'react';

import ReviewManagement from '../components/ReviewManagement';

const AdminPropertyReviews = () => {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Property Reviews</h3>
          </div>
          <div className="card-body">
            <ReviewManagement userRole="admin" showStats={true} showActions={true} forcedReviewType="property" headerTitle="Property Reviews" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyReviews;
