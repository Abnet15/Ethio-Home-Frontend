import { 
  Lock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Shield,
  Clock,
  DollarSign,
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertCircle,
  Building,
  Calendar,
  Star
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { propertyService } from '../services/propertyService';
import { sellingService } from '../services/sellingService';
import '../styles/payment.css';
import { getPropertyCoverImage } from '../utils/imageUtils';

const Payment = () => {
  const { propertyId } = useParams();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [txRef, setTxRef] = useState(null);
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    currency: 'ETB',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    country: 'Ethiopia'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!propertyId) {
      navigate('/properties');
      return;
    }

    fetchProperty();
  }, [propertyId, isAuthenticated, navigate, location.pathname]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const result = await propertyService.getProperty(propertyId);
      
      if (result.success) {
        const propertyData = result.data?.data?.data;
        setProperty(propertyData);
        
        if (user) {
          const nameParts = user.name ? user.name.split(' ') : ['', ''];
          setPaymentForm(prev => ({
            ...prev,
            amount: propertyData.price?.toString() || '',
            email: user.email || '',
            firstName: nameParts[0] || '',
            lastName: nameParts[1] || '',
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || ''
          }));
        }
      } else {
        setError('Failed to load property details');
      }
    } catch (err) {
      setError('Error loading property details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    try {
      setPaymentLoading(true);
      setError(null);
      setPaymentStatus('pending');
      
      const paymentData = {
        amount: parseFloat(paymentForm.amount),
        currency: paymentForm.currency,
        email: paymentForm.email,
        first_name: paymentForm.firstName,
        last_name: paymentForm.lastName,
        phone_number: paymentForm.phone,
        callback_url: `${window.location.origin}/api/v1/properties`,
        return_url: `${window.location.origin}/selling/verify-payment/${propertyId}?tx_ref=`,
        tx_ref: `${propertyId}-${user._id}-${Date.now()}`
      };
      
      const result = await sellingService.processPayment({
        propertyId,
        ...paymentData
      });
      
      if (result.success) {
        const responseData = result.data;
        
        if (responseData.status === 'success' && responseData.data?.checkout_url) {
          setTxRef(responseData.tx_ref);
          window.location.href = responseData.data.checkout_url;
        } else {
          setPaymentStatus('failed');
          setError('Failed to initialize payment. Please try again.');
        }
      } else {
        setPaymentStatus('failed');
        setError(result.error || 'Payment initialization failed');
      }
    } catch (err) {
      setPaymentStatus('failed');
      setError('Payment processing error. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="payment-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !paymentStatus) {
    return (
      <div className="payment-container">
        <div className="error-container">
          <XCircle size={48} className="error-icon" />
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/properties/${propertyId}`)}
          >
            <ArrowLeft size={16} />
            Back to Property
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="payment-container">
        <div className="success-container">
          <CheckCircle size={64} className="success-icon" />
          <h2>Payment Successful!</h2>
          <p>Your payment has been processed successfully.</p>
          <p>Redirecting to confirmation page...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="payment-container">
        <div className="error-container">
          <XCircle size={64} className="error-icon" />
          <h2>Payment Failed</h2>
          <p>{error || 'Your payment could not be processed.'}</p>
          <button 
            className="btn btn-primary"
            onClick={() => setPaymentStatus(null)}
          >
            Try Again
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/properties/${propertyId}`)}
          >
            <ArrowLeft size={16} />
            Back to Property
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="payment-container">
        <div className="pending-container">
          <Clock size={64} className="pending-icon" />
          <h2>Payment Processing</h2>
          <p>Your payment is being processed. Please wait...</p>
          <div className="spinner"></div>
          <p className="small-text">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
            <button 
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
              onClick={() => navigate(`/properties/${propertyId}`)}
            >
              <ArrowLeft size={20} />
              Back to Property
            </button>
            <h1 className="text-4xl font-black mb-2">Complete Your Purchase</h1>
            <p className="text-white/90">Secure payment powered by Chapa - Your trusted payment gateway</p>
          </div>
        </div>
          {/* Main Content */}
      <div className="payment-content">
        {/* Left Column - Payment Information */}
        <div className="payment-form-section">
          <div className="form-header">
            <div className="header-main">
              <h2>Payment Information</h2>
              <div className="security-badge">
                <Shield size={16} />
                <span>Secure Payment by Chapa</span>
              </div>
            </div>
            <p className="header-description">
              Review your property details and proceed with secure payment
            </p>
          </div>

          <form onSubmit={handlePayment} className="payment-form">
            {/* Property Details Card */}
            {property && (
              <div className="property-card">
                <div className="property-header">
                  <Building size={24} className="property-icon" />
                  <h3>Property Details</h3>
                </div>
                
                <div className="property-content">
                  <div className="property-image-section">
                    <div className="property-image">
                      <img 
                        src={getPropertyCoverImage(property) || '/hero-bg-1.jpg'} 
                        alt={property?.title || 'Property'}
                      />
                    </div>
                    <div className="property-badge">
                      <Star size={16} />
                      <span>Featured Property</span>
                    </div>
                  </div>
                  
                  <div className="property-info">
                    <h4 className="property-title">{property?.title || 'Commercial Property'}</h4>
                    <p className="property-location">
                      <MapPin size={16} />
                      {property?.location || 'Location not specified'}
                    </p>
                    <div className="property-meta">
                      <span className="meta-item">
                        <Home size={16} />
                        {property?.propertyType || 'Commercial'}
                      </span>
                      <span className="meta-item">
                        <Calendar size={16} />
                        {property?.yearBuilt || '2024'}
                      </span>
                    </div>
                    <div className="property-price-display">
                      <span className="price-label">Property Price</span>
                      <span className="price-value">{formatCurrency(property?.price || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Information */}
            <div className="payment-method-card">
              <div className="card-header">
                <CreditCard size={24} className="card-icon" />
                <h3>Payment Method</h3>
              </div>
              
              <div className="method-description">
                <p>You will be redirected to Chapa's secure payment gateway to complete your transaction.</p>
                <div className="payment-methods">
                  <span className="method-badge">💳 Credit/Debit Card</span>
                  <span className="method-badge">📱 Mobile Money</span>
                  <span className="method-badge">🏦 Bank Transfer</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="customer-info-card">
              <div className="card-header">
                <User size={24} className="card-icon" />
                <h3>Customer Information</h3>
              </div>
              
              <div className="info-note">
                <AlertCircle size={16} />
                <span>This information will be used for your payment. Please ensure it's correct.</span>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      value={paymentForm.firstName}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Last Name</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      value={paymentForm.lastName}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      value={paymentForm.email}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      value={paymentForm.phone}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>City</label>
                  <div className="input-wrapper">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      value={paymentForm.city}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Address</label>
                  <div className="input-wrapper">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      value={paymentForm.address}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="payment-button-section">
              <button 
                type="submit" 
                className="btn btn-primary payment-button"
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <div className="spinner-small"></div>
                    Initializing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Proceed to Payment - {formatCurrency(paymentForm.amount)}
                  </>
                )}
              </button>
              
              <p className="payment-note">
                <Lock size={16} />
                Your payment information is encrypted and secure
              </p>
            </div>
          </form>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="payment-summary-wrapper">
          <div className="payment-summary">
            <div className="summary-header">
              <h3>Payment Summary</h3>
              <Lock size={20} className="lock-icon" />
            </div>
            
            <div className="summary-content">
              <div className="summary-item">
                <span>Property Price</span>
                <span>{formatCurrency(property?.price || 0)}</span>
              </div>
              <div className="summary-item">
                <span>Processing Fee (2.5%)</span>
                <span>{formatCurrency((property?.price || 0) * 0.025)}</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount</span>
                <span>{formatCurrency((property?.price || 0) * 1.025)}</span>
              </div>
            </div>

            <div className="security-info">
              <h4>Security Features</h4>
              <div className="security-item">
                <Shield size={16} />
                <span>256-bit SSL encryption</span>
              </div>
              <div className="security-item">
                <Lock size={16} />
                <span>Secure payment by Chapa</span>
              </div>
              <div className="security-item">
                <Clock size={16} />
                <span>Instant confirmation</span>
              </div>
            </div>

            <div className="chapa-info">
              <div className="chapa-logo">
                <CreditCard size={24} />
                <span>Powered by Chapa</span>
              </div>
              <p>Your payment information is secure and encrypted. We never store your card details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Payment;
