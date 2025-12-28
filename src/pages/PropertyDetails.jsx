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
  Search,
  ZoomIn,
  Sparkles,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { interestService } from "@/services/interestService";
import PropertyGallery from "../components/PropertyGallery";
import ImageGalleryLightbox from "../components/ImageGalleryLightbox";
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
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 animate-spin" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gold-400 animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">Loading property details...</p>
        </motion.div>
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
      {/* Hero Section with Main Image - Premium Parallax Effect */}
      <div className="relative">
        <div 
          className="relative h-[70vh] min-h-[550px] w-full overflow-hidden"
          style={{ perspective: '1000px' }}
        >
          {/* Main Image with Parallax */}
          <div 
            className="absolute inset-0"
            style={{
              transform: 'translateZ(-1px) scale(1.1)',
              willChange: 'transform',
            }}
          >
            <img
              src={images[currentImageIndex] || images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700"
              style={{ transform: 'scale(1.05)' }}
            />
          </div>
          
          {/* Multi-layer gradient overlays for cinematic depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
          
          {/* Animated accent orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, hsl(48 96% 53% / 0.3) 0%, transparent 70%)',
                animation: 'float 8s ease-in-out infinite',
                filter: 'blur(40px)',
              }}
            />
            <div 
              className="absolute bottom-[30%] left-[5%] w-[200px] h-[200px] rounded-full opacity-15"
              style={{
                background: 'radial-gradient(circle, hsl(145 63% 32% / 0.4) 0%, transparent 70%)',
                animation: 'float 10s ease-in-out infinite',
                animationDelay: '-4s',
                filter: 'blur(30px)',
              }}
            />
          </div>
          
          {/* Floating Back Button with glass effect */}
          <div className="absolute top-6 left-6 z-20">
            <button
              onClick={() => navigate(-1)}
              className="group glass border border-white/20 text-white px-5 py-3 rounded-xl shadow-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center gap-2 font-semibold backdrop-blur-xl"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </div>

          {/* Floating Action Buttons with 3D effect */}
          <div className="absolute top-6 right-6 z-20 flex gap-3">
            <button
              onClick={toggleFavorite}
              className={`group glass p-4 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-xl border ${
                isFavorite 
                  ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                  : 'border-white/20 text-white hover:bg-white/20 hover:border-white/30'
              }`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              style={{ transform: 'perspective(500px) rotateX(0deg)' }}
            >
              <Heart className={`h-5 w-5 transition-transform group-hover:scale-110 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="group glass border border-white/20 p-4 rounded-xl shadow-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-white backdrop-blur-xl"
              title="Share property"
            >
              <Share2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Image Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 glass border border-white/20 p-4 rounded-full text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-xl group"
              >
                <ChevronLeft className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 glass border border-white/20 p-4 rounded-full text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-xl group"
              >
                <ChevronRight className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* Hero Content with 3D depth */}
          <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 pb-10">
            <div className="max-w-4xl animate-fade-in-up">
              {/* Status Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400/20 to-gold-500/10 px-5 py-2 text-sm font-bold text-gold-400 backdrop-blur-md border border-gold-400/30 shadow-glow-gold">
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
                  {property.status === "for-sale" ? "FOR SALE" : "FOR RENT"}
                </span>
              </div>
              
              {/* Title with text shadow */}
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5"
                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4), 0 0 60px hsl(48 96% 53% / 0.15)' }}
              >
                {property.title}
              </h1>
              
              {/* Location */}
              <div className="flex items-center gap-3 text-lg text-white/90 mb-8">
                <div className="p-2 rounded-lg bg-gold-400/20 backdrop-blur-sm">
                  <MapPin className="h-5 w-5 text-gold-400" />
                </div>
                <span className="font-medium">{property.location}</span>
              </div>
              
              {/* Price with luxury styling */}
              <div className="flex items-baseline gap-4">
                <span 
                  className="text-5xl md:text-6xl lg:text-7xl font-black text-gradient-gold"
                  style={{ textShadow: '0 0 40px hsl(48 96% 53% / 0.3)' }}
                >
                  {formatPrice(property.price)}
                </span>
                <span className="text-2xl text-white/70 font-semibold">
                  ETB
                </span>
              </div>
            </div>
          </div>
          
          {/* Image count indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-10 right-6 z-20">
              <div className="glass border border-white/20 rounded-xl px-4 py-2 backdrop-blur-xl flex items-center gap-3 text-white">
                <div className="flex gap-1.5">
                  {images.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex 
                          ? 'w-6 bg-gold-400' 
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                  {images.length > 5 && (
                    <span className="text-xs text-white/60 ml-1">+{images.length - 5}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery with 3D Card Effects */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-luxury p-8 hover:shadow-glow-gold/20 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 flex items-center justify-center">
                  <span className="text-gold-400 text-xl">📸</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Photo Gallery</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Main large image with 3D tilt effect */}
                <div 
                  className="col-span-2 relative h-[450px] w-full overflow-hidden rounded-2xl cursor-pointer group"
                  onClick={() => setShowImageModal(true)}
                  style={{ 
                    perspective: '1000px',
                    transformStyle: 'preserve-3d' 
                  }}
                >
                  <div 
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <img
                      src={images[currentImageIndex] || images[0]}
                      alt={`${property.title} - Main image`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Interactive hint */}
                  <div className="absolute bottom-6 right-6 glass border border-white/20 text-white px-5 py-3 rounded-xl text-sm backdrop-blur-xl flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-all group-hover:translate-y-0 translate-y-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Search className="w-4 h-4" />
                    </div>
                    <span>View all {images.length} photos</span>
                  </div>
                  
                  {/* Image navigation on hover */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 glass border border-white/20 p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 glass border border-white/20 p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Thumbnail grid with 3D hover */}
                {images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx + 1}
                    className="relative h-52 w-full overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => {
                      setCurrentImageIndex(idx + 1);
                      setShowImageModal(true);
                    }}
                    style={{ perspective: '500px' }}
                  >
                    <div className="absolute inset-0 transition-all duration-500 group-hover:scale-105">
                      <img
                        src={img}
                        alt={`${property.title} image ${idx + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold-400/30 rounded-xl transition-colors duration-300" />
                  </div>
                ))}
                {images.length > 5 && (
                  <div
                    className="relative h-52 w-full overflow-hidden rounded-xl cursor-pointer group bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center border border-border/50 hover:border-gold-400/30 transition-all duration-300"
                    onClick={() => {
                      setCurrentImageIndex(5);
                      setShowImageModal(true);
                    }}
                  >
                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                      <div className="text-4xl font-bold text-gradient-gold mb-2">
                        +{images.length - 5}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">More photos</div>
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

      {/* Premium Property Gallery Lightbox */}
      <PropertyGallery
        images={images}
        currentIndex={currentImageIndex}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onIndexChange={setCurrentImageIndex}
        propertyTitle={property.title}
      />

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
      {/* Image Gallery Lightbox */}
      <ImageGalleryLightbox 
        images={images}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        initialIndex={currentImageIndex}
      />
    </div>
  );
};

export default PropertyDetails;
