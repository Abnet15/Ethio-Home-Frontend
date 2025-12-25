import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Home,
  FileText,
  Download,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  Shield,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { sellingService } from '../services/sellingService';
import { redirectToDashboard } from '../utils/dashboardRedirect';
import '../styles/payment.css';

const PaymentVerification = () => {
  const { tx_ref } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'success', 'failed'
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetry, setAutoRetry] = useState(true);

  useEffect(() => {
    console.log('tx_ref', tx_ref);
    // Do not force redirect; verification page should work immediately after payment return
    if (tx_ref) {
      verifyPayment(tx_ref);
    }
  }, [tx_ref]);

  const verifyPayment = async (paymentTxRef) => {
    try {
      setLoading(true);
      setError(null);
      console.log('verifyPayment 😁😁😁😋😋😋😊😉😉', paymentTxRef);
      const result = await sellingService.verifyPayment(paymentTxRef);
      console.log('verify result 😁😁😁😋😋😋😊😉😉', result);
      
      if (result.success) {
        const responseData = result.data;
        
        if (responseData.status === 'success') {
          const paymentData = responseData.data;
          console.log("paymentData set",paymentData);
          setVerificationData(paymentData);
          
          if (responseData.status === 'success') {
            console.log("paymentData.status === 'success'",paymentData.status);
            setVerificationStatus('success');
            // Stop auto-retry on success
            setAutoRetry(false);
            // Auto-redirect to review page after brief success display
            const propertyIdFromRef = paymentTxRef ? String(paymentTxRef).split('-')[0] : null;
            setTimeout(() => {
              navigate(`/review-form/${propertyIdFromRef || 'service'}`);
            }, 1500);
          } else if (paymentData.status === 'pending') {
            console.log("paymentData.status === 'pending'",paymentData.status);
            setVerificationStatus('pending');
            // Continue auto-retry for pending payments
            if (autoRetry && retryCount < 5) {
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                verifyPayment(paymentTxRef);
              }, 5000); // Retry every 5 seconds
            }
          } else {
            console.log("paymentData.status === 'else'");
            console.log("paymentData.status === 'failed'",paymentData.status);
            setVerificationStatus('failed');
            setError('Payment was not successful. Please contact support.');
            setAutoRetry(false);
          }
        } else {
          setVerificationStatus('failed');
          setError('Payment verification failed. Please try again.');
          setAutoRetry(false);
        }
      } else {
        setVerificationStatus('failed');
        setError(result.error || 'Payment verification error');
        setAutoRetry(false);
      }
    } catch (err) {
      setVerificationStatus('failed');
      setError('Payment verification error. Please try again.');
      setAutoRetry(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    setAutoRetry(true);
    verifyPayment(tx_ref);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadReceipt = () => {
    if (!verificationData) return;
    
    const receiptData = {
      transactionId: tx_ref,
      amount: verificationData.amount,
      date: verificationData.created_at || new Date().toISOString(),
      status: verificationData.status,
      currency: verificationData.currency,
      buyer: user?.name || 'N/A',
      paymentMethod: verificationData.method || 'Chapa'
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${tx_ref}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-foreground mb-2">Verifying payment...</p>
          <p className="text-sm text-muted-foreground">Transaction ID: {tx_ref}</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    const propertyIdFromRef = tx_ref ? String(tx_ref).split('-')[0] : null;
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-4xl font-black mb-2">Payment Verified Successfully!</h1>
              <p className="text-white/90 text-lg">
                Your payment has been confirmed and processed successfully.
              </p>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-foreground mb-2">Payment Verification Details</h2>
                <div className="text-sm text-muted-foreground">
                  Transaction ID: <span className="font-mono font-semibold">{tx_ref}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-5 w-5 text-ethiopian-yellow" />
                    <span className="text-sm font-semibold text-muted-foreground">Amount Paid</span>
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {formatCurrency(verificationData?.amount || 0)}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-ethiopian-yellow" />
                    <span className="text-sm font-semibold text-muted-foreground">Payment Date</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {formatDate(verificationData?.created_at)}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-ethiopian-yellow" />
                    <span className="text-sm font-semibold text-muted-foreground">Payment Method</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {verificationData?.method || 'Chapa Payment Gateway'}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-ethiopian-yellow" />
                    <span className="text-sm font-semibold text-muted-foreground">Customer Name</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {verificationData?.first_name} {verificationData?.last_name}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6 mb-6">
                <h3 className="text-xl font-black text-foreground mb-4">Chapa Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                      {verificationData?.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Currency:</span>
                    <span className="ml-2 font-semibold text-foreground">{verificationData?.currency}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Reference:</span>
                    <span className="ml-2 font-semibold text-foreground">{verificationData?.reference || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="ml-2 font-semibold text-foreground">{formatDate(verificationData?.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-black text-foreground mb-4">What Happens Next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-ethiopian-green text-white flex items-center justify-center font-black flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Payment Confirmed</h4>
                      <p className="text-muted-foreground">Your payment has been verified and confirmed in our system.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-ethiopian-green text-white flex items-center justify-center font-black flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Property Transfer</h4>
                      <p className="text-muted-foreground">Our team will process your property purchase and update the records.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-ethiopian-green text-white flex items-center justify-center font-black flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Documentation</h4>
                      <p className="text-muted-foreground">You will receive all necessary documentation for your property ownership.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button 
                  className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg font-semibold transition-all flex items-center gap-2"
                  onClick={handleDownloadReceipt}
                >
                  <Download size={20} />
                  Download Receipt
                </button>
                
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2"
                  onClick={() => navigate(`/review-form/${propertyIdFromRef || 'service'}`)}
                >
                  <MessageSquare size={20} />
                  Share Your Experience
                </button>
                
                <button 
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white rounded-lg font-semibold hover:border-ethiopian-green hover:text-ethiopian-green transition-all flex items-center gap-2"
                  onClick={() => navigate(propertyIdFromRef ? `/properties/${propertyIdFromRef}` : '/buyer-dashboard')}
                >
                  <Home size={20} />
                  {propertyIdFromRef ? 'View Your Property' : 'Go to Dashboard'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 text-white text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Payment Verification Pending</h2>
            <p className="text-white/90">Your payment is still being processed. Please wait while we verify the transaction.</p>
          </div>
          <div className="p-8">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono font-semibold">{tx_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retry Count:</span>
                <span className="font-semibold">{retryCount}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auto-retry:</span>
                <span className="font-semibold">{autoRetry ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground text-center mb-6">Automatically retrying verification every 5 seconds...</p>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                onClick={handleManualRetry}
              >
                <RefreshCw size={20} />
                Retry Now
              </button>
              
              <button 
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white rounded-lg font-semibold hover:border-ethiopian-green hover:text-ethiopian-green transition-all flex items-center justify-center gap-2"
                onClick={() => redirectToDashboard(user?.role, navigate)}
              >
                <ArrowLeft size={20} />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Payment Verification Failed</h2>
            <p className="text-white/90">{error || 'We were unable to verify your payment. Please try again or contact support.'}</p>
          </div>
          <div className="p-8">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono font-semibold">{tx_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Error:</span>
                <span className="font-semibold text-red-600">{error}</span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                onClick={handleManualRetry}
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              
              <button 
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white rounded-lg font-semibold hover:border-ethiopian-green hover:text-ethiopian-green transition-all flex items-center justify-center gap-2"
                onClick={() => redirectToDashboard(user?.role, navigate)}
              >
                <ArrowLeft size={20} />
                Dashboard
              </button>
              
              <button 
                className="w-full px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                onClick={() => navigate('/contact')}
              >
                <AlertCircle size={20} />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2">Verification Error</h2>
          <p className="text-white/90">An unexpected error occurred during payment verification.</p>
        </div>
        <div className="p-8 flex gap-3">
          <button 
            className="flex-1 px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={20} />
            Reload Page
          </button>
          
          <button 
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white rounded-lg font-semibold hover:border-ethiopian-green hover:text-ethiopian-green transition-all flex items-center justify-center gap-2"
            onClick={() => redirectToDashboard(user?.role, navigate)}
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;
