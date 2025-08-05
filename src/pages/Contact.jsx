import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Building,
  Users,
  HeadphonesIcon,
  Globe,
  ArrowRight,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import { contactService } from "../services/contactService";

const Contact = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  

  // Fetch departments and FAQs on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Fetch departments
        const deptResult = await contactService.getContactDepartments();
        if (deptResult.success) {
          setDepartments(
            deptResult.data?.data?.departments ||
            deptResult.data?.departments ||
            []
          );
        }

        // Fetch FAQs
        const faqResult = await contactService.getContactFAQs();
        if (faqResult.success) {
          setFaqs(faqResult.data?.data?.faqs || faqResult.data?.faqs || []);
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Pre-populate form with user data when logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Add character limit for message field
    if (name === "message" && value.length > 1000) {
      return; // Don't update if exceeding limit
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.error("User must be logged in to submit contact form");
      return;
    }

    setLoading(true);

    try {
      // Add sender field (user ID) to form data
      const contactData = {
        ...formData,
        sender: user._id
      };

      const result = await contactService.submitContact(contactData);
      if (result.success) {
        setSuccess(true);
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          subject: "",
          message: "",
          inquiryType: "general",
        });

        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        console.error("Failed to submit contact form:", result.error);
        // You could add error state handling here
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      // You could add error state handling here
    } finally {
      setLoading(false);
    }
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "Building":
        return Building;
      case "Users":
        return Users;
      case "HeadphonesIcon":
        return HeadphonesIcon;
      case "CreditCard":
        return CreditCard;
      default:
        return Building;
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: [
        "Bahir Dar, Ethiopia",
        "Near City Center",
        "Main Business District",
      ],
    },
    {
      icon: Phone,
      title: "Call Us",
      details: [
        "+251 924 862894",
        "+251 9 3635 82 53",
        "Mon-Fri: 8:00 AM - 6:00 PM",
      ],
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [
        "info@ethio-home.com",
        "abnetsisay@gmail.com",
        "weldeamlak12@gmail.com",
      ],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 8:00 AM - 6:00 PM",
        "Saturday: 9:00 AM - 4:00 PM",
        "Sunday: Closed",
      ],
    },
  ];if (loadingData) {
    return (
      <div className="contact-page">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="spinner"></div>
            <p>Loading contact information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="hero bg-gradient-primary text-white">
        <div className="container">
          <div className="hero-content text-center fade-in">
            <h1 className="hero-title">Get in Touch</h1>
            <p className="hero-subtitle">
              We're here to help you find your dream property. Contact us
              anytime and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="contact-form-container slide-up">
              <div className="enhanced-form-card">
                <div className="form-header">
                  <div className="form-header-icon">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <div className="form-header-content">
                    <h2 className="form-title">Send us a Message</h2>
                    <p className="form-subtitle">
                      Fill out the form below and we'll get back to you within
                      24 hours.
                    </p>
                  </div>
                </div>

                <div className="form-body">
                  {!isAuthenticated && (
                    <div className="login-required-message">
                      <div className="login-required-icon">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="login-required-content">
                        <h3>Login Required</h3>
                        <p>
                          Please log in to submit a contact form. This helps us provide better support and track your inquiries.
                        </p>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="success-message">
                      <div className="success-icon">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="success-content">
                        <h3>Message Sent Successfully!</h3>
                        <p>
                          Thank you for your message! We'll get back to you
                          soon.
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="enhanced-contact-form"
                  >
                    <div className="form-row">
                      <div className="form-field-group">
                        <label htmlFor="name" className="enhanced-label">
                          <span className="label-text">Full Name</span>
                          <span className="required-indicator">*</span>
                        </label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="enhanced-input"
                            placeholder="Enter your full name"
                            required
                          />
                          <div className="input-focus-border"></div>
                        </div>
                      </div><div className="form-field-group">
                        <label htmlFor="email" className="enhanced-label">
                          <span className="label-text">Email Address</span>
                          <span className="required-indicator">*</span>
                        </label>
                        <div className="input-wrapper">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="enhanced-input"
                            placeholder="Enter your email address"
                            required
                          />
                          <div className="input-focus-border"></div>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field-group">
                        <label htmlFor="phone" className="enhanced-label">
                          <span className="label-text">Phone Number</span>
                        </label>
                        <div className="input-wrapper">
                          <Phone className="input-icon" />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="enhanced-input with-icon"
                            placeholder="+251 911 123 456"
                          />
                          <div className="input-focus-border"></div>
                        </div>
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="inquiryType" className="enhanced-label">
                          <span className="label-text">Inquiry Type</span>
                        </label>
                        <div className="input-wrapper">
                          <select
                            id="inquiryType"
                            name="inquiryType"
                            value={formData.inquiryType}
                            onChange={handleInputChange}
                            className="enhanced-select"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="property">Property Related</option>
                            <option value="technical">Technical Support</option>
                            <option value="billing">Billing Question</option>
                          </select>
                          <div className="select-arrow"></div>
                        </div>
                      </div>
                    </div>

                    <div className="form-field-group full-width">
                      <label htmlFor="subject" className="enhanced-label">
                        <span className="label-text">Subject</span>
                        <span className="required-indicator">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="enhanced-input"
                          placeholder="What is this about?"
                          required
                        />
                        <div className="input-focus-border"></div>
                      </div>
                    </div><div className="form-field-group full-width">
                      <label htmlFor="message" className="enhanced-label">
                        <span className="label-text">Message</span>
                        <span className="required-indicator">*</span>
                      </label>
                      <div className="textarea-wrapper">
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          className="enhanced-textarea"
                          placeholder="Tell us more about your inquiry..."
                          rows="6"
                          required
                        ></textarea>
                        <div className="textarea-focus-border"></div>
                      </div>
                      <div className="character-counter">
                        <span
                          className={`current-count ${
                            formData.message.length > 800 ? "warning" : ""
                          } ${formData.message.length > 950 ? "danger" : ""}`}
                        >
                          {formData.message.length}
                        </span>
                        <span className="max-count">/ 1000</span>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="enhanced-submit-btn"
                        disabled={loading || !isAuthenticated}
                      >
                        {loading ? (
                          <>
                            <div className="loading-spinner"></div>
                            <span>Sending Message...</span>
                          </>
                        ) : !isAuthenticated ? (
                          <>
                            <Users className="w-5 h-5" />
                            <span>Login Required</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>

                      <div className="form-note">
                        <p>
                          Fields marked with{" "}
                          <span className="required-indicator">*</span> are
                          required
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>{/* Contact Information */}
            <div
              className="contact-info-container slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="contact-info-card card">
                    <div className="contact-info-icon">
                      <info.icon />
                    </div>
                    <div className="contact-info-content">
                      <h3 className="contact-info-title">{info.title}</h3>
                      <div className="contact-info-details">
                        {info.details.map((detail, detailIndex) => {
                          // Make phone numbers clickable
                          if (
                            info.title === "Call Us" &&
                            detail.includes("+251")
                          ) {
                            return (
                              <p
                                key={detailIndex}
                                className="contact-info-detail"
                              >
                                <a
                                  href={`tel:${detail.replace(/\s/g, "")}`}
                                  className="contact-link"
                                  title={`Call ${detail}`}
                                >
                                  {detail}
                                </a>
                              </p>
                            );
                          }
                          // Make email addresses clickable
                          if (
                            info.title === "Email Us" &&
                            detail.includes("@")
                          ) {
                            return (
                              <p
                                key={detailIndex}
                                className="contact-info-detail"
                              >
                                <a
                                  href={`mailto:${detail}`}
                                  className="contact-link"
                                  title={`Email ${detail}`}
                                >
                                  {detail}
                                </a>
                              </p>
                            );
                          }
                          // Regular text
                          return (
                            <p
                              key={detailIndex}
                              className="contact-info-detail"
                            >
                              {detail}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="section bg-secondary-50">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Contact Our Departments</h2>
            <p className="section-subtitle">
              Get in touch with the right team for your specific needs
            </p>
          </div><div className="grid grid-cols-3 gap-8">
            {departments.map((dept, index) => {
              const IconComponent = getIconComponent(dept.icon);
              return (
                <div
                  key={dept.id}
                  className="department-card card slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="department-icon">
                    <IconComponent />
                  </div>
                  <h3 className="department-title">{dept.title}</h3>
                  <p className="department-description">{dept.description}</p>
                  <div className="department-contact">
                    <div className="contact-item">
                      <Mail className="w-4 h-4" />
                      <span>{dept.email}</span>
                    </div>
                    <div className="contact-item">
                      <Phone className="w-4 h-4" />
                      <span>{dept.phone}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Find answers to common questions about our services
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="faq-card card slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section bg-secondary-50">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Visit Our Office</h2>
            <p className="section-subtitle">
              Come see us in person at our headquarters in Bahir Dar
            </p>
          </div>

          <div className="map-container card">
            <div className="map-placeholder">
              <MapPin className="w-16 h-16 text-primary-500 mb-4" />
              <h3 className="text-xl font-bold text-secondary-800 mb-2">
                Interactive Map
              </h3>
              <p className="text-secondary-600 mb-4">Bahir Dar, Ethiopia</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  // Open Google Maps with Bahir Dar location
                  const address = encodeURIComponent("Bahir Dar, Ethiopia");
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
                  window.open(mapsUrl, "_blank");
                }}
              >
                Open in Maps
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        /* Enhanced Form Styles */
        .enhanced-form-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .form-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          color: white;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .form-header-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .form-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          opacity: 0.9;
          font-size: 1rem;
        }

        .form-body {
          padding: 2rem;
        }

        .login-required-message {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
        }

        .login-required-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-required-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .login-required-content p {
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .success-message {
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
        }

        .success-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .success-content p {
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .enhanced-contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-field-group.full-width {
          grid-column: 1 / -1;
        }

        .enhanced-label {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }

        .required-indicator {
          color: #ef4444;
          font-weight: 700;
        }

        .input-wrapper {
          position: relative;
        }

        .enhanced-input,
        .enhanced-select {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          background: #f9fafb;
          transition: all 0.3s ease;
          color: #374151;
        }

        .enhanced-input.with-icon {
          padding-left: 3rem;
        }

        .enhanced-input:focus,
        .enhanced-select:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          width: 1.25rem;
          height: 1.25rem;
        }

        .select-arrow {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #9ca3af;
          pointer-events: none;
        }

        .textarea-wrapper {
          position: relative;
        }

        .enhanced-textarea {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          background: #f9fafb;
          transition: all 0.3s ease;
          color: #374151;
          resize: vertical;
          min-height: 120px;
          font-family: inherit;
        }

        .enhanced-textarea:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        
        .character-counter {
          display: flex;
          justify-content: flex-end;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .current-count {
          color: #667eea;
          font-weight: 600;
        }

        .current-count.warning {
          color: #f59e0b;
        }

        .current-count.danger {
          color: #ef4444;
        }

        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .enhanced-submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        .enhanced-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        }

        .enhanced-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .form-note {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .form-note .required-indicator {
          color: #ef4444;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .form-title {
            font-size: 1.5rem;
          }

          .form-body {
            padding: 1.5rem;
          }

          .enhanced-submit-btn {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }
        }

        .contact-form-container {
          position: relative;
        }

        .contact-info-card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-6);
        }

        .contact-info-icon {
          width: 50px;
          height: 50px;
          background: var(--gradient-primary);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .contact-info-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--secondary-800);
          margin-bottom: var(--space-2);
        }

        .contact-info-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .contact-info-detail {
          color: var(--secondary-600);
          font-size: 0.875rem;
          margin-bottom: var(--space-1);
        }

        .contact-link {
          color: var(--primary-600);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .contact-link:hover {
          color: var(--primary-700);
          text-decoration: underline;
        }

        .department-card {
          padding: var(--space-8);
          text-align: center;
        }
        
        .department-icon {
          width: 60px;
          height: 60px;
          background: var(--gradient-secondary);
          border-radius: var(--radius-2xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-6);
          color: white;
        }

        .department-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--secondary-800);
          margin-bottom: var(--space-3);
        }

        .department-description {
          color: var(--secondary-600);
          line-height: 1.6;
          margin-bottom: var(--space-6);
        }

        .department-contact {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--secondary-600);
          font-size: 0.875rem;
          margin-bottom: var(--space-2);
        }

        .faq-card {
          padding: var(--space-6);
        }

        .faq-question {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--secondary-800);
          margin-bottom: var(--space-3);
        }

        .faq-answer {
          color: var(--secondary-600);
          line-height: 1.6;
        }

        .map-container {
          padding: var(--space-16);
          text-align: center;
        }

        .map-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          background: var(--gradient-light);
          border-radius: var(--radius-2xl);
        }

        .map-placeholder .btn {
          transition: all 0.3s ease;
        }

        .map-placeholder .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
          
          .grid-cols-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;