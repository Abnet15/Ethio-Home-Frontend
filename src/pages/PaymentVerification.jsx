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
      <div className="payment-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verifying payment...</p>
          <p className="small-text">Transaction ID: {tx_ref}</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    const propertyIdFromRef = tx_ref ? String(tx_ref).split('-')[0] : null;
    return (
      <div className="payment-container">
        <div className="success-container">
          <div className="success-header">
            <CheckCircle size={80} className="success-icon" />
            <h1>Payment Verified Successfully!</h1>
            <p className="success-message">
              Your payment has been confirmed and processed successfully.
            </p>
          </div>

          <div className="payment-details">
            <div className="details-header">
              <h2>Payment Verification Details</h2>
              <div className="transaction-id">
                Transaction ID: <span>{tx_ref}</span>
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">
                  <DollarSign size={20} />
                  <span>Amount Paid</span>
                </div>
                <div className="detail-value">
                  {formatCurrency(verificationData?.amount || 0)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <Calendar size={20} />
                  <span>Payment Date</span>
                </div>
                <div className="detail-value">
                  {formatDate(verificationData?.created_at)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <CreditCard size={20} />
                  <span>Payment Method</span>
                </div>
                <div className="detail-value">
                  {verificationData?.method || 'Chapa Payment Gateway'}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <User size={20} />
                  <span>Customer Name</span>
                </div>
                <div className="detail-value">
                  {verificationData?.first_name} {verificationData?.last_name}
                </div>
              </div>
            </div>

            <div className="chapa-details">
              <h3>Chapa Payment Information</h3>
              <div className="chapa-grid">
                <div className="chapa-item">
                  <span>Status:</span>
                  <span className="status-success">
                    {verificationData?.status}
                  </span>
                </div>
                <div className="chapa-item">
                  <span>Currency:</span>
                  <span>{verificationData?.currency}</span>
                </div>
                <div className="chapa-item">
                  <span>Reference:</span>
                  <span>{verificationData?.reference || 'N/A'}</span>
                </div>
                <div className="chapa-item">
                  <span>Created:</span>
                  <span>{formatDate(verificationData?.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="next-steps">
            <h3>What Happens Next?</h3>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Payment Confirmed</h4>
                  <p>Your payment has been verified and confirmed in our system.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Property Transfer</h4>
                  <p>Our team will process your property purchase and update the records.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Documentation</h4>
                  <p>You will receive all necessary documentation for your property ownership.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-secondary"
              onClick={handleDownloadReceipt}
            >
              <Download size={20} />
              Download Receipt
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/review-form/${propertyIdFromRef || 'service'}`)}
            >
              <MessageSquare size={20} />
              Share Your Experience
            </button>
            
            <button 
              className="btn btn-outline"
              onClick={() => navigate(propertyIdFromRef ? `/properties/${propertyIdFromRef}` : '/buyer-dashboard')}
            >
              <Home size={20} />
              {propertyIdFromRef ? 'View Your Property' : 'Go to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'pending') {
    return (
      <div className="payment-container">
        <div className="pending-container">
          <Clock size={64} className="pending-icon" />
          <h2>Payment Verification Pending</h2>
          <p>Your payment is still being processed. Please wait while we verify the transaction.</p>
          
          <div className="verification-info">
            <div className="info-item">
              <span>Transaction ID:</span>
              <span className="tx-ref">{tx_ref}</span>
            </div>
            <div className="info-item">
              <span>Retry Count:</span>
              <span>{retryCount}/5</span>
            </div>
            <div className="info-item">
              <span>Auto-retry:</span>
              <span>{autoRetry ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          <div className="spinner"></div>
          <p className="small-text">Automatically retrying verification every 5 seconds...</p>
          
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={handleManualRetry}
            >
              <RefreshCw size={20} />
              Retry Now
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => redirectToDashboard(user?.role, navigate)}
            >
              <ArrowLeft size={20} />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="payment-container">
        <div className="error-container">
          <XCircle size={64} className="error-icon" />
          <h2>Payment Verification Failed</h2>
          <p>{error || 'We were unable to verify your payment. Please try again or contact support.'}</p>
          
          <div className="verification-info">
            <div className="info-item">
              <span>Transaction ID:</span>
              <span className="tx-ref">{tx_ref}</span>
            </div>
            <div className="info-item">
              <span>Error:</span>
              <span className="error-message">{error}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={handleManualRetry}
            >
              <RefreshCw size={20} />
              Try Again
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => redirectToDashboard(user?.role, navigate)}
            >
              <ArrowLeft size={20} />
              Go to Dashboard
            </button>
            
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/contact')}
            >
              <AlertCircle size={20} />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="error-container">
        <AlertCircle size={64} className="error-icon" />
        <h2>Verification Error</h2>
        <p>An unexpected error occurred during payment verification.</p>
        
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={20} />
            Reload Page
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => redirectToDashboard(user?.role, navigate)}
          >
            <ArrowLeft size={20} />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;
