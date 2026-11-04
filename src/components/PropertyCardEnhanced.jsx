import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Eye,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Premium PropertyCard adhering strictly to the Ethio-Home Luxury Design System:
 * Dark Mode: BG #0B0F0D | Card Surface #141A17 | Border #2A342E
 * Light Mode: BG #F8F4EC | Card Surface #FFFFFF | Border #E5E0D8
 * Primary: #0B6E4F (Deep Emerald) | Accent: #D4A017 (Warm Honey Gold)
 */
const PropertyCardEnhanced = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  viewMode = "grid",
  isAdmin = false,
  onStatusChange = null,
  index = 0,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Safe images array
  const imagesRaw =
    property?.imagesUrl && Array.isArray(property?.imagesUrl)
      ? property?.imagesUrl
      : property?.images && Array.isArray(property?.images)
      ? property?.images
      : [property?.image];
  const images = (imagesRaw || []).filter(Boolean);
  if (images.length === 0) {
    images.push("/hero-bg-addis.jpg");
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return "N/A";
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toLocaleString();
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(property._id || property.id);
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(idx);
  };

  // Grid View
  if (viewMode === "grid") {
    return (
      <motion.div
        className="group relative bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0B6E4F]/50 dark:hover:border-[#10B981]/50 transition-all duration-300 flex flex-col w-full h-full"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04 }}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Compact Image Container */}
        <div className="relative h-44 sm:h-48 overflow-hidden bg-[#F0EDE6] dark:bg-[#1C2420]">
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={property?.title || "Property"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {images.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => goToImage(idx, e)}
                    className={`rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-[#D4A017] w-3 h-1"
                        : "bg-white/60 w-1 h-1 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                property?.status === "for-rent" || property?.status === "rent"
                  ? "bg-[#D4A017] text-[#0F1412]"
                  : "bg-[#0B6E4F] text-white"
              }`}
            >
              {property?.status === "for-rent" || property?.status === "rent" ? "For Rent" : "For Sale"}
            </span>
            {(property?.isVerified || true) && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B6E4F] text-white shadow-sm">
                <ShieldCheck className="w-3 h-3 text-[#D4A017]" />
                Verified
              </span>
            )}
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all z-10 cursor-pointer ${
                isFavorite
                  ? "bg-red-500 text-white border-red-400"
                  : "bg-black/40 border-white/20 text-white hover:bg-black/60"
              }`}
              aria-label="Save to favorites"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}

          {/* Admin Status Controls */}
          {isAdmin && onStatusChange && (
            <div className="absolute bottom-2.5 left-2.5 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onStatusChange(property._id || property.id, "approved");
                }}
                className="w-7 h-7 rounded-full bg-[#0B6E4F] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                title="Approve"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onStatusChange(property._id || property.id, "rejected");
                }}
                className="w-7 h-7 rounded-full bg-[#C45C26] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                title="Reject"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Section - Compact & Intentionally Spaced */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
          <div className="space-y-1.5">
            {/* Price & Type */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-[#D4A017] dark:text-[#EAB308] tracking-tight">
                  ETB {formatPrice(property?.price)}
                </span>
                {(property?.status === "for-rent" || property?.status === "rent") && (
                  <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#A8B5AE]">/mo</span>
                )}
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] uppercase">
                {property?.type || "House"}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-[#F8F4EC] group-hover:text-[#0B6E4F] dark:group-hover:text-[#10B981] transition-colors line-clamp-1 leading-snug">
              <Link to={`/properties/${property?._id || property?.id}`}>
                {property?.title}
              </Link>
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-[#6B7280] dark:text-[#A8B5AE]">
              <MapPin className="w-3 h-3 text-[#D4A017] dark:text-[#EAB308] flex-shrink-0" />
              <span className="truncate">{property?.location}</span>
            </div>

            {/* Specs */}
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#4B5563] dark:text-[#A8B5AE] py-2 border-t border-b border-[#E5E0D8]/60 dark:border-[#2A342E]/60">
              {(property?.bedrooms || property?.features?.bedrooms) && (
                <div className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                  <span>{property?.bedrooms || property?.features?.bedrooms} Bed</span>
                </div>
              )}
              {(property?.bathrooms || property?.features?.bathrooms) && (
                <div className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                  <span>{property?.bathrooms || property?.features?.bathrooms} Bath</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Square className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                <span>{property?.features?.area || property?.area || "N/A"} m²</span>
              </div>
            </div>
          </div>

          {/* View Details CTA Button */}
          <div className="pt-1">
            <Link
              to={`/properties/${property?._id || property?.id}`}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] text-white font-bold text-xs shadow-sm hover:shadow-[0_0_15px_rgba(212,160,23,0.3)] transition-all cursor-pointer active:scale-[0.98]"
            >
              <Eye className="w-3 h-3" />
              View Details
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // List View
  return (
    <motion.div
      className="group relative bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0B6E4F]/50 dark:hover:border-[#10B981]/50 transition-all duration-300 w-full"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr] gap-0">
        {/* Image Section */}
        <div className="relative h-44 sm:h-full min-h-[180px] overflow-hidden bg-[#F0EDE6] dark:bg-[#1C2420]">
          <img
            src={images[currentImageIndex]}
            alt={property?.title || "Property"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                property?.status === "for-rent" || property?.status === "rent"
                  ? "bg-[#D4A017] text-[#0F1412]"
                  : "bg-[#0B6E4F] text-white"
              }`}
            >
              {property?.status === "for-rent" || property?.status === "rent" ? "For Rent" : "For Sale"}
            </span>
            {(property?.isVerified || true) && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B6E4F] text-white shadow-sm">
                <ShieldCheck className="w-3 h-3 text-[#D4A017]" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-[#D4A017] dark:text-[#EAB308] tracking-tight">
                  ETB {formatPrice(property?.price)}
                </span>
                {(property?.status === "for-rent" || property?.status === "rent") && (
                  <span className="text-xs font-semibold text-[#6B7280] dark:text-[#A8B5AE]">/mo</span>
                )}
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] uppercase">
                {property?.type || "House"}
              </span>
            </div>

            <h3 className="font-bold text-base text-[#1A1A1A] dark:text-[#F8F4EC] group-hover:text-[#0B6E4F] dark:group-hover:text-[#10B981] transition-colors line-clamp-1">
              <Link to={`/properties/${property?._id || property?.id}`}>
                {property?.title}
              </Link>
            </h3>

            <div className="flex items-center gap-1 text-xs text-[#6B7280] dark:text-[#A8B5AE]">
              <MapPin className="w-3 h-3 text-[#D4A017] dark:text-[#EAB308] flex-shrink-0" />
              <span>{property?.location}</span>
            </div>

            <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#A8B5AE] line-clamp-2 leading-relaxed">
              {property?.description}
            </p>

            <div className="flex items-center gap-3 text-xs font-semibold text-[#4B5563] dark:text-[#A8B5AE] pt-2 border-t border-[#E5E0D8]/60 dark:border-[#2A342E]/60">
              {(property?.bedrooms || property?.features?.bedrooms) && (
                <div className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                  <span>{property?.bedrooms || property?.features?.bedrooms} Beds</span>
                </div>
              )}
              {(property?.bathrooms || property?.features?.bathrooms) && (
                <div className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                  <span>{property?.bathrooms || property?.features?.bathrooms} Baths</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Square className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                <span>{property?.features?.area || property?.area || "N/A"} m²</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to={`/properties/${property?._id || property?.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] text-white font-bold text-xs shadow-sm hover:shadow-[0_0_15px_rgba(212,160,23,0.3)] transition-all cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              View Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCardEnhanced;