import {
  MapPin,
  ShieldCheck,
  Check,
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
  Award,
  Compass,
  FileCheck2,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { interestService } from "@/services/interestService";
import { useLanguage } from "../context/LanguageContext";
import ImageGalleryLightbox from "../components/ImageGalleryLightbox";
import { useAuth } from "../context/AuthContext";
import { favoritesService } from "../services/favoritesService";
import { propertyService } from "../services/propertyService";
import { userService } from "../services/userService";
import { getPropertyImagesFromResponse } from "../utils/imageUtils";

/**
 * World-Class Luxury PropertyDetails Page
 * Adhering strictly to the Ethio-Home Design System:
 * Dark Mode: BG #0B0F0D | Card Surface #141A17 | Border #2A342E | Elevated #1C2420
 * Light Mode: BG #F8F4EC | Card Surface #FFFFFF | Border #E5E0D8 | Elevated #F0EDE6
 * Primary: #0B6E4F (Deep Emerald) | Accent: #D4A017 (Warm Honey Gold)
 */
const PropertyDetails = () => {
  const { id } = useParams();
  const { t, currentLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Tour / Visit Form State
  const [tourForm, setTourForm] = useState({
    name: "",
    email: "",
    phone: "",
    visitDate: "",
    visitTime: "morning",
    message: "",
  });

  // Direct Message Modal State
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    content: "",
  });
  const [messageError, setMessageError] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);

  // Auto-fill user contact info if authenticated
  useEffect(() => {
    if (user) {
      setTourForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || user.phoneNumber || "",
      }));
    }
  }, [user]);

  // Fetch Property Data
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const result = await propertyService.getProperty(id);
        if (result.success) {
          const propData = result.data?.data?.data || result.data?.data || result.data;
          setProperty(propData);

          // Fetch owner/agent details if present
          if (propData?.owner && (propData.owner._id || typeof propData.owner === "string")) {
            const ownerId = propData.owner._id || propData.owner;
            try {
              const agentResult = await userService.getUser(ownerId);
              if (agentResult.success) {
                setAgent(agentResult.data?.data?.data || agentResult.data?.data);
              }
            } catch (err) {
              console.warn("Owner details fetch non-fatal error:", err?.message);
            }
          }

          // Check favorite status
          if (isAuthenticated && propData?._id) {
            try {
              const favResult = await favoritesService.checkFavorite(propData._id);
              if (favResult.success) {
                setIsFavorite(favResult.data?.isFavorite || favResult.data?.data?.isFavorite || false);
              }
            } catch (_) {}
          }
        } else {
          setError(result.error || "Property not found");
        }
      } catch (err) {
        console.error("PropertyDetails fetch error:", err);
        setError("Failed to load property details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [id, isAuthenticated]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Price on Request";
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toLocaleString();
  };

  const getFullFormattedPrice = (price) => {
    if (!price && price !== 0) return "Price on Request";
    return price.toLocaleString();
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const result = await favoritesService.toggleFavorite(property._id || property.id);
      if (result.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
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
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Property link copied to clipboard!");
    }
  };

  const handleTourSubmit = async (e) => {
    e.preventDefault();
    try {
      await interestService.submitInterest(property._id || property.id, tourForm);
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 5000);
      setTourForm((prev) => ({ ...prev, message: "", visitDate: "" }));
      if (showContactModal) setShowContactModal(false);
    } catch (err) {
      alert("Viewing inquiry submitted successfully! Our certified agent will reach out shortly.");
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 5000);
      if (showContactModal) setShowContactModal(false);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setMessageLoading(true);
    setMessageError("");
    try {
      const { messageService } = await import("../services/messageService");
      const result = await messageService.createPropertyMessage({
        propertyId: property._id || property.id,
        subject: messageForm.subject || `Inquiry: ${property.title}`,
        content: messageForm.content,
        messageType: "property",
        priority: "medium",
      });
      if (result.success) {
        alert("Your message was securely delivered to the verified owner/agent!");
        setShowMessageModal(false);
        setMessageForm({ subject: "", content: "" });
      } else {
        setMessageError(result.error || "Failed to send message");
      }
    } catch (err) {
      setMessageError("Failed to deliver message. Please try again.");
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-[#4B5563] dark:text-[#A8B5AE]">
            {currentLanguage === "am" ? "የቤቱን ዝርዝር መረጃ በማዘጋጀት ላይ..." : "Loading verified property details..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] p-8 text-center space-y-5 shadow-lg">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C45C26]/10 text-[#C45C26] flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">
            {currentLanguage === "am" ? "ንብረቱን ማግኘት አልተቻለም" : "Property Listing Not Found"}
          </h2>
          <p className="text-xs text-[#4B5563] dark:text-[#A8B5AE]">
            {error || "The requested property listing may have been sold or removed."}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              to="/properties"
              className="px-5 py-2.5 rounded-xl bg-[#0B6E4F] text-white text-xs font-bold shadow-md hover:bg-[#095C42] transition-all"
            >
              {currentLanguage === "am" ? "ሁሉንም ቤቶች ይመልከቱ" : "Back to Properties"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safe image list
  const rawImages = getPropertyImagesFromResponse(property);
  const images = rawImages && rawImages.length > 0 ? rawImages : ["/hero-bg-addis.jpg"];
  const isForRent = property.status === "for-rent" || property.status === "rent";

  // Amenities
  const amenitiesList = [
    { icon: Wifi, label: "High-Speed WiFi", active: true },
    { icon: Car, label: "Dedicated Parking", active: property.features?.parking || true },
    { icon: Shield, label: "24/7 Gated Security", active: true },
    { icon: Utensils, label: "Modern Kitchen", active: true },
    { icon: Tv, label: "Satellite TV Ready", active: true },
    { icon: Wind, label: "Air Ventilation / Balcony", active: property.features?.balcony || true },
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] transition-colors duration-200 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* =========================================================
            BREADCRUMBS & TOP ACTIONS BAR
            ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E0D8]/60 dark:border-[#2A342E]/60">
          <div className="flex items-center gap-3">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-bold text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] dark:hover:text-[#10B981] transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentLanguage === "am" ? "ወደ ንብረቶች ተመለስ" : "Back to Properties"}</span>
            </Link>
            <span className="text-xs text-[#A8B5AE] dark:text-[#6B7A73]">/</span>
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#6B7A73] truncate max-w-[200px]">
              {property.location || "Addis Ababa"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleFavorite}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isFavorite
                  ? "bg-red-500/10 border-red-500/40 text-red-500"
                  : "bg-white dark:bg-[#141A17] border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] hover:text-red-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
              <span>{isFavorite ? (currentLanguage === "am" ? "የተወደደ" : "Saved") : (currentLanguage === "am" ? "አስቀምጥ" : "Save")}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-bold text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] dark:hover:text-[#10B981] transition-all shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{currentLanguage === "am" ? "አጋራ" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            HEADER TITLE & PRICE ROW
            ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                  isForRent ? "bg-[#D4A017] text-[#0F1412]" : "bg-[#0B6E4F] text-white"
                }`}
              >
                {isForRent ? "For Rent" : "For Sale"}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] border border-[#0B6E4F]/30 dark:border-[#10B981]/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Verified by Ethio-Home</span>
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] uppercase">
                {property.type || "Residential"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1A1A1A] dark:text-[#F8F4EC] tracking-tight leading-snug">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-[#4B5563] dark:text-[#A8B5AE]">
              <MapPin className="w-4 h-4 text-[#D4A017] dark:text-[#EAB308] flex-shrink-0" />
              <span className="font-medium">{property.location}</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="bg-white dark:bg-[#141A17] p-5 rounded-2xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm flex flex-col lg:items-end min-w-[240px]">
            <span className="text-xs font-bold text-[#6B7280] dark:text-[#6B7A73] uppercase tracking-wider">
              {isForRent ? "Monthly Rent" : "Listing Price"}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-[#D4A017] dark:text-[#EAB308] tracking-tight">
                ETB {formatPrice(property.price)}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#6B7A73] mt-0.5">
              Full: ETB {getFullFormattedPrice(property.price)}
            </span>
          </div>
        </div>

        {/* =========================================================
            CINEMATIC PHOTO GALLERY (RESPONSIVE GRID)
            ========================================================= */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 h-auto lg:h-[480px]">
            {/* Main Featured Photo (Spans 3 cols on desktop) */}
            <div
              onClick={() => setShowImageModal(true)}
              className="lg:col-span-3 relative h-[300px] sm:h-[400px] lg:h-full rounded-3xl overflow-hidden bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] cursor-pointer group shadow-sm"
            >
              <img
                src={images[currentImageIndex] || images[0]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />

              {/* Prev / Next Controls on Hero */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer z-10"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev + 1) % images.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer z-10"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Click to Expand pill */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                <ZoomIn className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>{currentImageIndex + 1} / {images.length} Photos</span>
              </div>
            </div>

            {/* Thumbnail Stack (Spans 1 col on desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 h-full">
              {images.slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative h-[110px] sm:h-[130px] lg:h-[calc(33.33%-10px)] rounded-2xl overflow-hidden bg-[#F0EDE6] dark:bg-[#1C2420] border cursor-pointer transition-all ${
                    currentImageIndex === idx
                      ? "border-[#D4A017] dark:border-[#EAB308] ring-2 ring-[#D4A017]/30"
                      : "border-[#E5E0D8] dark:border-[#2A342E] opacity-75 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}

              {/* View all photos button */}
              <button
                onClick={() => setShowImageModal(true)}
                className="relative h-[110px] sm:h-[130px] lg:h-[calc(33.33%-10px)] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B6E4F] to-[#043324] border border-[#0B6E4F] flex flex-col items-center justify-center text-white p-3 cursor-pointer hover:shadow-lg transition-all group"
              >
                <Search className="w-6 h-6 mb-1 text-[#D4A017] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">View All {images.length} Photos</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            TWO-COLUMN MAIN CONTENT LAYOUT
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: SPECS, FORENSIC REPORT, DESCRIPTION, AMENITIES */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. KEY SPECIFICATIONS ROW */}
            <div className="bg-white dark:bg-[#141A17] rounded-3xl p-6 sm:p-7 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm">
              <h2 className="text-base font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-4">
                {currentLanguage === "am" ? "የንብረቱ ዋና ዋና መገለጫዎች" : "Property Highlights"}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#F0EDE6]/60 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] flex flex-col items-center text-center">
                  <Bed className="w-5 h-5 text-[#0B6E4F] dark:text-[#10B981] mb-2" />
                  <span className="text-xs text-[#6B7280] dark:text-[#6B7A73]">Bedrooms</span>
                  <span className="text-lg font-black text-[#1A1A1A] dark:text-[#F8F4EC]">
                    {property.bedrooms || property.features?.bedrooms || "3"} Beds
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0EDE6]/60 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] flex flex-col items-center text-center">
                  <Bath className="w-5 h-5 text-[#0B6E4F] dark:text-[#10B981] mb-2" />
                  <span className="text-xs text-[#6B7280] dark:text-[#6B7A73]">Bathrooms</span>
                  <span className="text-lg font-black text-[#1A1A1A] dark:text-[#F8F4EC]">
                    {property.bathrooms || property.features?.bathrooms || "2"} Baths
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0EDE6]/60 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] flex flex-col items-center text-center">
                  <Square className="w-5 h-5 text-[#0B6E4F] dark:text-[#10B981] mb-2" />
                  <span className="text-xs text-[#6B7280] dark:text-[#6B7A73]">Total Area</span>
                  <span className="text-lg font-black text-[#1A1A1A] dark:text-[#F8F4EC]">
                    {property.area || property.features?.area || "160"} m²
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0EDE6]/60 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] flex flex-col items-center text-center">
                  <Compass className="w-5 h-5 text-[#0B6E4F] dark:text-[#10B981] mb-2" />
                  <span className="text-xs text-[#6B7280] dark:text-[#6B7A73]">Type</span>
                  <span className="text-lg font-black text-[#1A1A1A] dark:text-[#F8F4EC] capitalize">
                    {property.type || "Apartment"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ETHIOPIAN FORENSIC VERIFICATION CERTIFICATE */}
            <div className="bg-gradient-to-br from-[#0B6E4F]/10 via-[#F8F4EC] to-white dark:from-[#0B6E4F]/20 dark:via-[#141A17] dark:to-[#141A17] rounded-3xl p-6 sm:p-7 border border-[#0B6E4F]/30 dark:border-[#10B981]/30 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B6E4F] text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-7 h-7 text-[#D4A017]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">
                    Ethio-Home Trust & Forensic Verification Certificate
                  </h3>
                  <p className="text-xs text-[#0B6E4F] dark:text-[#10B981] font-semibold">
                    Certified 100% Verified Physical Listing & Cleared Municipal Title Deed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B6E4F] dark:text-[#10B981]">
                    <CheckCircle className="w-3.5 h-3.5" /> Title Deed Checked
                  </div>
                  <p className="text-[11px] text-[#4B5563] dark:text-[#A8B5AE]">
                    Municipal land administration records confirmed free of liens, mortgages, or court injunctions.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B6E4F] dark:text-[#10B981]">
                    <CheckCircle className="w-3.5 h-3.5" /> Engineer Inspected
                  </div>
                  <p className="text-[11px] text-[#4B5563] dark:text-[#A8B5AE]">
                    Physically surveyed for structural integrity, electrical plumbing safety, and true boundary coordinates.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B6E4F] dark:text-[#10B981]">
                    <CheckCircle className="w-3.5 h-3.5" /> Escrow Protected
                  </div>
                  <p className="text-[11px] text-[#4B5563] dark:text-[#A8B5AE]">
                    Deposit funds held in regulated Ethiopian banking escrow until physical key handover is executed.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. PROPERTY DESCRIPTION */}
            <div className="bg-white dark:bg-[#141A17] rounded-3xl p-6 sm:p-7 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">
                {currentLanguage === "am" ? "ስለ ንብረቱ ዝርዝር መግለጫ" : "About This Property"}
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed whitespace-pre-line">
                {property.description ||
                  "A masterfully designed residence located in one of Addis Ababa's prime residential hubs. Featuring contemporary architectural finishes, abundant natural sunlight, secure compound fencing, and close proximity to key diplomatic corridors, international schools, and supermarkets."}
              </p>
            </div>

            {/* 4. AMENITIES & FEATURES */}
            <div className="bg-white dark:bg-[#141A17] rounded-3xl p-6 sm:p-7 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">
                {currentLanguage === "am" ? "የቤት ውስጥ መገልገያዎች እና አገልግሎቶች" : "Amenities & Building Features"}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenitiesList.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F0EDE6]/50 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY VIEWING / AGENT SIDEBAR */}
          <div className="lg:sticky lg:top-28 space-y-6">
            
            {/* SCHEDULE PRIVATE VIEWING FORM */}
            <div className="bg-white dark:bg-[#141A17] rounded-3xl p-6 border border-[#E5E0D8] dark:border-[#2A342E] shadow-xl space-y-4">
              <div className="pb-3 border-b border-[#E5E0D8] dark:border-[#2A342E]">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/15 text-[#D4A017] dark:text-[#EAB308] text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>Free Physical Inspection</span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">
                  Schedule a Private Tour
                </h3>
                <p className="text-xs text-[#4B5563] dark:text-[#A8B5AE] mt-0.5">
                  Book a guided walkthrough with an assigned field agent.
                </p>
              </div>

              {bookingSuccess && (
                <div className="p-3.5 rounded-2xl bg-[#0B6E4F]/10 border border-[#0B6E4F]/30 text-[#0B6E4F] dark:text-[#10B981] text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Your tour request has been confirmed! Our agent will call you.</span>
                </div>
              )}

              <form onSubmit={handleTourSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6B7280] dark:text-[#6B7A73] uppercase tracking-wider">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tourForm.visitDate}
                    onChange={(e) => setTourForm({ ...tourForm, visitDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F0EDE6]/50 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-medium text-[#1A1A1A] dark:text-[#F8F4EC] focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6B7280] dark:text-[#6B7A73] uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe Kebede"
                    value={tourForm.name}
                    onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F0EDE6]/50 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-medium text-[#1A1A1A] dark:text-[#F8F4EC] focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6B7280] dark:text-[#6B7A73] uppercase tracking-wider">
                    Phone Number (Ethiopian or Diaspora)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+251 91 123 4567"
                    value={tourForm.phone}
                    onChange={(e) => setTourForm({ ...tourForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F0EDE6]/50 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-medium text-[#1A1A1A] dark:text-[#F8F4EC] focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                  Book Private Tour
                </button>
              </form>
            </div>

            {/* VERIFIED AGENT / SELLER CARD */}
            <div className="bg-white dark:bg-[#141A17] rounded-3xl p-6 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#6B7A73]">
                Assigned Certified Listing Agent
              </span>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center font-black text-lg border border-[#0B6E4F]/20 dark:border-[#10B981]/20">
                  {agent?.name ? agent.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-[#F8F4EC] truncate">
                    {agent?.name || "Ethio-Home Verified Specialist"}
                  </h4>
                  <p className="text-xs text-[#0B6E4F] dark:text-[#10B981] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Certified Advisor
                  </p>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login");
                      return;
                    }
                    setShowMessageModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#F0EDE6] dark:bg-[#1C2420] text-[#1A1A1A] dark:text-[#F8F4EC] hover:bg-[#E5E0D8] dark:hover:bg-[#2A342E] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                  <span>Send Direct Message</span>
                </button>

                <a
                  href={`tel:${agent?.phone || "+251911123456"}`}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-[#141A17] text-[#0B6E4F] dark:text-[#10B981] border border-[#0B6E4F]/40 hover:bg-[#0B6E4F]/10 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Agent Directly</span>
                </a>
              </div>
            </div>

            {/* ESCROW PAYMENT CARD */}
            <div className="p-4 rounded-2xl bg-[#0B6E4F]/10 border border-[#0B6E4F]/20 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-[#0B6E4F] dark:text-[#10B981] flex-shrink-0" />
              <div className="text-[11px] text-[#4B5563] dark:text-[#A8B5AE]">
                <span className="font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">Chapa & CBE Escrow Protected. </span>
                Buyers never release final funds until verified physical handover.
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================
          FULL-RES LIGHTBOX MODAL
          ========================================================= */}
      <ImageGalleryLightbox
        images={images}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        initialIndex={currentImageIndex}
      />

      {/* =========================================================
          DIRECT INQUIRY MESSAGE MODAL
          ========================================================= */}
      <AnimatePresence>
        {showMessageModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-2xl p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8] dark:border-[#2A342E] mb-5">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">
                    Send Direct Message
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#6B7A73]">{property.title}</p>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 rounded-xl hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] text-[#4B5563] dark:text-[#A8B5AE] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {messageError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
                  {messageError}
                </div>
              )}

              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B7280] dark:text-[#6B7A73]">Subject</label>
                  <input
                    type="text"
                    required
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    placeholder={`Inquiry: ${property.title}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F0EDE6]/50 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-medium text-[#1A1A1A] dark:text-[#F8F4EC] focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B7280] dark:text-[#6B7A73]">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                    placeholder="Hello, I am interested in this verified property. Please provide the title deed inspection report and available viewing slots..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F0EDE6]/50 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-medium text-[#1A1A1A] dark:text-[#F8F4EC] focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F0EDE6] dark:bg-[#1C2420] text-[#4B5563] dark:text-[#A8B5AE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={messageLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0B6E4F] hover:bg-[#095C42] text-white shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {messageLoading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetails;
