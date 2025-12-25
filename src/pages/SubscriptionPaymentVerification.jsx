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
          <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl font-black mb-2">Subscription Payment Successful!</h2>
              <p className="text-white/90 text-lg">Your subscription has been activated successfully. You can now create and manage properties.</p>
            </div>
            
            {verificationData && (
              <div className="p-8">
                <h3 className="text-2xl font-black text-foreground mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <span className="text-sm text-muted-foreground">Transaction ID:</span>
                    <div className="font-mono font-bold text-foreground mt-1">{verificationData.tx_ref}</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <div className="text-2xl font-black text-foreground mt-1">{verificationData.currency} {verificationData.amount}</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <div className="font-semibold text-foreground mt-1">{new Date(verificationData.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">{verificationData.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-8 flex gap-4">
              <button 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                onClick={handleCreateProperty}
              >
                <Plus size={20} />
                Create Your First Property
              </button>
              <button 
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white rounded-lg font-semibold hover:border-ethiopian-green hover:text-ethiopian-green transition-all flex items-center justify-center gap-2"
                onClick={handleGoHome}
              >
                <Home size={20} />
                Go to Home
              </button>
            </div>
          </div>
        );
        
      case 'pending':
        return (
          <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 text-white text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl font-black mb-2">Payment Verification in Progress</h2>
              <p className="text-white/90 text-lg">We're currently verifying your payment. This usually takes a few moments.</p>
            </div>
            
            {verificationData && (
              <div className="p-8">
                <h3 className="text-2xl font-black text-foreground mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <span className="text-sm text-muted-foreground">Transaction ID:</span>
                    <div className="font-mono font-bold text-foreground mt-1">{verificationData.tx_ref}</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <div className="text-2xl font-black text-foreground mt-1">{verificationData.currency} {verificationData.amount}</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <div className="font-semibold text-foreground mt-1">{new Date(verificationData.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">{verificationData.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="px-8 pb-6">
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <p className="font-semibold text-foreground mb-2">Attempt {retryCount + 1} of {maxRetries + 1}</p>
                {retryCount < maxRetries ? (
                  <p className="text-muted-foreground">Auto-retrying in a few seconds...</p>
                ) : (
                  <p className="text-muted-foreground">Maximum retries reached. Please try again manually.</p>
                )}
              </div>
              
              <div className="flex gap-4">
                <button 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRetry} 
                  disabled={retryCount >= maxRetries}
                >
                  <RefreshCw size={20} />
                  {retryCount >= maxRetries ? 'Max Retries Reached' : 'Retry Verification'}
                </button>
                <button 
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white rounded-lg font-semibold hover:border-ethiopian-green hover:text-ethiopian-green transition-all flex items-center justify-center gap-2"
                  onClick={handleGoHome}
                >
                  <Home size={20} />
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'failed':
        return (
          <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <XCircle className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl font-black mb-2">Payment Verification Failed</h2>
              <p className="text-white/90 text-lg">We couldn't verify your payment. Please check your payment details and try again.</p>
            </div>
            
            {error && (
              <div className="p-8">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <h3 className="font-bold text-red-900 mb-2">Error Details</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            <div className="p-8 flex gap-4">
              <button 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                onClick={() => navigate('/subscription')}
              >
                <ArrowRight size={20} />
                Try Again
              </button>
              <button 
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white rounded-lg font-semibold hover:border-ethiopian-green hover:text-ethiopian-green transition-all flex items-center justify-center gap-2"
                onClick={handleGoHome}
              >
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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <RefreshCw className="w-12 h-12 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-black mb-2">Verifying Payment...</h2>
            <p className="text-white/90">Please wait while we verify your subscription payment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {renderStatusContent()}
      </div>
    </div>
  );
};

export default SubscriptionPaymentVerification;
