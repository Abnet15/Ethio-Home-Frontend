import { 
  CheckCircle, 
  Home, 
  FileText, 
  ArrowRight,
  Download,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  CreditCard
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { redirectToDashboard } from '../utils/dashboardRedirect';
import '../styles/payment.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state) {
      setPaymentData(location.state);
      setLoading(false);
    } else {
      // If no state, try to get from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const txRef = urlParams.get('tx_ref');
      
      if (txRef) {
        // You could fetch payment details here if needed
        setPaymentData({ txRef });
      }
      
      setLoading(false);
    }
  }, [location.state]);

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
    // Generate and download receipt
    const receiptData = {
      transactionId: paymentData?.txRef || 'N/A',
      amount: paymentData?.amount || 'N/A',
      date: new Date().toLocaleDateString(),
      propertyId: paymentData?.propertyId || 'N/A',
      buyer: user?.name || 'N/A'
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${paymentData?.txRef || 'payment'}.json`;
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
          <p>Loading payment confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-2">Payment Successful!</h1>
            <p className="text-white/90 text-lg">
              Your payment has been processed successfully. Thank you for your purchase!
            </p>
          </div>

        <div className="payment-details">
          <div className="details-header">
            <h2>Payment Details</h2>
            <div className="transaction-id">
              Transaction ID: <span>{paymentData?.txRef || 'N/A'}</span>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-label">
                <DollarSign size={20} />
                <span>Amount Paid</span>
              </div>
              <div className="detail-value">
                {formatCurrency(paymentData?.amount || 0)}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Calendar size={20} />
                <span>Payment Date</span>
              </div>
              <div className="detail-value">
                {formatDate(new Date())}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <CreditCard size={20} />
                <span>Payment Method</span>
              </div>
              <div className="detail-value">
                Chapa Payment Gateway
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Home size={20} />
                <span>Property ID</span>
              </div>
              <div className="detail-value">
                {paymentData?.propertyId || 'N/A'}
              </div>
            </div>
          </div>

          {paymentData?.paymentData && (
            <div className="chapa-details">
              <h3>Chapa Payment Information</h3>
              <div className="chapa-grid">
                <div className="chapa-item">
                  <span>Status:</span>
                  <span className={`status-${paymentData.paymentData.status}`}>
                    {paymentData.paymentData.status}
                  </span>
                </div>
                <div className="chapa-item">
                  <span>Currency:</span>
                  <span>{paymentData.paymentData.currency}</span>
                </div>
                <div className="chapa-item">
                  <span>Reference:</span>
                  <span>{paymentData.paymentData.reference || 'N/A'}</span>
                </div>
                <div className="chapa-item">
                  <span>Created:</span>
                  <span>{formatDate(paymentData.paymentData.created_at)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="next-steps">
          <h3>What Happens Next?</h3>
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Payment Confirmation</h4>
                <p>You will receive a confirmation email with your payment details.</p>
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
            onClick={() => redirectToDashboard(user?.role, navigate)}
          >
            <FileText size={20} />
            View My Properties
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/properties')}
          >
            <Home size={20} />
            Browse More Properties
          </button>
        </div>

        <div className="contact-info">
          <h3>Need Help?</h3>
          <p>If you have any questions about your payment or property purchase, please contact us:</p>
          <div className="contact-methods">
            <div className="contact-method">
              <Mail size={20} />
              <span>support@ethiohome.com</span>
            </div>
            <div className="contact-method">
              <Phone size={20} />
              <span>+251 911 123 456</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
