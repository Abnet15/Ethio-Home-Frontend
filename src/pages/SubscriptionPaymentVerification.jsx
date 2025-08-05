import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Home,
  Plus,
  RefreshCw
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { subscriptionService } from '../services/subscriptionService';
import '../styles/subscription-payment-verification.css';

const SubscriptionPaymentVerification = () => {
  const { tx_ref } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (tx_ref) {
      verifyPayment();
    }
  }, [tx_ref]);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);
      setError('');
      
      const result = await subscriptionService.verifyPayment(tx_ref);
      console.log(result);
      if (result.success) {
        setVerificationData(result.data.data.data);
        if (result.data.status === 'success') {
        console.log('here is bro1');
          setVerificationStatus('success');
        } else if (result.data.data.status === 'pending') {
          setVerificationStatus('pending');
          // Auto-retry for pending payments
          if (retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              verifyPayment();
            }, 5000); // Retry after 5 seconds
          }
        } else {
          setVerificationStatus('failed');
        }
      } else {
        throw new Error(result.error || 'Payment verification failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify payment');
      setVerificationStatus('failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    verifyPayment();
  };

  const handleCreateProperty = async () => {
    // Refresh subscription status before navigating to ensure it's up to date
    try {
      // Small delay to ensure backend has processed the payment
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/properties/new');
    } catch (err) {
      console.error('Error refreshing subscription status:', err);
      // Navigate anyway if there's an error
      navigate('/properties/new');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const renderStatusContent = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="status-content success">
            <CheckCircle size={64} className="status-icon" />
            <h2>Subscription Payment Successful!</h2>
            <p>Your subscription has been activated successfully. You can now create and manage properties.</p>
            
            {verificationData && (
              <div className="payment-details">
                <h3>Payment Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Transaction ID:</span>
                    <span className="value">{verificationData.tx_ref}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value">{verificationData.currency} {verificationData.amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(verificationData.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value success-text">{verificationData.status}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="action-buttons">
              <button className="btn-primary" onClick={handleCreateProperty}>
                <Plus size={20} />
                Create Your First Property
              </button>
              <button className="btn-secondary" onClick={handleGoHome}>
                <Home size={20} />
                Go to Home
              </button>
            </div>
          </div>
        );
        
      case 'pending':
        return (
          <div className="status-content pending">
            <Clock size={64} className="status-icon" />
            <h2>Payment Verification in Progress</h2>
            <p>We're currently verifying your payment. This usually takes a few moments.</p>
            
            {verificationData && (
              <div className="payment-details">
                <h3>Payment Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Transaction ID:</span>
                    <span className="value">{verificationData.tx_ref}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value">{verificationData.currency} {verificationData.amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(verificationData.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value pending-text">{verificationData.status}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="verification-info">
              <p>Attempt {retryCount + 1} of {maxRetries + 1}</p>
              {retryCount < maxRetries ? (
                <p>Auto-retrying in a few seconds...</p>
              ) : (
                <p>Maximum retries reached. Please try again manually.</p>
              )}
            </div>
            
            <div className="action-buttons">
              <button className="btn-primary" onClick={handleRetry} disabled={retryCount >= maxRetries}>
                <RefreshCw size={20} />
                {retryCount >= maxRetries ? 'Max Retries Reached' : 'Retry Verification'}
              </button>
              <button className="btn-secondary" onClick={handleGoHome}>
                <Home size={20} />
                Go to Home
              </button>
            </div>
          </div>
        );
        
      case 'failed':
        return (
          <div className="status-content failed">
            <XCircle size={64} className="status-icon" />
            <h2>Payment Verification Failed</h2>
            <p>We couldn't verify your payment. Please check your payment details and try again.</p>
            
            {error && (
              <div className="error-details">
                <h3>Error Details</h3>
                <p className="error-message">{error}</p>
              </div>
            )}
            
            <div className="action-buttons">
              <button className="btn-primary" onClick={() => navigate('/subscription')}>
                <ArrowRight size={20} />
                Try Again
              </button>
              <button className="btn-secondary" onClick={handleGoHome}>
                <Home size={20} />
                Go to Home
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isVerifying && verificationStatus === 'pending') {
    return (
      <div className="verification-page">
        <div className="verification-container">
          <div className="loading-content">
            <RefreshCw size={64} className="loading-icon" />
            <h2>Verifying Payment...</h2>
            <p>Please wait while we verify your subscription payment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-page">
      <div className="verification-container">
        {renderStatusContent()}
      </div>
    </div>
  );
};

export default SubscriptionPaymentVerification;
