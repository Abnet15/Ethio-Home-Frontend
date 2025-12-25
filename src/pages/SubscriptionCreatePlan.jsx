import { RefreshCw, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { subscriptionService } from '../services/subscriptionService';

const SubscriptionCreatePlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(true);

  useEffect(() => {
    const statePlan = location.state?.plan;

    if (!statePlan || !statePlan.interval || typeof statePlan.amount !== 'number') {
      navigate('/subscription', { state: { message: 'Please choose a plan to continue.' } });
      return;
    }

    const submit = async () => {
      try {
        setIsSubmitting(true);
        setError('');
        const payload = {
          interval: statePlan.interval,
          amount: statePlan.amount,
          frequency: statePlan.frequency || 1,
          planId: statePlan._id, // Include plan ID for proper property count reset
          maxProperties: statePlan.maxProperties // Include maxProperties for the plan
        };
        const result = await subscriptionService.createPlan(payload);
        if (result.success && result.data?.data?.checkout_url) {
          window.location.replace(result.data.data.checkout_url);
        } else {
          throw new Error(result.error || 'Failed to initiate subscription payment');
        }
      } catch (e) {
        setError(e.message || 'Failed to initiate subscription payment');
        setIsSubmitting(false);
      }
    };

    submit();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      {isSubmitting ? (
        <div className="max-w-md w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <RefreshCw className="w-12 h-12 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-black mb-2">Redirecting to secure payment...</h2>
            <p className="text-white/90">Please wait while we open the Chapa checkout.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2">We couldn't start the payment</h3>
            <p className="text-white/90">{error}</p>
          </div>
          <div className="p-8">
            <button 
              className="w-full px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all" 
              onClick={() => navigate('/subscription')}
            >
              Back to Plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCreatePlan;
