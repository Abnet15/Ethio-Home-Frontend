import React, { useState } from 'react';

import ReviewManagement from '../components/ReviewManagement';

const AdminReviews = () => {
  const [type, setType] = useState('website_service');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black mb-2">Reviews</h1>
              <p className="text-white/90">Manage and moderate all reviews</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  type === 'website_service'
                    ? 'bg-white text-ethiopian-green'
                    : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white'
                }`} 
                onClick={() => setType('website_service')}
              >
                Website Reviews
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  type === 'property'
                    ? 'bg-white text-ethiopian-green'
                    : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white'
                }`} 
                onClick={() => setType('property')}
              >
                Property Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
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
  );
};

export default AdminReviews;
