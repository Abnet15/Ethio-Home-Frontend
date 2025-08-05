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
    <div className="verification-page" style={{minHeight:'60vh', display:'grid', placeItems:'center', padding:'40px 16px'}}>
      {isSubmitting ? (
        <div className="loading-content" style={{textAlign:'center'}}>
          <RefreshCw size={64} className="loading-icon" />
          <h2>Redirecting to secure payment...</h2>
          <p>Please wait while we open the Chapa checkout.</p>
        </div>
      ) : (
        <div style={{textAlign:'center', maxWidth:480}}>
          <AlertCircle size={48} style={{color:'#DC2626', marginBottom:12}} />
          <h3>We couldn\'t start the payment</h3>
          <p style={{color:'#6b7280', marginTop:8}}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/subscription')}>Back to Plans</button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCreatePlan;
