// import axios from "axios";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  User,
  CheckCircle,
  Car,
  Wifi,
  Tv,
  Utensils,
  Wind,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { interestService } from "@/services/interestService";

import { useAuth } from "../context/AuthContext";
import { favoritesService } from "../services/favoritesService";
import { propertyService } from "../services/propertyService";
import { userService } from "../services/userService";

import "../styles/property-details.css";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    visitDate: "",
    visitTime: "",
  });

  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    content: "",
  });
  const [messageError, setMessageError] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);

  // Auto-fill contact form with current user data when modal opens
  useEffect(() => {
    const populateUserContact = async () => {
      try {
        let profile = user;
        if (!profile || (!profile.name && !profile.email)) {
          const meResult = await userService.getMe();
          if (meResult.success) {
            profile = meResult.data?.data?.data || meResult.data?.data || meResult.data?.user || meResult.data;
          }
        }
        if (profile) {
          setContactForm((prev) => ({
            ...prev,
            name: profile.name || prev.name || "",
            email: profile.email || prev.email || "",
            phone: profile.phone || profile.phoneNumber || prev.phone || "",
          }));
        }
      } catch (_) {
        // silent fail; user can fill manually
      }
    };

    if (showContactForm) {
      populateUserContact();
    }
  }, [showContactForm, user]);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching property with ID:", id);
        const result = await propertyService.getProperty(id);
        console.log("Property service result:", result);

        if (result.success) {
          // Backend returns: { status: 'success', data: { data: {...} } }
          const propertyData = result.data?.data?.data;
          console.log("Property data:", propertyData);
          setProperty(propertyData);

          // If property has an owner, fetch owner details (owner is the seller/agent)
          if (propertyData.owner && propertyData.owner._id) {
            try {
              console.log("Fetching agent data for:", propertyData.owner._id);
              const agentResult = await userService.getUser(
                propertyData.owner._id
              );
              console.log("Agent result:", agentResult);
              if (agentResult.success) {
                setAgent(agentResult.data.data.data);
              }
            } catch (e) {
              // If fetching owner requires auth, ignore and continue rendering property
              console.warn(
                "Owner fetch failed (non-fatal):",
                e?.response?.status
              );
            }
          }

          // Check if property is in favorites
          if (isAuthenticated && user) {
            checkFavoriteStatus(propertyData._id);
          }
        } else {
          console.error("Property service error:", result.error);
          setError(result.error);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, isAuthenticated, user]);

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  const checkFavoriteStatus = async (propertyId) => {
    try {
      const result = await favoritesService.checkFavorite(propertyId);
      if (result.success) {
        setIsFavorite(result.data.isFavorite);
      }
    } catch (error) {
      console.error("Failed to check favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const result = await favoritesService.toggleFavorite(property._id);
      if (result.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send the contact form data to your backend
    await interestService.submitInterest(id, contactForm);
    alert("Your message has been sent to the agent or seller!");
    setShowContactForm(false);
    setContactForm({
      name: "",
      email: "",
      phone: "",
      message: "",
      visitDate: "",
      visitTime: "",
    });
  };

  // Message modal functions
  const openMessageModal = () => {
    if (!isAuthenticated) {
      alert("Please log in to send a message");
      navigate("/login");
      return;
    }

    // Pre-fill the subject with property information
    setMessageForm({
      subject: `Inquiry about ${property.title}`,
      content: "",
    });
    setShowMessageModal(true);
    setMessageError("");
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setMessageError("Please log in to send a message");
      return;
    }

    setMessageLoading(true);
    setMessageError("");

    try {
      const { messageService } = await import("../services/messageService");

      const result = await messageService.createPropertyMessage({
        propertyId: property._id,
        subject: messageForm.subject,
        content: messageForm.content,
        messageType: "property",
        priority: "medium",
      });

      if (result.success) {
        alert("Message sent successfully!");
        setShowMessageModal(false);
        setMessageForm({ subject: "", content: "" });
      } else {
        setMessageError(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageError("Failed to send message. Please try again.");
    } finally {
      setMessageLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => {
      const images = property.imagesUrl || property.images || [];
      const displayImages = images.length > 0 ? images : [fallbackImage];
      return prev === displayImages.length - 1 ? 0 : prev + 1;
    });
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => {
      const images = property.imagesUrl || property.images || [];
      const displayImages = images.length > 0 ? images : [fallbackImage];
      return prev === 0 ? displayImages.length - 1 : prev - 1;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Property</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/properties")}
            className="btn btn-primary"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="not-found-container">
        <h2>Property Not Found</h2>
        <p>The property you&apos;re looking for doesn&apos;t exist.</p>
        <button
          onClick={() => navigate("/properties")}
          className="btn btn-primary"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  // Use the images array from property data and normalize to string URLs
  const rawImages = property.imagesUrl || property.images || [];
  const images = Array.isArray(rawImages)
    ? rawImages
    : [rawImages].filter(Boolean);
  console.log("Property images:", property);

  // Fallback image if no images are available
  const fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ctext x='300' y='200' font-family='Arial, sans-serif' font-size='24' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E";

  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : [fallbackImage];

  const amenities = [
    { icon: Wifi, label: "WiFi", available: true },
    {
      icon: Car,
      label: "Parking",
      available: property.features?.parking,
    },
    { icon: Tv, label: "Cable TV", available: true },
    { icon: Utensils, label: "Kitchen", available: true },
    { icon: Wind, label: "Air Conditioning", available: false },
    { icon: Shield, label: "Security", available: true },
  ];

  return (
    <div className="property-details">
      {/* Back Button */}
      <div className="back-button-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
          Back
        </button>
      </div>

      {/* Image Gallery */}
      <div className="property-gallery">
        <div className="main-image-container">
          <button
            src={displayImages[currentImageIndex]}
            onClick={() => setShowImageModal(true)}
            aria-label="Open image gallery"
            className="main-image"
            style={{ padding: 0, border: "none", background: "transparent" }}
          >
            <img
              src={displayImages[currentImageIndex]}
              alt={property.title}
              className="main-image"
            />
          </button>

          {displayImages.length > 1 && (
            <>
              <button className="gallery-nav prev" onClick={prevImage}>
                <ChevronLeft />
              </button>
              <button className="gallery-nav next" onClick={nextImage}>
                <ChevronRight />
              </button>
            </>
          )}

          <div className="image-counter">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
        </div>

        {displayImages.length > 1 && (
          <div className="thumbnail-gallery">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`View image ${index + 1}`}
                className={`thumbnail ${
                  index === currentImageIndex ? "active" : ""
                }`}
                style={{
                  padding: 0,
                  border: "none",
                  background: "transparent",
                }}
              >
                <img
                  src={image}
                  alt={`${property.title} ${index + 1}`}
                  className="thumbnail"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="property-details-container">
        <div className="property-main-content">
          {/* Property Header */}
          <div className="property-header">
            <div className="property-title-section">
              <div className="property-badges">
                {(() => {
                  const statusText = (property.status || "active").toString();
                  return (
                    <span
                      className={`status-badge ${statusText
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {statusText}
                    </span>
                  );
                })()}
                {property.isVerified && (
                  <span className="verified-badge">
                    <CheckCircle style={{ width: "14px", height: "14px" }} />
                    Verified
                  </span>
                )}
              </div>

              <h1 className="property-title">{property.title}</h1>

              <div className="property-location">
                <MapPin style={{ width: "16px", height: "16px" }} />
                {property.location}
              </div>

              <div className="property-price">
                ETB {formatPrice(property.price)}
                <span className="property-type">{property.type}</span>
              </div>

              {/* Removed large header buy button: kept in Contact Owner card and footer */}
            </div>

            <div className="property-actions">
              <button
                onClick={toggleFavorite}
                className={`action-btn ${isFavorite ? "favorited" : ""}`}
              >
                <Heart style={{ width: "20px", height: "20px" }} />
                {isFavorite ? "Saved" : "Save"}
              </button>

             {/*  <button onClick={handleShare} className="action-btn">
                <Share2 style={{ width: "20px", height: "20px" }} />
                Share
              </button> */}

              <button
                onClick={() => setShowContactForm(true)}
                className="action-btn primary"
              >
                <Calendar style={{ width: "20px", height: "20px" }} />
                Schedule Visit
              </button>
            </div>
          </div>

          {/* Property Features */}
          <div className="property-features-section">
            <h3>Property Features</h3>
            <div className="features-grid">
              {property.features?.bedrooms > 0 && (
                <div className="feature-item">
                  <Bed style={{ width: "24px", height: "24px" }} />
                  <div>
                    <span className="feature-value">
                      {property.features.bedrooms}
                    </span>
                    <span className="feature-label">Bedrooms</span>
                  </div>
                </div>
              )}

              {property.features?.bathrooms > 0 && (
                <div className="feature-item">
                  <Bath style={{ width: "24px", height: "24px" }} />
                  <div>
                    <span className="feature-value">
                      {property.features.bathrooms}
                    </span>
                    <span className="feature-label">Bathrooms</span>
                  </div>
                </div>
              )}

              <div className="feature-item">
                <Square style={{ width: "24px", height: "24px" }} />
                <div>
                  <span className="feature-value">
                    {property.features?.area}m²
                  </span>
                  <span className="feature-label">Area</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="property-description-section">
            <h3>Description</h3>
            <p>{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="property-amenities-section">
            <h3>Amenities</h3>
            <div className="amenities-grid">
              {amenities.map((amenity, index) => (
                <div
                  key={index}
                  className={`amenity-item ${
                    amenity.available ? "available" : "unavailable"
                  }`}
                >
                  <amenity.icon style={{ width: "20px", height: "20px" }} />
                  <span>{amenity.label}</span>
                  {amenity.available && (
                    <CheckCircle style={{ width: "16px", height: "16px" }} />
                  )}
                </div>
              ))}
              <div className="amenities-buy-item">
                <button
                  className="btn btn-primary btn-payment amenities-buy-btn"
                  onClick={() =>
                    navigate(`/payment/${property._id}`, {
                      state: { amount: property.price },
                    })
                  }
                >
                  <CreditCard style={{ width: "18px", height: "18px" }} />
                  Buy Now - ETB {formatPrice(property.price)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Contact Card (not fixed) */}
        <div className="agent-contact-card">
          {agent ? (
            <>
              <div className="agent-header">
                <img
                  src={agent.imagesUrl || agent.photo || agent.image}
                  alt={agent.name}
                  className="agent-avatar"
                />
                <div className="agent-info">
                  <h4>{agent.name}</h4>
                  <p>{agent.title}</p>
                  <div className="agent-rating">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`star ${i < agent.rating ? "filled" : ""}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="rating-text">
                      ({agent.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="agent-contact-info">
                <div className="contact-item">
                  <Phone style={{ width: "16px", height: "16px" }} />
                  <span>{agent.phone}</span>
                </div>
                <div className="contact-item">
                  <Mail style={{ width: "16px", height: "16px" }} />
                  <span>{agent.email}</span>
                </div>
              </div>

              {/* Payment and Contact Actions */}
              <div className="agent-actions">
                {/* Payment Button - Always visible for now */}
                <button
                  className="btn btn-primary btn-payment"
                  onClick={() =>
                    navigate(`/payment/${property._id}`, {
                      state: { amount: property.price },
                    })
                  }
                  style={{
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    color: "white",
                    border: "none",
                    padding: "1rem 2rem",
                    borderRadius: "8px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    marginBottom: "1rem",
                    fontSize: "1.1rem",
                  }}
                >
                  <CreditCard style={{ width: "20px", height: "20px" }} />
                  Buy  -{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "ETB",
                    minimumFractionDigits: 0,
                  }).format(property.price)}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={openMessageModal}
                >
                  <MessageSquare style={{ width: "16px", height: "16px" }} />
                  Message Agent
                </button>

                <button className="btn btn-secondary btn-full">
                  <Phone style={{ width: "16px", height: "16px" }} />
                  Call Now
                </button>
              </div>
            </>
          ) : (
            <div className="no-agent">
              <h4>Contact Property Owner</h4>

              {/* Payment Button for no-agent case */}
              <button
                className=" btn-primary btn-payment"
                onClick={() =>
                  navigate(`/payment/${property._id}`, {
                    state: { amount: property.price },
                  })
                }
                style={{
                  background:
                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  color: "white",
                  border: "none",
                  padding: "1rem 1.5rem",
                  borderRadius: "8px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  marginBottom: "1rem",
                  fontSize: "1.1rem",
                  width: "100%",
                }}
              >
                <CreditCard style={{ width: "20px", height: "20px" }} />
                Buy This Property -{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "ETB",
                  minimumFractionDigits: 0,
                }).format(property.price)}
              </button>

              <div className="contact-item">
                <Phone style={{ width: "16px", height: "16px" }} />
                <span>{agent?.phone || property.owner?.phone}</span>
              </div>
              <div className="contact-item">
                <Mail style={{ width: "16px", height: "16px" }} />
                <span>{agent?.email || property.owner?.email}</span>
              </div>
              <button
                onClick={openMessageModal}
                className="btn btn-primary btn-full"
              >
                Message Owner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="image-modal"
          role="button"
          tabIndex={0}
          aria-label="Close image gallery"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setShowImageModal(false);
            }
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="image-modal-content"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowImageModal(false)}
            >
              <X style={{ width: "24px", height: "24px" }} />
            </button>

            <img
              src={displayImages[currentImageIndex]}
              alt={property.title}
              className="modal-image"
            />

            {images.length > 1 && (
              <>
                <button className="modal-nav prev" onClick={prevImage}>
                  <ChevronLeft style={{ width: "32px", height: "32px" }} />
                </button>
                <button className="modal-nav next" onClick={nextImage}>
                  <ChevronRight style={{ width: "32px", height: "32px" }} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div
          className="contact-modal"
          role="button"
          tabIndex={0}
          aria-label="Close contact form"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setShowContactForm(false);
            }
          }}
          onClick={() => setShowContactForm(false)}
        >
          <div
            className="contact-modal-content"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="contact-modal-header">
              <h3>Schedule a Visit</h3>
              <button
                className="modal-close"
                onClick={() => setShowContactForm(false)}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="visitDate">Preferred Date</label>
                  <input
                    type="date"
                    id="visitDate"
                    value={contactForm.visitDate}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        visitDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="visitTime">Preferred Time</label>
                  <input
                    type="time"
                    id="visitTime"
                    value={contactForm.visitTime}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        visitTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  rows="4"
                  placeholder="Any specific questions or requirements..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div
          className="contact-modal"
          role="button"
          tabIndex={0}
          aria-label="Close message form"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setShowMessageModal(false);
            }
          }}
          onClick={() => setShowMessageModal(false)}
        >
          <div
            className="contact-modal-content"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="contact-modal-header">
              <h3>Send Message to Agent</h3>
              <button
                className="modal-close"
                onClick={() => setShowMessageModal(false)}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <form onSubmit={handleMessageSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="msgSubject">Subject</label>
                <input
                  id="msgSubject"
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="msgContent">Message</label>
                <textarea
                  id="msgContent"
                  value={messageForm.content}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, content: e.target.value })
                  }
                  rows="6"
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>

              {messageError && (
                <div
                  className="error-message"
                  style={{ color: "red", marginBottom: "1rem" }}
                >
                  {messageError}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="btn btn-secondary"
                  disabled={messageLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={messageLoading}
                >
                  {messageLoading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Footer Buy Button (short, bottom-right within flow) */}
      <div
        style={{ maxWidth: "1200px", margin: "24px auto 0", padding: "0 20px" }}
      ></div>
    </div>
  );
};

export default PropertyDetails;