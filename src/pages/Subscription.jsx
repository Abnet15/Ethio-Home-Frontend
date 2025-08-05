import { 
  Check, 
  X, 
  Star, 
  Crown, 
  Zap, 
  Shield, 
  Users, 
  Building, 
  BarChart3, 
  Headphones,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Globe,
  Lock,
  Smartphone,
  Mail,
  Phone,
  MessageCircle,
  Award,
  TrendingUp,
  Eye,
  Heart,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Video,
  FileText,
  Database,
  Cloud,
  Wifi,
  Bookmark,
  CreditCard,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/subscriptionService';


import '../styles/subscription.css';

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Default fallback plans (used only if backend returns none)
  const defaultPlans = [
   /*  { _id: 'fallback-weekly', name: 'Weekly', interval: 'weekly', amount: 500, frequency: 1, currency: 'ETB', description: 'Great to try things out', features: ['List up to 5 properties', 'Basic analytics'] , isActive: true },
    { _id: 'fallback-monthly', name: 'Monthly', interval: 'monthly', amount: 1500, frequency: 1, currency: 'ETB', description: 'Best to get started', features: ['List up to 15 properties', 'Priority listing', 'Email support'] , isActive: true },
    { _id: 'fallback-quarterly', name: '3-Monthly', interval: '3-monthly', amount: 4000, frequency: 1, currency: 'ETB', description: 'Popular among active agents', features: ['List up to 25 properties', 'Advanced analytics', 'Featured placement'] , isActive: true },
    { _id: 'fallback-semiannual', name: '6-Monthly', interval: '6-monthly', amount: 7000, frequency: 1, currency: 'ETB', description: 'For growing agencies', features: ['List up to 40 properties', 'Lead insights', 'Priority support'] , isActive: true },
    { _id: 'fallback-annual', name: 'Annual', interval: 'annually', amount: 12000, frequency: 1, currency: 'ETB', description: 'Best value for pros', features: ['Unlimited properties', 'Full analytics', 'API access'] , isActive: true } */
  ];

  // Get message from navigation state (if redirected from PropertyForm)
  const redirectMessage = location.state?.message;

  useEffect(() => {
    fetchPredefinedPlans();
  }, []);

  const fetchPredefinedPlans = async () => {
    try {
      setLoading(true);
      const result = await subscriptionService.getPredefinedPlans();
      console.log("here is now🙄🙄😶🙄",result)
      
      if (result.success) {
        const fetched = Array.isArray(result.data?.data) ? result.data.data : [];
        const usable = fetched.length > 0 ? fetched : defaultPlans;
        setPlans(usable);
        setSelectedPlan(usable[1] || usable[0] || null);
      } else {
        setPlans(defaultPlans);
        setSelectedPlan(defaultPlans[1]);
        setError('Failed to load subscription plans. Showing defaults.');
      }
    } catch (err) {
      setPlans(defaultPlans);
      setSelectedPlan(defaultPlans[1]);
      setError('Failed to load subscription plans. Showing defaults.');
    } finally {
      setLoading(false);
    }
  };

  const testimonials = [
  /*   {
      name: 'Almaz Tadesse',
      role: 'Property Developer',
      content: 'Ethio-Home has transformed how we showcase our properties. The professional tools are exactly what we needed.',
      rating: 5
    },
    {
      name: 'Dawit Bekele',
      role: 'Real Estate Agent',
      content: 'The analytics and lead management features have helped me close 40% more deals this year.',
      rating: 5
    },
    {
      name: 'Hanan Mohammed',
      role: 'Property Investor',
      content: 'Finding the right properties has never been easier. The search filters are incredibly detailed.',
      rating: 5
    } */
  ];

  const faqs = [
   /*  {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'We offer a 14-day free trial for all paid plans. No credit card required.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, bank transfers, and mobile money payments.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
    } */
  ];

  const initiateSubscription = async (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'seller' && user.role !== 'agent') {
      setError('Only sellers and agents can subscribe to plans');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const subscriptionData = {
        interval: plan.interval,
        amount: plan.amount,
        frequency: plan.frequency,
        planId: plan._id, // Include plan ID to get maxProperties
        maxProperties: plan.maxProperties // Include maxProperties directly
      };

      const result = await subscriptionService.createPlan(subscriptionData);
      
      if (result.success && result.data.data.checkout_url) {
        window.location.href = result.data.data.checkout_url;
      } else {
        throw new Error(result.error || 'Failed to create subscription plan');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanIcon = (interval) => {
    switch (interval) {
      case 'weekly':
        return <Clock size={24} />;
      case 'monthly':
        return <Calendar size={24} />;
      case '3-monthly':
        return <TrendingUp size={24} />;
      case '6-monthly':
        return <BarChart3 size={24} />;
      case 'annually':
        return <Crown size={24} />;
      default:
        return <Building size={24} />;
    }
  };

  const getPlanColor = (index) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="subscription-hero">
          <div className="hero-content">
            <div className="loading-content">
              <RefreshCw size={64} className="loading-icon" />
              <h2>Loading Subscription Plans...</h2>
              <p>Please wait while we fetch the available plans.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      {/* Hero Section */}
      <div className="subscription-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Choose Your Perfect Plan</span>
          </div>
          <h1>Unlock the Full Potential of Ethio-Home</h1>
          <p>
            Whether you're buying, selling, or managing properties, we have the perfect plan 
            to help you succeed in Ethiopia's real estate market.
          </p>
          {location.state?.message && (
            <div className="redirect-message">
              <AlertCircle size={20} />
              <span>{location.state.message}</span>
              {location.state?.returnToPropertyForm && (
                <div className="return-to-property-form">
                  <button 
                    className="return-property-btn"
                    onClick={async () => {
                      try {
                        // Check subscription status before returning
                        const result = await subscriptionService.checkSubscriptionStatus();
                        if (result.success && result.data.hasActiveSubscription) {
                          // Property count is automatically reset by the backend
                          // Clear any stored form data
                          localStorage.removeItem('propertyFormData');
                          // Navigate to property creation page
                          navigate('/properties/new');
                        } else {
                          // No active subscription, show error
                          setError('You need an active subscription to create properties. Please complete your subscription first.');
                        }
                      } catch (err) {
                        setError('Failed to check subscription status. Please try again.');
                      }
                    }}
                  >
                    Continue Creating Property
                  </button>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="error-message">
              <X size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing + Cart Layout */}
      <div className="subscription-layout">
        {/* Pricing Plans */}
        <div className="pricing-section">
          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div key={plan._id} className={`pricing-card ${getPlanColor(index)} ${index === 2 ? 'popular' : ''} ${selectedPlan?._id === plan._id ? 'selected' : ''}`}>
                {index === 2 && (
                  <div className="popular-badge">
                    <Star size={14} />
                    Most Popular
                  </div>
                )}
                <div className="plan-header">
                  <div className="plan-icon">{getPlanIcon(plan.interval)}</div>
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                </div>
                <div className="plan-price">
                  <span className="currency">{plan.currency}</span>
                  <span className="amount">{plan.amount.toLocaleString()}</span>
                  <span className="period">/{plan.interval}</span>
                </div>
                <div className="plan-features">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="feature-item">
                      <Check size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button 
                  className="plan-button"
                  onClick={() => navigate('/subscription/create-plan', { state: { plan } })}
                  disabled={isProcessing}
                >
                  Choose Plan
                  {!isProcessing && <ArrowRight size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <aside className="subscription-cart">
          <div className="cart-card">
            <div className="cart-header">
              <h3>Your Plan</h3>
            </div>
            {selectedPlan ? (
              <div className="cart-body">
                <div className="cart-plan">
                  <div className="cart-plan-title">
                    {getPlanIcon(selectedPlan.interval)}
                    <span>{selectedPlan.name}</span>
                  </div>
                  <div className="cart-price">
                    <span className="currency">{selectedPlan.currency}</span>
                    <span className="amount">{selectedPlan.amount.toLocaleString()}</span>
                    <span className="period">/{selectedPlan.interval}</span>
                  </div>
                </div>
                <ul className="cart-features">
                  {selectedPlan.features.slice(0, 5).map((f, i) => (
                    <li key={i}><Check size={14} /> {f}</li>
                  ))}
                </ul>
                <div className="cart-actions">
                  <button 
                    className="subscribe-btn"
                    onClick={() => navigate('/subscription/create-plan', { state: { plan: selectedPlan } })}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Redirecting…' : 'Subscribe Now'}
                  </button>
                  <button 
                    className="change-btn"
                    onClick={() => window.scrollTo({ top: document.querySelector('.pricing-grid')?.offsetTop || 0, behavior: 'smooth' })}
                  >
                    Change Plan
                  </button>
                </div>
                <p className="cart-note">Secure checkout via Chapa. Card details are entered on Chapa only.</p>
              </div>
            ) : (
              <div className="cart-empty">
                <p>Select a plan from the left to continue.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Features Comparison */}
      <div className="features-section">
        <div className="section-header">
          <h2>Compare All Features</h2>
          <p>See what's included in each plan</p>
        </div>
        <div className="features-table">
          <div className="table-header">
            <div className="feature-name">Features</div>
            {plans.map((plan) => (
              <div key={plan._id} className="plan-column">{plan.name}</div>
            ))}
          </div>
          <div className="table-row">
            <div className="feature-name">Property Listings</div>
            {plans.map((plan, index) => (
              <div key={plan._id} className="plan-column">
                {index === 0 ? 'Up to 5' : 
                 index === 1 ? 'Up to 15' : 
                 index === 2 ? 'Up to 25' : 
                 index === 3 ? 'Up to 40' : 'Unlimited'}
              </div>
            ))}
          </div>
          <div className="table-row">
            <div className="feature-name">Analytics Dashboard</div>
            {plans.map((plan, index) => (
              <div key={plan._id} className="plan-column">
                {index === 0 ? <X size={16} /> : <Check size={16} />}
              </div>
            ))}
          </div>
          <div className="table-row">
            <div className="feature-name">Priority Support</div>
            {plans.map((plan, index) => (
              <div key={plan._id} className="plan-column">
                {index === 0 ? <X size={16} /> : <Check size={16} />}
              </div>
            ))}
          </div>
          <div className="table-row">
            <div className="feature-name">API Access</div>
            {plans.map((plan, index) => (
              <div key={plan._id} className="plan-column">
                {index === 4 ? <Check size={16} /> : <X size={16} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="testimonials-section">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Join thousands of satisfied users</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p>"{testimonial.content}"</p>
              <div className="testimonial-author">
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about our plans</p>
        </div>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of property professionals who trust Ethio-Home</p>
          <div className="cta-buttons">
            <button 
              className="cta-primary" 
              onClick={() => plans.length > 0 && setSelectedPlan(plans[1])}
              disabled={isProcessing || plans.length === 0}
            >
              {isProcessing ? 'Processing...' : 'Start Free Trial'}
              {!isProcessing && <ArrowRight size={16} />}
            </button>
            <button className="cta-secondary" onClick={() => navigate('/contact')}>
              Contact Sales
              <MessageCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

