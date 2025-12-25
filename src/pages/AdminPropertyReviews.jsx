import React from 'react';

import ReviewManagement from '../components/ReviewManagement';

const AdminPropertyReviews = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
        <div className="container mx-auto">
          <h1 className="text-4xl font-black mb-2">Property Reviews</h1>
          <p className="text-white/90">Manage and moderate property reviews</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
          <ReviewManagement userRole="admin" showStats={true} showActions={true} forcedReviewType="property" headerTitle="Property Reviews" />
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyReviews;
