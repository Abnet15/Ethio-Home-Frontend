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
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced PropertyCard with premium gradient styling
 * Matches the circular gradient background design from reference images
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
    e.stopPropagation();
    onToggleFavorite?.(property._id);
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

  // Gradient colors based on property type
  const getGradientColors = () => {
    const gradients = {
      house: { from: 'from-gold-400/30', via: 'via-gold-500/20', to: 'to-amber-600/10' },
      apartment: { from: 'from-blue-400/30', via: 'via-indigo-500/20', to: 'to-purple-600/10' },
      villa: { from: 'from-emerald-400/30', via: 'via-green-500/20', to: 'to-teal-600/10' },
      commercial: { from: 'from-rose-400/30', via: 'via-pink-500/20', to: 'to-red-600/10' },
      default: { from: 'from-gold-400/30', via: 'via-gold-500/20', to: 'to-amber-600/10' },
    };
    return gradients[property.type?.toLowerCase()] || gradients.default;
  };

  const gradient = getGradientColors();

  // Grid View
  if (viewMode === "grid") {
    return (
      <motion.div
        className="group relative h-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Circular Gradient Background - Like reference images */}
        <div className="absolute -inset-4 rounded-3xl overflow-hidden pointer-events-none">
          <motion.div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-gradient-radial ${gradient.from} ${gradient.via} ${gradient.to}`}
            style={{
              background: `radial-gradient(circle at center, hsl(var(--gold-400) / 0.15) 0%, hsl(var(--gold-500) / 0.08) 40%, transparent 70%)`,
            }}
            animate={{
              scale: isHovered ? 1.15 : 1,
              opacity: isHovered ? 1 : 0.7,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Card Container */}
        <motion.div
          className="relative bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden shadow-xl h-full flex flex-col"
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            boxShadow: '0 25px 50px -12px hsl(var(--gold-400) / 0.2), 0 0 0 1px hsl(var(--gold-400) / 0.1)',
          }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: isHovered ? 1.08 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Premium Glow Border on Hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                boxShadow: isHovered 
                  ? 'inset 0 0 30px hsl(var(--gold-400) / 0.3)' 
                  : 'inset 0 0 0px transparent',
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <motion.button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>

                {/* Image Counter */}
                <motion.div
                  className="absolute top-4 right-14 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-white/20 text-xs font-medium text-foreground flex items-center gap-1"
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
                  animate={{ opacity: isHovered ? 1 : 0.7, y: isHovered ? 0 : 5 }}
                >
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => goToImage(idx, e)}
                      className={`rounded-full transition-all duration-300 ${
                        idx === currentImageIndex
                          ? "bg-gold-400 w-5 h-2 shadow-[0_0_10px_hsl(var(--gold-400))]"
                          : "bg-white/50 w-2 h-2 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </motion.div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <motion.span
                className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${
                  property.status === "approved"
                    ? "bg-emerald-500/90 text-white border-emerald-400/50"
                    : property.status === "pending"
                    ? "bg-amber-500/90 text-white border-amber-400/50"
                    : "bg-background/80 text-foreground border-white/30"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {property.status || "Unknown"}
              </motion.span>
              {property.isVerified && (
                <motion.span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-gold-400 to-gold-500 text-gray-900 border border-gold-300/50 shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </motion.span>
              )}
              {property.featured && (
                <motion.span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-400/50 shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Sparkles className="w-3 h-3" />
                  Featured
                </motion.span>
              )}
            </div>

            {/* Favorite Button */}
            {onToggleFavorite && (
              <motion.button
                onClick={handleFavoriteClick}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 ${
                  isFavorite
                    ? "bg-red-500 text-white border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    : "bg-background/80 text-foreground border-white/30 hover:bg-red-500/20 hover:border-red-400/50"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
              </motion.button>
            )}

            {/* Admin Actions */}
            {isAdmin && onStatusChange && (
              <motion.div
                className="absolute bottom-4 left-4 flex gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onStatusChange(property._id, "approved");
                  }}
                  className="w-9 h-9 rounded-full bg-emerald-500/90 backdrop-blur-sm border border-emerald-400/50 flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onStatusChange(property._id, "rejected");
                  }}
                  className="w-9 h-9 rounded-full bg-red-500/90 backdrop-blur-sm border border-red-400/50 flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 space-y-3 flex-1 flex flex-col">
            {/* Price & Type */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 bg-clip-text text-transparent">
                ETB {formatPrice(property.price)}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-secondary/80 border border-border/50 text-muted-foreground uppercase tracking-wide">
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

            {/* Features */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground py-3 border-t border-b border-border/30">
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

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
              {property.description || "Beautiful property awaiting your discovery."}
            </p>

            {/* Action Button */}
            <Link
              to={`/properties/${property._id || property.id}`}
              className="mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 group/btn overflow-hidden relative"
            >
              {/* Button gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500" />
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                animate={{ x: isHovered ? '200%' : '-100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // List View
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Circular Gradient Background */}
      <div className="absolute -inset-4 rounded-3xl overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[150%] rounded-full"
          style={{
            background: `radial-gradient(circle at center, hsl(var(--gold-400) / 0.12) 0%, hsl(var(--gold-500) / 0.06) 50%, transparent 70%)`,
          }}
          animate={{
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 1 : 0.6,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Card Container */}
      <motion.div
        className="relative bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden shadow-xl"
        whileHover={{ 
          y: -6, 
          scale: 1.01,
          boxShadow: '0 25px 50px -12px hsl(var(--gold-400) / 0.15)',
        }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0">
          {/* Image Section */}
          <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden">
            <motion.img
              src={images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Navigation & badges similar to grid view */}
            {images.length > 1 && (
              <>
                <motion.button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border ${
                  property.status === "approved"
                    ? "bg-emerald-500/90 text-white border-emerald-400/50"
                    : "bg-background/80 text-foreground border-white/30"
                }`}
              >
                {property.status || "Unknown"}
              </span>
              {property.isVerified && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-gold-400 to-gold-500 text-gray-900">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {onToggleFavorite && (
              <motion.button
                onClick={handleFavoriteClick}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center ${
                  isFavorite
                    ? "bg-red-500 text-white border-red-400/50"
                    : "bg-background/80 text-foreground border-white/30"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
              </motion.button>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
                  ETB {formatPrice(property.price)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary border border-border">
                  {property.type}
                </span>
              </div>

              <h3 className="font-bold text-xl text-foreground group-hover:text-gold-400 transition-colors">
                <Link to={`/properties/${property._id || property.id}`}>
                  {property.title}
                </Link>
              </h3>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>{property.location}</span>
              </div>

              <div className="flex flex-wrap gap-4">
                {(property.bedrooms || property.features?.bedrooms) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                    <Bed className="w-4 h-4 text-gold-400" />
                    <span className="text-sm font-medium">{property.bedrooms || property.features?.bedrooms} Beds</span>
                  </div>
                )}
                {(property.bathrooms || property.features?.bathrooms) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                    <Bath className="w-4 h-4 text-gold-400" />
                    <span className="text-sm font-medium">{property.bathrooms || property.features?.bathrooms} Baths</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                  <Square className="w-4 h-4 text-gold-400" />
                  <span className="text-sm font-medium">{property.features?.area || property.area || "N/A"}m²</span>
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-2">{property.description}</p>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Link
                to={`/properties/${property._id || property.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 text-gray-900 font-bold hover:shadow-[0_0_30px_hsl(var(--gold-400)/0.4)] transition-all duration-300"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PropertyCardEnhanced;
