import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Eye,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Check,
  X,
  Settings,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PropertyCard = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  viewMode = "grid",
  isAdmin = false,
  onStatusChange = null,
  onImageManage = null,
  canManageImages = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Handle multiple images
  const imagesRaw =
    property.imagesUrl && Array.isArray(property.imagesUrl)
      ? property.imagesUrl
      : property.images && Array.isArray(property.images)
      ? property.images
      : [property.image];
  const images = (imagesRaw || []).filter(Boolean);
  if (images.length === 0) {
    images.push("/vite.svg");
  }

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    onToggleFavorite(property._id);
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

  const goToImage = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleApprove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(property._id, "approved");
    }
  };

  const handleReject = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(property._id, "rejected");
    }
  };

  // List View
  if (viewMode === "list") {
    return (
      <motion.div 
        className="group relative bg-card/95 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-luxury transition-all duration-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.01 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0">
          {/* Image Section */}
          <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden">
            <motion.img
              src={images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            />
            
            {/* Image Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <motion.button 
                  onClick={prevImage} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button 
                  onClick={nextImage} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                {/* Image Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => goToImage(index, e)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? "bg-gold-400 w-6 shadow-glow-gold" 
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                property.status === 'approved' 
                  ? 'bg-ethiopian-green/90 text-white border-ethiopian-green/50' 
                  : property.status === 'pending'
                  ? 'bg-ethiopian-yellow/90 text-foreground border-ethiopian-yellow/50'
                  : 'bg-background/80 text-foreground border-border/50'
              }`}>
                {property.status || "Unknown"}
              </span>
              {property.isVerified && (
                <span className="verified-badge-premium">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                onClick={handleFavoriteClick}
                className={`favorite-btn-premium absolute top-4 right-4 ${isFavorite ? 'active' : ''}`}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
              </button>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="property-price-luxury text-2xl">
                  ETB {formatPrice(property.price)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary border border-border text-muted-foreground">
                  {property.type}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                <Link to={`/properties/${property._id || property.id}`}>
                  {property.title}
                </Link>
              </h3>

              {/* Location */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>{property.location}</span>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3">
                {(property.bedrooms || property.features?.bedrooms) && (
                  <div className="feature-badge-luxury">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms || property.features?.bedrooms} Beds</span>
                  </div>
                )}
                {(property.bathrooms || property.features?.bathrooms) && (
                  <div className="feature-badge-luxury">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms || property.features?.bathrooms} Baths</span>
                  </div>
                )}
                <div className="feature-badge-luxury">
                  <Square className="w-4 h-4" />
                  <span>{property.features?.area || property.area || "N/A"}m²</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground line-clamp-2">{property.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <Link
                to={`/properties/${property._id || property.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-luxury text-primary-foreground font-semibold hover:shadow-glow-gold transition-all duration-300 hover:-translate-y-0.5"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View (Default) - Compact card for 3-per-row layout
  return (
    <motion.div 
      className="group bg-card/95 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-luxury transition-all duration-500 h-full flex flex-col w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image Container - Optimized aspect ratio for 3-per-row */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <motion.img
          src={images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        />
        
        {/* Image Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <motion.button 
              onClick={prevImage} 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button 
              onClick={nextImage} 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>

            {/* Image Counter */}
            <motion.div 
              className="absolute top-4 right-14 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-xs font-medium text-foreground flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
            >
              <ImageIcon className="w-3 h-3" />
              {currentImageIndex + 1}/{images.length}
            </motion.div>

            {/* Image Dots */}
            <motion.div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            >
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? "bg-gold-400 w-5 shadow-glow-gold" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </motion.div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
            property.status === 'approved' 
              ? 'bg-ethiopian-green/90 text-white border-ethiopian-green/50' 
              : property.status === 'pending'
              ? 'bg-ethiopian-yellow/90 text-foreground border-ethiopian-yellow/50'
              : 'bg-background/80 text-foreground border-border/50'
          }`}>
            {property.status || "Unknown"}
          </span>
          {property.isVerified && (
            <span className="verified-badge-premium">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={`favorite-btn-premium absolute top-4 right-4 ${isFavorite ? 'active' : ''}`}
          >
            <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}

        {/* Admin Actions */}
        {isAdmin && onStatusChange && (
          <motion.div 
            className="absolute bottom-4 left-4 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          >
            <button
              onClick={handleApprove}
              className="w-9 h-9 rounded-full bg-ethiopian-green/90 backdrop-blur-sm border border-ethiopian-green/50 flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleReject}
              className="w-9 h-9 rounded-full bg-ethiopian-red/90 backdrop-blur-sm border border-ethiopian-red/50 flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Content - Optimized for compact card */}
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        {/* Price & Type */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
            ETB {formatPrice(property.price)}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-secondary/80 border border-border/50 text-muted-foreground uppercase tracking-wide">
            {property.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-foreground group-hover:text-gold-400 transition-colors line-clamp-1 leading-tight">
          <Link to={`/properties/${property._id || property.id}`}>
            {property.title}
          </Link>
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Features - Enhanced layout */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground py-2 border-t border-b border-border/30">
          {(property.bedrooms || property.features?.bedrooms) && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-gold-400/70" />
              <span className="font-medium">{property.bedrooms || property.features?.bedrooms}</span>
            </div>
          )}
          {(property.bathrooms || property.features?.bathrooms) && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-gold-400/70" />
              <span className="font-medium">{property.bathrooms || property.features?.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4 text-gold-400/70" />
            <span className="font-medium">{property.features?.area || property.area || "N/A"}m²</span>
          </div>
        </div>

        {/* Description - Hidden on smaller cards */}
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
          {property.description || "Beautiful property awaiting your discovery."}
        </p>

        {/* Action Button - Premium styling */}
        <Link
          to={`/properties/${property._id || property.id}`}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 text-gray-900 font-bold text-sm hover:shadow-glow-gold transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
        >
          <Eye className="w-4 h-4" />
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
