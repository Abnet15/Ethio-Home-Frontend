import { 
  Star, 
  Building, 
  Globe, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { propertyService } from '../services/propertyService';
import { reviewService } from '../services/reviewService';
import { sellingService } from '../services/sellingService';

import '../styles/review-form.css';

// Progress Indicator Component
const ProgressIndicator = ({ progress }) => {
  return (
    <div className="progress-indicator">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const ReviewForm = () => {
  const { propertyId } = useParams();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasPurchasedProperties, setHasPurchasedProperties] = useState(false);
  const [purchasedProperties, setPurchasedProperties] = useState([]);
  const [progress, setProgress] = useState(0);
  
  const [reviewForm, setReviewForm] = useState({
    reviewType: 'website_service',
    propertyId: propertyId || null,
    title: '',
    review: '',
    rating: 5,
    location: ''
  });

  // Calculate form completion progress
  useEffect(() => {
    let completed = 0;
    const total = 4; // title, review, rating, and reviewType are required
    
    if (reviewForm.title.trim()) completed++;
    if (reviewForm.review.trim() && reviewForm.review.length >= 10) completed++;
    if (reviewForm.rating > 0) completed++;
    if (reviewForm.reviewType) completed++;
    
    setProgress((completed / total) * 100);
  }, [reviewForm]);

  useEffect(() => {
    // Do NOT auto-redirect to login here; allow page to render after payment
    const checkPurchaseHistory = async () => {
      if (user?._id) {
        try {
          const result = await sellingService.list({ buyer: user._id });
          if (result.success && result.data?.data?.data?.length > 0) {
            setHasPurchasedProperties(true);
            setPurchasedProperties(result.data.data.data);
          }
        } catch (err) {
          console.log('Could not check purchase history:', err);
        }
      }
    };

    checkPurchaseHistory();

    if (propertyId) {
      fetchProperty();
      setReviewForm(prev => ({ ...prev, reviewType: 'property', propertyId }));
    } else {
      setReviewForm(prev => ({ ...prev, reviewType: 'website_service', location: user?.location || '' }));
      setLoading(false);
    }
  }, [propertyId, user?.location, user?._id]);

  const fetchProperty = async () => {
    try {
      const result = await propertyService.getProperty(propertyId);
      if (result.success) {
        setProperty(result.data.data.property);
      } else {
        setError('Property not found');
      }
    } catch (err) {
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (newRating) => {
    setReviewForm(prev => ({
      ...prev,
      rating: newRating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.review.trim() || reviewForm.review.length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    if (!reviewForm.title.trim()) {
      setError('Please provide a title for your review');
      return;
    }

    // Validate property selection for property reviews
    if (reviewForm.reviewType === 'property' && !reviewForm.propertyId) {
      setError('Please select a property to review');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await reviewService.createReview(reviewForm);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/buyer-dashboard');
        }, 3000);
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/buyer-dashboard');
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              size={32}
              className={`${
                star <= reviewForm.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-[#4B5563] dark:text-[#A8B5AE]'
              } hover:scale-110 transition-transform`}
            />
          </button>
        ))}
        <span className="ml-3 text-lg font-medium text-[#1A1A1A] dark:text-[#A8B5AE]">
          {reviewForm.rating}/5
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#4B5563] dark:text-[#A8B5AE]">Loading review form...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Review Submitted Successfully!</h2>
            <p className="text-white/90">Thank you for your feedback. Your review has been submitted and is pending approval.</p>
            <p className="text-white/80 text-sm mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-4xl font-black mb-2">Share Your Experience</h1>
            <p className="text-white/90">
              {propertyId 
                ? `Tell us about your experience with this property`
                : 'Tell us about your experience with our service'
              }
            </p>
            <div className="mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-8">
        <div className="review-form-section">
          <div className="form-card">
            <div className="card-header">
              <div className="header-icon">
                {propertyId ? <Building size={24} /> : <Globe size={24} />}
              </div>
              <div>
                <h3>
                  {propertyId ? 'Property Review' : 'Website Service Review'}
                </h3>
                <p>
                  {propertyId 
                    ? 'Share your thoughts about this property'
                    : 'Share your overall experience with our platform'
                  }
                </p>
              </div>
            </div>

            {property && (
              <div className="property-summary">
                <div className="property-image">
                  <img 
                    src={property.images?.[0] || '/placeholder-property.jpg'} 
                    alt={property.title}
                  />
                </div>
                <div className="property-details">
                  <h4>{property.title}</h4>
                  <p className="property-location">
                    <MapPin size={16} />
                    {property.location}
                  </p>
                  <p className="property-price">
                    ${property.price?.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="review-form">
              {/* Review Type Selection */}
              <div className="form-group">
                <label className="form-label">Review Type</label>
                <div className="review-type-selector">
                  <label className="type-option">
                    <input
                      type="radio"
                      name="reviewType"
                      value="website_service"
                      checked={reviewForm.reviewType === 'website_service'}
                      onChange={handleInputChange}
                    />
                    <div className="type-content">
                      <Globe size={20} />
                      <span>Website Service</span>
                    </div>
                  </label>
                  
                  {(propertyId || hasPurchasedProperties) && (
                    <label className="type-option">
                      <input
                        type="radio"
                        name="reviewType"
                        value="property"
                        checked={reviewForm.reviewType === 'property'}
                        onChange={handleInputChange}
                      />
                      <div className="type-content">
                        <Building size={20} />
                        <span>Property</span>
                      </div>
                    </label>
                  )}
                  
                  {!propertyId && !hasPurchasedProperties && (
                    <div className="info-message" style={{ 
                      padding: '12px', 
                      backgroundColor: '#f0f9ff', 
                      border: '1px solid #0ea5e9', 
                      borderRadius: '8px', 
                      marginTop: '8px' 
                    }}>
                      <p style={{ margin: 0, color: '#0369a1', fontSize: '14px' }}>
                        You need to purchase at least one property to review properties. You can still review our website service.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Review Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={reviewForm.title}
                  onChange={handleInputChange}
                  placeholder="Give your review a title"
                  className="form-input"
                  required
                  maxLength={100}
                />
                <span className="char-count">
                  {reviewForm.title.length}/100
                </span>
              </div>

              {/* Rating */}
              <div className="form-group">
                <label className="form-label">Rating *</label>
                <div className="rating-container">
                  {renderStars()}
                </div>
              </div>

              {/* Review Content */}
              <div className="form-group">
                <label htmlFor="review" className="form-label">
                  Your Review *
                </label>
                <textarea
                  id="review"
                  name="review"
                  value={reviewForm.review}
                  onChange={handleInputChange}
                  placeholder="Share your detailed experience..."
                  className="form-textarea"
                  rows={6}
                  required
                  maxLength={1000}
                />
                <span className="char-count">
                  {reviewForm.review.length}/1000
                </span>
              </div>

              {/* Location (for website service reviews) */}
              {reviewForm.reviewType === 'website_service' && (
                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    Your Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={reviewForm.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="form-input"
                  />
                </div>
              )}

              {/* Property Selection (for property reviews when no specific property) */}
              {reviewForm.reviewType === 'property' && !propertyId && hasPurchasedProperties && (
                <div className="form-group">
                  <label htmlFor="propertySelect" className="form-label">
                    Select Property to Review *
                  </label>
                  <select
                    id="propertySelect"
                    name="propertyId"
                    value={reviewForm.propertyId || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Choose a property...</option>
                    {purchasedProperties.map((purchase) => (
                      <option key={purchase._id} value={purchase.property?._id || purchase.property}>
                        {purchase.property?.title || 'Property'} - ETB {purchase.amount?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="error-message">
                  <XCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner-small"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={20} />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

            {/* Review Guidelines */}
            <div className="mt-8 bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 rounded-xl p-6">
              <h4 className="text-xl font-black text-foreground mb-4">Review Guidelines</h4>
              <ul className="space-y-2 text-[#4B5563] dark:text-[#A8B5AE]">
                <li className="flex items-center gap-2">
                  <span className="text-ethiopian-green">•</span>
                  Be honest and constructive in your feedback
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-ethiopian-green">•</span>
                  Share specific details about your experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-ethiopian-green">•</span>
                  Avoid personal attacks or inappropriate language
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-ethiopian-green">•</span>
                  Your review will be reviewed before publication
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-ethiopian-green">•</span>
                  You can edit or delete your review before approval
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
