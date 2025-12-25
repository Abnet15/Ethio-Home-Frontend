// Modern Property Details Page - Redesigned
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
  Clock,
  ArrowLeft,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { interestService } from "@/services/interestService";
import { useAuth } from "../context/AuthContext";
import { favoritesService } from "../services/favoritesService";
import { propertyService } from "../services/propertyService";
import { userService } from "../services/userService";
import { getPropertyImagesFromResponse } from "../utils/imageUtils";
import { SERVER_BASE_URL } from "../config/api";

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
        const result = await propertyService.getProperty(id);

        if (result.success) {
          const propertyData = result.data?.data?.data;
          setProperty(propertyData);

          // If property has an owner, fetch owner details
          if (propertyData.owner && propertyData.owner._id) {
            try {
              const agentResult = await userService.getUser(propertyData.owner._id);
              if (agentResult.success) {
                setAgent(agentResult.data.data.data);
              }
            } catch (e) {
              console.warn("Owner fetch failed (non-fatal):", e?.response?.status);
            }
          }

          // Check if property is in favorites
          if (isAuthenticated && user) {
            checkFavoriteStatus(propertyData._id);
          }
        } else {
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
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const checkFavoriteStatus = async (propertyId) => {
    try {
      const result = await favoritesService.checkFavorite(propertyId);
      if (result.success) {
        setIsFavorite(result.data?.isFavorite || result.data?.data?.isFavorite || false);
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
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
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

  const openMessageModal = () => {
    if (!isAuthenticated) {
      alert("Please log in to send a message");
      navigate("/login");
      return;
    }

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

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => {
      const images = getPropertyImagesFromResponse(property) || [];
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  }, [property]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => {
      const images = getPropertyImagesFromResponse(property) || [];
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  }, [property]);

  useEffect(() => {
    if (!showImageModal) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowImageModal(false);
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageModal, nextImage, prevImage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-xl border border-destructive/30 p-6 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Property</h2>
          <p className="text-muted-foreground mb-6">{error || "Property not found"}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/properties")}
              className="px-4 py-2 bg-ethiopian-yellow text-black rounded-lg hover:bg-ethiopian-yellow/90 transition-colors font-semibold"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get images from property
  const displayImages = getPropertyImagesFromResponse(property);
  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ctext x='300' y='200' font-family='Arial, sans-serif' font-size='24' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E";
  const images = displayImages.length > 0 ? displayImages : [fallbackImage];

  const amenities = [
    { icon: Wifi, label: "WiFi", available: true },
    { icon: Car, label: "Parking", available: property.features?.parking },
    { icon: Tv, label: "Cable TV", available: true },
    { icon: Utensils, label: "Kitchen", available: true },
    { icon: Wind, label: "Air Conditioning", available: false },
    { icon: Shield, label: "Security", available: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section with Main Image */}
      <div className="relative">
        <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
          <img
            src={images[currentImageIndex] || images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
          
          {/* Floating Back Button */}
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => navigate(-1)}
              className="bg-white/90 backdrop-blur-md text-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-colors flex items-center gap-2 font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute top-6 right-6 z-10 flex gap-2">
            <button
              onClick={toggleFavorite}
              className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg hover:bg-white transition-colors"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg hover:bg-white transition-colors"
              title="Share property"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Hero Content */}
          <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 pb-8">
            <div className="max-w-4xl">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-ethiopian-yellow/20 px-4 py-1.5 text-sm font-semibold text-ethiopian-yellow backdrop-blur-sm">
                  {property.status === "for-sale" ? "FOR SALE" : "FOR RENT"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 drop-shadow-lg">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-lg text-muted-foreground mb-6">
                <MapPin className="h-5 w-5 text-ethiopian-yellow" />
                <span className="font-medium">{property.location}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl md:text-6xl font-black text-foreground">
                  {formatPrice(property.price)}
                </span>
                <span className="text-2xl text-muted-foreground font-semibold">
                  ETB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-card rounded-xl border shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Photo Gallery</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Main large image */}
                <div 
                  className="col-span-2 relative h-96 w-full overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => setShowImageModal(true)}
                >
                  <img
                    src={images[currentImageIndex] || images[0]}
                    alt={`${property.title} - Main image`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm">
                    Click to view all {images.length} photos
                  </div>
                </div>
                
                {/* Thumbnail grid */}
                {images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx + 1}
                    className="relative h-48 w-full overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => {
                      setCurrentImageIndex(idx + 1);
                      setShowImageModal(true);
                    }}
                  >
                    <img
                      src={img}
                      alt={`${property.title} image ${idx + 2}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
                {images.length > 5 && (
                  <div
                    className="relative h-48 w-full overflow-hidden rounded-xl cursor-pointer group bg-muted flex items-center justify-center"
                    onClick={() => {
                      setCurrentImageIndex(5);
                      setShowImageModal(true);
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-muted-foreground mb-2">
                        +{images.length - 5}
                      </div>
                      <div className="text-sm text-muted-foreground">More photos</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Overview Section */}
            <div className="bg-card rounded-xl border shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Property Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.features?.bedrooms && (
                  <div className="flex items-center gap-4 rounded-xl border-2 border-muted bg-card p-4 transition-all duration-300 hover:border-ethiopian-yellow/30 hover:shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ethiopian-yellow/20 to-ethiopian-yellow/10 text-ethiopian-yellow">
                      <Bed className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Bedrooms
                      </p>
                      <p className="text-xl font-bold text-foreground">{property.features.bedrooms}</p>
                    </div>
                  </div>
                )}

                {property.features?.bathrooms && (
                  <div className="flex items-center gap-4 rounded-xl border-2 border-muted bg-card p-4 transition-all duration-300 hover:border-ethiopian-yellow/30 hover:shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ethiopian-yellow/20 to-ethiopian-yellow/10 text-ethiopian-yellow">
                      <Bath className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Bathrooms
                      </p>
                      <p className="text-xl font-bold text-foreground">{property.features.bathrooms}</p>
                    </div>
                  </div>
                )}

                {property.features?.area && (
                  <div className="flex items-center gap-4 rounded-xl border-2 border-muted bg-card p-4 transition-all duration-300 hover:border-ethiopian-yellow/30 hover:shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ethiopian-yellow/20 to-ethiopian-yellow/10 text-ethiopian-yellow">
                      <Square className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Area
                      </p>
                      <p className="text-xl font-bold text-foreground">{property.features.area} m²</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 rounded-xl border-2 border-muted bg-card p-4 transition-all duration-300 hover:border-ethiopian-yellow/30 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ethiopian-yellow/20 to-ethiopian-yellow/10 text-ethiopian-yellow">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Type
                    </p>
                    <p className="text-xl font-bold text-foreground">{property.type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-card rounded-xl border shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                {property.description || "No description available for this property."}
              </p>
            </div>

            {/* Amenities Section */}
            <div className="bg-card rounded-xl border shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      amenity.available ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 opacity-50"
                    }`}
                  >
                    <amenity.icon className={`h-5 w-5 ${amenity.available ? "text-green-600" : "text-gray-400"}`} />
                    <span className={`font-medium ${amenity.available ? "text-green-900" : "text-gray-500"}`}>
                      {amenity.label}
                    </span>
                    {amenity.available && (
                      <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Sticky */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-6">
            {/* Price & Actions Card */}
            <div className="bg-card rounded-xl border-2 border-ethiopian-yellow/20 shadow-lg p-6 space-y-6">
              <div className="text-center space-y-2 pb-4 border-b">
                <div className="text-4xl font-black text-foreground">
                  {formatPrice(property.price)}
                </div>
                <div className="text-lg text-muted-foreground font-medium">
                  ETB
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  className="w-full bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate(`/payment/${property._id}`, { state: { amount: property.price } })}
                >
                  <CreditCard className="h-5 w-5" />
                  Buy Now
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowContactForm(true)}
                    className="w-full border-2 border-ethiopian-yellow/50 px-4 py-2 rounded-lg hover:bg-ethiopian-yellow/10 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <Phone className="h-4 w-4" />
                    Contact
                  </button>
                  <button 
                    onClick={openMessageModal}
                    className="w-full border-2 border-ethiopian-yellow/50 px-4 py-2 rounded-lg hover:bg-ethiopian-yellow/10 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <Mail className="h-4 w-4" />
                    Message
                  </button>
                </div>
              </div>
            </div>

            {/* Agent/Owner Card */}
            {agent && (
              <div className="bg-card rounded-xl border shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Listed by</h3>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted ring-2 ring-ethiopian-yellow/20">
                    <img
                      src={agent.imagesUrl?.[0] || agent.photo || agent.image || "/placeholder-avatar.jpg"}
                      alt={agent.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-avatar.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{agent.name}</p>
                    {agent.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Phone className="h-4 w-4" />
                        {agent.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10 p-2 rounded-lg transition-colors"
              onClick={() => setShowImageModal(false)}
            >
              <X className="h-6 w-6" />
            </button>
            
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 text-white hover:bg-white/20 z-10 p-2 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  className="absolute right-4 text-white hover:bg-white/20 z-10 p-2 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div 
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[currentImageIndex] || images[0]}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowContactForm(false)}
        >
          <div 
            className="w-full max-w-2xl bg-card rounded-xl border shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold">Contact Agent</h3>
              <button 
                onClick={() => setShowContactForm(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Visit Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="date"
                      value={contactForm.visitDate}
                      onChange={(e) => setContactForm({ ...contactForm, visitDate: e.target.value })}
                      className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Visit Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="time"
                    value={contactForm.visitTime}
                    onChange={(e) => setContactForm({ ...contactForm, visitTime: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={5}
                  placeholder="Share what you love about this property or your availability for a visit..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow resize-none"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Send to Agent
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowMessageModal(false)}
        >
          <div 
            className="w-full max-w-2xl bg-card rounded-xl border shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold">Send Message</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleMessageSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  required
                  placeholder="e.g., Question about property details"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                  rows={6}
                  placeholder="Write your message here..."
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow resize-none"
                />
              </div>
              {messageError && (
                <div className="text-red-500 text-sm">{messageError}</div>
              )}
              <button 
                type="submit" 
                disabled={messageLoading}
                className="w-full bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                {messageLoading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
