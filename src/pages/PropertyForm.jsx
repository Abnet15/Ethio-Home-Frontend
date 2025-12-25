import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { propertyService } from '../services/propertyService';
import { subscriptionService } from '../services/subscriptionService';
import { userService } from '../services/userService';
import '../styles/property-form.css';

const defaultForm = {
  title: '',
  location: '',
  type: 'house',
  status: 'for-sale',
  price: '',
  currency: 'ETB',
  priceDiscount: '',
  description: '',
  // Ownership (admin only)
  ownerId: '',
  // Features
  bedrooms: 0,
  bathrooms: 0,
  area: 0,
  parking: false,
  furnished: false,
  yearBuilt: '',
  // Contact information
  contactPhone: '',
  contactEmail: '',
  // Property details
  propertyCondition: 'good',
  availableFrom: '',
  rentPeriod: 'monthly',
  // Arrays
  amenities: [],
  restrictions: [],
  highlights: []
};

const PropertyForm = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isEdit = Boolean(id);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  // Available options
  const propertyTypes = ['house', 'apartment', 'villa', 'land', 'commercial'];
  const propertyStatuses = ['for-sale', 'for-rent'];
  const currencies = ['ETB', 'USD'];
  const conditions = ['excellent', 'good', 'fair', 'needs-renovation'];
  const rentPeriods = ['monthly', 'yearly', 'daily'];
  
 /*  const amenitiesOptions = [
    'air-conditioning', 'heating', 'balcony', 'garden', 'pool', 'gym',
    'security', 'elevator', 'internet', 'cable-tv', 'dishwasher',
    'washing-machine', 'dryer', 'microwave', 'refrigerator', 'oven'
  ]; */
  
  /* const restrictionsOptions = [
    'no-pets', 'no-smoking', 'no-parties', 'quiet-hours', 'no-subletting'
  ]; */

  // Handle back navigation
  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Fallback to role-specific dashboard
      const dashboardPath = user?.role === 'seller' ? '/seller-dashboard' :
                           user?.role === 'agent' ? '/agent-dashboard' :
                           user?.role === 'employee' ? '/employee-dashboard' :
                           user?.role === 'admin' ? '/admin-dashboard' : '/dashboard';
      navigate(dashboardPath);
    }
  };

  useEffect(() => {
    if (isEdit) {
      (async () => {
        const res = await propertyService.getProperty(id);
        if (res.success) {
          const p = res.data.data.data || res.data.data || {};
          setForm({
            title: p.title || '',
            location: p.location || '',
            type: p.type || 'house',
            status: p.status || 'for-sale',
            price: p.price || '',
            currency: p.currency || 'ETB',
            priceDiscount: p.priceDiscount || '',
            description: p.description || '',
            // Features
            bedrooms: p.features?.bedrooms || 0,
            bathrooms: p.features?.bathrooms || 0,
            area: p.features?.area || 0,
            parking: p.features?.parking || false,
            furnished: p.features?.furnished || false,
            yearBuilt: p.features?.yearBuilt || '',
            // Contact information
            contactPhone: p.contactPhone || '',
            contactEmail: p.contactEmail || '',
            // Property details
            propertyCondition: p.propertyCondition || 'good',
            availableFrom: p.availableFrom || '',
            rentPeriod: p.rentPeriod || 'monthly',
            // Arrays
            amenities: p.amenities || [],
            restrictions: p.restrictions || [],
            highlights: p.highlights || []
          });
        }
      })();
      // For edit mode, set checkingSubscription to false immediately
      setCheckingSubscription(false);
          } else {
        // Check if user is admin/employee - skip subscription check for them
        if (user?.role === 'admin' || user?.role === 'employee') {
          setCheckingSubscription(false);
          // Set a flag to indicate admin/employee access
          setSubscriptionInfo({ isAdminOrEmployee: true });
        } else {
          // Check subscription status for new properties only (sellers/agents)
          // Add a small delay to ensure any recent subscription updates are processed
          setTimeout(() => {
            checkSubscriptionStatus();
          }, 500);
        }
        
        // Clear any stored form data (start fresh)
        localStorage.removeItem('propertyFormData');
      }
  }, [isEdit, id]);

  // Load sellers/agents for admin and employee to assign an owner when creating
  useEffect(() => {
    const loadOwners = async () => {
      if (!user || (user.role !== 'admin' && user.role !== 'employee') || isEdit) return;
      try {
        // Fetch sellers and agents (first 200 to be safe)
        const [sellersRes, agentsRes] = await Promise.all([
          userService.getUsers({ role: 'seller', limit: 100 }),
          userService.getUsers({ role: 'agent', limit: 100 })
        ]);
        const sellers = sellersRes.success ? (sellersRes.data?.data?.data || []) : [];
        const agents = agentsRes.success ? (agentsRes.data?.data?.data || []) : [];
        const merged = [...sellers, ...agents].map(u => ({ id: u._id || u.id, name: u.name, role: u.role }));
        setOwnerOptions(merged);
      } catch (e) {
        // fail silently; admin/employee can still submit without owner but backend may reject
        setOwnerOptions([]);
      }
    };
    loadOwners();
  }, [user?.role, isEdit]);

  const checkSubscriptionStatus = async () => {
    if (!user || (user.role !== 'seller' && user.role !== 'agent')) {
      setCheckingSubscription(false);
      return;
    }

    try {
      const result = await subscriptionService.checkSubscriptionStatus();
      if (!result.success || !result.data.hasActiveSubscription) {
        // Redirect to subscription page if no active subscription
        navigate('/subscription', { 
          state: { 
            message: 'You need an active subscription to create new properties. Please choose a plan to continue.' 
          } 
        });
        return;
      }
      
      // Store subscription info for display
      setSubscriptionInfo(result.data);
      
      // Clear any property limit errors if user now has active subscription
      if (error && error.includes('PROPERTY_LIMIT_REACHED')) {
        setError('');
      }
      
      // Show success message if property count was reset
      if (result.data.remainingProperties > 0 && result.data.userPropertyCount === 0) {
        // Property count was reset, show success message
        console.log('Property count reset successfully. You can now create properties.');
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
      // If there's an error checking subscription, allow creation (fail-safe)
    } finally {
      setCheckingSubscription(false);
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setForm(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, value, action) => {
    setForm(prev => {
      const currentArray = prev[field] || [];
      let newArray;
      
      if (action === 'add') {
        newArray = [...currentArray, value];
      } else if (action === 'remove') {
        newArray = currentArray.filter(item => item !== value);
      } else if (action === 'toggle') {
        if (currentArray.includes(value)) {
          newArray = currentArray.filter(item => item !== value);
        } else {
          newArray = [...currentArray, value];
        }
      }
      
      return { ...prev, [field]: newArray };
    });
  };

  const handleHighlightChange = (index, value) => {
    setForm(prev => {
      const newHighlights = [...(prev.highlights || [])];
      newHighlights[index] = value;
      return { ...prev, highlights: newHighlights };
    });
  };

  const addHighlight = () => {
    setForm(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), '']
    }));
  };

  const removeHighlight = (index) => {
    setForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    if ((user?.role === 'admin' || user?.role === 'employee') && !isEdit && !form.ownerId) return 'Please select a Seller or Agent as the property owner.';
    if (!form.title || form.title.trim().length < 3) return 'Title must be at least 3 characters.';
    if (!form.location || form.location.trim().length < 3) return 'Location must be at least 3 characters.';
    if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) <= 0) return 'Price must be a positive number.';
    if (form.priceDiscount && Number(form.priceDiscount) >= Number(form.price)) return 'Discount price must be less than regular price.';
    if (form.bedrooms < 0 || form.bathrooms < 0 || form.area < 0) return 'Numeric values cannot be negative.';
    if (form.yearBuilt && (form.yearBuilt < 1800 || form.yearBuilt > new Date().getFullYear() + 1)) return 'Year built must be between 1800 and next year.';
    if (form.status === 'for-rent' && !form.availableFrom) return 'Available from date is required for rental properties.';
    return '';
  };

  const prepareFormData = () => {
    const formData = {
      title: form.title.trim(),
      location: form.location.trim(),
      type: form.type,
      status: form.status,
      price: Number(form.price),
      currency: form.currency,
      description: form.description.trim(),
      // Include ownerId if admin or employee selected one
      ...((user?.role === 'admin' || user?.role === 'employee') && !isEdit && form.ownerId ? { owner: form.ownerId } : {}),
      features: {
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        area: Number(form.area) || 0,
        parking: form.parking,
        furnished: form.furnished,
        yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined
      },
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      propertyCondition: form.propertyCondition,
      rentPeriod: form.rentPeriod,
      amenities: form.amenities,
      restrictions: form.restrictions,
      highlights: form.highlights.filter(h => h.trim() !== '')
    };

    // Add optional fields only if they have values
    if (form.priceDiscount) {
      formData.priceDiscount = Number(form.priceDiscount);
    }
    if (form.availableFrom) {
      formData.availableFrom = new Date(form.availableFrom);
    }

    return formData;
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const merged = [...selectedImages, ...files].slice(0, 6);
    setSelectedImages(merged);
    const previews = merged.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeSelectedImage = (index) => {
    const next = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(next);
    setImagePreviews(next.map((file) => URL.createObjectURL(file)));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Current form data:', form);
    console.log('User role:', user?.role);
    console.log('Is edit mode:', isEdit);
    console.log('Selected images:', selectedImages);
    
    const validationError = validate();
    console.log('Validation result:', validationError);
    
    if (validationError) {
      console.log('❌ Validation failed:', validationError);
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    console.log('✅ Validation passed, preparing form data...');
    setSubmitting(true);
    setError('');
    
    try {
      const formData = prepareFormData();
      console.log('📤 Prepared form data to send:', formData);
      console.log('🌐 API endpoint: POST /api/v1/properties');
      
      if (isEdit) {
        console.log("🔄 Updating property with ID:", id);
        const res = await propertyService.updateProperty(id, formData);
        if (!res.success) throw new Error(res.error || 'Failed to update property');
        if (selectedImages.length > 0) {
          try { await propertyService.uploadPropertyImages(id, selectedImages); } catch (_) {}
        }
        navigate(`/properties/${id}`);
      } else {
        console.log("🆕 Creating new property...");
        
        const res = await propertyService.createProperty(formData);
        console.log("📥 API response:", res);
        
        if (!res.success) throw new Error(res.error || 'Failed to create property');
        
        const created = res.data?.data?.data || res.data?.data || {};
        const createdId = created._id || created.id;
        console.log("🎉 Created property ID:", createdId);
        
        if (createdId) {
          if (selectedImages.length > 0) {
            try { await propertyService.uploadPropertyImages(createdId, selectedImages); } catch (_) {}
          }
          const role = user?.role;
          if (role === 'admin') {
            navigate('/admin-dashboard');
          } else if (role === 'employee') {
            navigate('/employee-dashboard');
          } else {
            navigate('/property/verification-pending', { state: { createdId } });
          }
        } else {
          const role = user?.role;
          if (role === 'admin') {
            navigate('/admin-dashboard');
          } else if (role === 'employee') {
            navigate('/employee-dashboard');
          } else if (role === 'agent') {
            navigate('/agent-dashboard');
          } else {
            navigate('/seller-dashboard');
          }
        }
      }
    } catch (err) {
      console.error('❌ Error in form submission:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error response:', err.response);
      
      // Only check for property limit errors when creating new properties, not when editing
      if (!isEdit && !(user?.role === 'admin' || user?.role === 'employee')) {
        const isPropertyLimitError = err.message && (
          err.message.includes('property limit') || 
          err.message.includes('subscription') ||
          err.message.includes('upgrade')
        );
        
        if (isPropertyLimitError) {
          // Store form data for later use
          const formDataToPreserve = {
            title: form.title,
            description: form.description,
            price: form.price,
            location: form.location,
            type: form.type,
            bedrooms: form.bedrooms,
            bathrooms: form.bathrooms,
            area: form.area,
            selectedImages: selectedImages,
            amenities: form.amenities,
            restrictions: form.restrictions,
            contactInfo: {
              contactPhone: form.contactPhone,
              contactEmail: form.contactEmail
            }
          };
          
          // Store in localStorage as backup
          localStorage.setItem('propertyFormData', JSON.stringify(formDataToPreserve));
          
          // Set special error message with upgrade button
          setError('PROPERTY_LIMIT_REACHED: You\'ve reached your property limit. Please upgrade your subscription to continue creating properties.');
          
          // Auto-redirect after 5 seconds
          setTimeout(() => {
            navigate('/subscription', { 
              state: { 
                message: 'You\'ve reached your property limit. Please choose a plan to continue creating properties.',
                returnToPropertyForm: true,
                formData: formDataToPreserve
              } 
            });
          }, 5000);
          
          return;
        }
      }
      
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
      console.log('=== FORM SUBMISSION COMPLETED ===');
    }
  };

  // Show loading while checking subscription (only for sellers/agents)
  if (checkingSubscription && !isEdit && !(user?.role === 'admin' || user?.role === 'employee')) {
    return (
      <div className="property-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Checking Subscription...</div>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            Please wait while we verify your subscription status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
            <h1 className="text-3xl font-black mb-2">{isEdit ? t('Edit Property') : t('Create Property')}</h1>
            <p className="text-white/90">{isEdit ? t('Update your property details') : t('Add a new property to your listings')}</p>
          
          {/* Subscription Info Display */}
          {!isEdit && subscriptionInfo && (
            <div className="subscription-info">
              {subscriptionInfo.isAdminOrEmployee ? (
                // Admin/Employee display
                <div className="subscription-info admin-employee">
                  <div className="subscription-stats">
                    <span className="stat-item">
                      <strong>Role:</strong> {user?.role === 'admin' ? 'Administrator' : 'Employee'}
                    </span>
                    <span className="stat-item">
                      <strong>Access:</strong> No subscription limits apply
                    </span>
                    <span className="stat-item">
                      <strong>Permissions:</strong> Full property management access
                    </span>
                  </div>
                  <div className="subscription-success">
                    ✅ You can create unlimited properties and manage all listings.
                  </div>
                </div>
              ) : (
                // Regular seller/agent subscription display
                <>
                  <div className="subscription-stats">
                    <span className="stat-item">
                      <strong>Current Properties:</strong> {subscriptionInfo.userPropertyCount}
                    </span>
                    <span className="stat-item">
                      <strong>Plan Limit:</strong> {subscriptionInfo.data.maxProperties}
                    </span>
                    <span className="stat-item">
                      <strong>Remaining:</strong> {subscriptionInfo.remainingProperties}
                    </span>
                  </div>
                  
                  {subscriptionInfo.remainingProperties === 0 && (
                    <div className="subscription-warning">
                      ⚠️ You have reached your property limit. Please upgrade your subscription to create more properties.
                      <div className="upgrade-action" style={{ marginTop: '1rem' }}>
                        <button 
                          className="btn btn-primary upgrade-btn"
                          onClick={() => navigate('/subscription', { 
                            state: { 
                              message: 'You\'ve reached your property limit. Please choose a plan to continue creating properties.',
                              returnToPropertyForm: true
                            } 
                          })}
                        >
                          Upgrade Subscription
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {subscriptionInfo.remainingProperties > 0 && (
                    <div className="subscription-success">
                      ✅ You can create {subscriptionInfo.remainingProperties} more properties with your current plan.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          

          

        </div>
        <button onClick={handleBack} className="back-button">
          ← {t('Back')}
        </button>
        </div>

            {error && !isEdit && !subscriptionInfo?.hasActiveSubscription && !subscriptionInfo?.isAdminOrEmployee && (
        <div className="error-container">
          <div className="error-message">
            {error.includes('PROPERTY_LIMIT_REACHED') ? 'You\'ve reached your property limit. Please upgrade your subscription to continue creating properties.' : error}
            {error.includes('PROPERTY_LIMIT_REACHED') && (
              <div className="upgrade-action">
                <button 
                  className="btn btn-primary upgrade-btn"
                  onClick={() => {
                    const formDataToPreserve = {
                      title: form.title,
                      description: form.description,
                      price: form.price,
                      location: form.location,
                      type: form.type,
                      bedrooms: form.bedrooms,
                      bathrooms: form.bathrooms,
                      area: form.area,
                      selectedImages: selectedImages,
                      amenities: form.amenities,
                      restrictions: form.restrictions,
                      contactInfo: {
                        contactPhone: form.contactPhone,
                        contactEmail: form.contactEmail
                      }
                    };
                    
                    localStorage.setItem('propertyFormData', JSON.stringify(formDataToPreserve));
                    
                    navigate('/subscription', { 
                      state: { 
                        message: 'You\'ve reached your property limit. Please choose a plan to continue creating properties.',
                        returnToPropertyForm: true,
                        formData: formDataToPreserve
                      } 
                    });
                  }}
                >
                  Upgrade Subscription
                </button>
                <span className="auto-redirect-note">
                  (Auto-redirecting in 5 seconds...)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Show general errors for edit mode */}
      {error && isEdit && (
        <div className="error-container">
          <div className="error-message">
            {error}
          </div>
        </div>
      )}
      

          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-8">
          <div>
              {/* Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-fields-grid">
                  {(user?.role === 'admin' || user?.role === 'employee') && !isEdit && (
                    <div className="form-field">
                      <label className="required">Owner (Seller/Agent)</label>
                      {user?.role === 'employee' && (
                        <div className="info-note" style={{ 
                          background: '#f0f9ff', 
                          border: '1px solid #0ea5e9', 
                          borderRadius: '6px', 
                          padding: '8px 12px', 
                          marginBottom: '8px',
                          fontSize: '14px',
                          color: '#0369a1'
                        }}>
                          <strong>Note:</strong> As an employee, you must select the seller or agent who owns this property. This ensures proper attribution and management.
                        </div>
                      )}
                      <select
                        name="ownerId"
                        value={form.ownerId}
                        onChange={onChange}
                        required
                      >
                        <option value="">Select owner...</option>
                        {ownerOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name} ({opt.role})
                          </option>
                        ))}
                      </select>
                      <small>Select the seller or agent who owns this property.</small>
                    </div>
                  )}
                  <div className="form-field">
                    <label className="required">Title</label>
                    <input 
                      name="title" 
                      value={form.title} 
                      onChange={onChange} 
                      required 
                      placeholder="e.g., Modern 3BR House" 
                      maxLength={100}
                    />
                    <small>Clear, descriptive title (max 100 characters).</small>
          </div>
                  <div className="form-field">
                    <label className="required">Location</label>
                    <input 
                      name="location" 
                      value={form.location} 
                      onChange={onChange} 
                      required 
                      placeholder="e.g., Addis Ababa, Bole" 
                    />
          </div>
                  <div className="form-field">
                    <label className="required">Type</label>
            <select name="type" value={form.type} onChange={onChange}>
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="required">Status</label>
                    <select name="status" value={form.status} onChange={onChange}>
                      {propertyStatuses.map(status => (
                        <option key={status} value={status}>
                          {status === 'for-sale' ? 'For Sale' : 'For Rent'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="required">Price</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        name="price" 
                        value={form.price} 
                        onChange={onChange} 
                        min="0" 
                        required 
                        placeholder="e.g., 1500000" 
                        style={{ flex: 1 }}
                      />
                      <select name="currency" value={form.currency} onChange={onChange} style={{ width: '80px' }}>
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
            </select>
          </div>
                  </div>
                  <div className="form-field">
                    <label>Discount Price</label>
                    <input 
                      type="number" 
                      name="priceDiscount" 
                      value={form.priceDiscount} 
                      onChange={onChange} 
                      min="0" 
                      placeholder="Optional discount price" 
                    />
                    <small>Must be less than regular price.</small>
                  </div>
                </div>
          </div>

              {/* Property Details */}
              <div className="form-section">
                <h3>Property Details</h3>
                <div className="form-fields-grid three-columns">
                  <div className="form-field">
            <label>Bedrooms</label>
                    <input 
                      type="number" 
                      name="bedrooms" 
                      value={form.bedrooms} 
                      onChange={onChange} 
                      min="0" 
                    />
          </div>
                  <div className="form-field">
            <label>Bathrooms</label>
                    <input 
                      type="number" 
                      name="bathrooms" 
                      value={form.bathrooms} 
                      onChange={onChange} 
                      min="0" 
                    />
          </div>
                  <div className="form-field">
            <label>Area (m²)</label>
                    <input 
                      type="number" 
                      name="area" 
                      value={form.area} 
                      onChange={onChange} 
                      min="0" 
                    />
                  </div>
                </div>

                <div className="form-fields-grid">
                  <div className="form-field">
                    <label>Year Built</label>
                    <input 
                      type="number" 
                      name="yearBuilt" 
                      value={form.yearBuilt} 
                      onChange={onChange} 
                      min="1800" 
                      max={new Date().getFullYear() + 1}
                      placeholder="e.g., 2020" 
                    />
                  </div>
                  <div className="form-field">
                    <label>Property Condition</label>
                    <select name="propertyCondition" value={form.propertyCondition} onChange={onChange}>
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>
                          {condition.charAt(0).toUpperCase() + condition.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.status === 'for-rent' && (
                  <div className="form-fields-grid">
                    <div className="form-field">
                      <label className="required">Available From</label>
                      <input 
                        type="date" 
                        name="availableFrom" 
                        value={form.availableFrom} 
                        onChange={onChange} 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Rent Period</label>
                      <select name="rentPeriod" value={form.rentPeriod} onChange={onChange}>
                        {rentPeriods.map(period => (
                          <option key={period} value={period}>
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-fields-grid">
                  <div className="form-field">
                    <label>
                      <input 
                        type="checkbox" 
                        name="parking" 
                        checked={form.parking} 
                        onChange={onChange} 
                      />
                      Parking Available
                    </label>
                  </div>
                  <div className="form-field">
                    <label>
                      <input 
                        type="checkbox" 
                        name="furnished" 
                        checked={form.furnished} 
                        onChange={onChange} 
                      />
                      Furnished
                    </label>
                  </div>
                </div>
              </div>

              {/* Contact Information */}{/* 
              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-fields-grid">
                  <div className="form-field">
                    <label>Contact Phone</label>
                    <input 
                      name="contactPhone" 
                      value={form.contactPhone} 
                      onChange={onChange} 
                      placeholder="e.g., +251912345678" 
                    />
                  </div>
                  <div className="form-field">
                    <label>Contact Email</label>
                    <input 
                      type="email" 
                      name="contactEmail" 
                      value={form.contactEmail} 
                      onChange={onChange} 
                      placeholder="e.g., contact@example.com" 
                    />
                  </div>
                </div>
              </div>
 */}
              {/* Amenities */}
              {/* <div className="form-section">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {amenitiesOptions.map(amenity => (
                    <label key={amenity} className="checkbox-item">
                      <input 
                        type="checkbox" 
                        checked={form.amenities.includes(amenity)} 
                        onChange={() => handleArrayChange('amenities', amenity, 'toggle')} 
                      />
                      {amenity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div> */}

              {/* Restrictions */}{/* 
              <div className="form-section">
                <h3>Restrictions</h3>
                <div className="amenities-grid">
                  {restrictionsOptions.map(restriction => (
                    <label key={restriction} className="checkbox-item">
                      <input 
                        type="checkbox" 
                        checked={form.restrictions.includes(restriction)} 
                        onChange={() => handleArrayChange('restrictions', restriction, 'toggle')} 
                      />
                      {restriction.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
 */}
              {/* Highlights */}{/* 
              <div className="form-section">
                <h3>Highlights</h3>
                <div className="highlights-container">
                  {form.highlights.map((highlight, index) => (
                    <div key={index} className="highlight-item">
                      <input 
                        type="text" 
                        value={highlight} 
                        onChange={(e) => handleHighlightChange(index, e.target.value)} 
                        placeholder="e.g., Near shopping center" 
                        maxLength={50}
                      />
                      <button 
                        type="button" 
                        onClick={() => removeHighlight(index)}
                        className="remove-highlight"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={addHighlight}
                    className="add-highlight"
                  >
                    + Add Highlight
                  </button>
                </div>
              </div> */}

              {/* Description */}
              <div className="form-section">
                <h3>Description</h3>
                <div className="form-fields-grid full-width">
                  <div className="form-field">
                    <label className="required">Description</label>
                    <textarea 
                      name="description" 
                      value={form.description} 
                      onChange={onChange} 
                      rows={6} 
                      required
                      placeholder="Describe features, nearby amenities, etc." 
                      maxLength={2000}
                    />
                    <small>Detailed description (max 2000 characters).</small>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="form-section">
                <h3>Images</h3>
                <div className="form-fields-grid full-width">
                  <div className="form-field">
                    <label className="required">Upload Images (1-6)</label>
                    <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
                    <small>Choose up to 6 images. First becomes the cover.</small>
                  </div>
                </div>
                {imagePreviews.length > 0 && (
                  <div className="images-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="image-preview-item" style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
                        <img src={src} alt={`preview-${idx}`} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeSelectedImage(idx)} className="btn btn-cancel" style={{ position: 'absolute', top: '6px', right: '6px', padding: '0.25rem 0.5rem' }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="publishing-sidebar">
              <h3>Publishing</h3>
              <div className="publishing-guidelines">
                <ul className="guidelines-list">
                  <li>Double-check price and location.</li>
                  <li>Use a clear, descriptive title.</li>
                  <li>Add high-quality images after creating.</li>
                  <li>Provide detailed descriptions for better visibility.</li>
                  <li>Include contact information for inquiries.</li>
                  <li>Select relevant amenities and restrictions.</li>
                </ul>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-create" 
                  disabled={submitting || (!isEdit && !subscriptionInfo?.isAdminOrEmployee && (!subscriptionInfo || subscriptionInfo.remainingProperties === 0))}
                >
                  {submitting ? (
                    <>
                      <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                      {t('Saving...')}
                    </>
                  ) : !isEdit && !subscriptionInfo ? (
                    <>
                      Checking Subscription...
                    </>
                  ) : !isEdit && subscriptionInfo && !subscriptionInfo.isAdminOrEmployee && subscriptionInfo.remainingProperties === 0 ? (
                    <>
                      ⚠️ Property Limit Reached
                    </>
                  ) : (
                    isEdit ? t('Update Property') : t('Create Property')
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={handleBack} 
                  className="btn btn-cancel"
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
            </form>
          </div>
        </div>
      </div>
    
  );
};

export default PropertyForm;


