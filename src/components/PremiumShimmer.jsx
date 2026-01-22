import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium Shimmer Loading System
 * Ultra-modern loading skeletons with beautiful shimmer effects
 */

// Base shimmer animation styles
const shimmerKeyframes = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
};

const shimmerTransition = {
  duration: 1.5,
  ease: 'easeInOut',
  repeat: Infinity,
  repeatDelay: 0.5,
};

// Shimmer overlay component
const ShimmerOverlay = () => (
  <motion.div
    className="absolute inset-0 -translate-x-full"
    style={{
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), rgba(255,255,255,0.15), rgba(255,255,255,0.08), transparent)',
    }}
    initial={shimmerKeyframes.initial}
    animate={shimmerKeyframes.animate}
    transition={shimmerTransition}
  />
);

// Premium shimmer box component
export const ShimmerBox = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full',
  rounded = 'rounded-lg',
  ...props 
}) => (
  <div 
    className={`relative overflow-hidden bg-muted/50 ${height} ${width} ${rounded} ${className}`}
    {...props}
  >
    <ShimmerOverlay />
  </div>
);

// Shimmer circle for avatars
export const ShimmerCircle = ({ size = 'w-12 h-12', className = '' }) => (
  <div className={`relative overflow-hidden bg-muted/50 rounded-full ${size} ${className}`}>
    <ShimmerOverlay />
  </div>
);

// Property Card Skeleton with premium shimmer
export const PropertyCardShimmer = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        className="relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
          {/* Image skeleton */}
          <div className="relative aspect-[16/10] lg:aspect-auto lg:h-64 overflow-hidden bg-gradient-to-br from-muted/60 to-muted/30">
            <ShimmerOverlay />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <ShimmerBox width="w-20" height="h-6" rounded="rounded-full" />
              <ShimmerBox width="w-16" height="h-6" rounded="rounded-full" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShimmerBox width="w-32" height="h-8" />
              <ShimmerBox width="w-20" height="h-6" rounded="rounded-full" />
            </div>
            <ShimmerBox width="w-3/4" height="h-7" />
            <ShimmerBox width="w-1/2" height="h-5" />
            <div className="flex gap-3">
              <ShimmerBox width="w-24" height="h-8" />
              <ShimmerBox width="w-24" height="h-8" />
              <ShimmerBox width="w-24" height="h-8" />
            </div>
            <div className="space-y-2">
              <ShimmerBox width="w-full" height="h-4" />
              <ShimmerBox width="w-2/3" height="h-4" />
            </div>
            <ShimmerBox width="w-40" height="h-12" rounded="rounded-xl" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view skeleton
  return (
    <motion.div
      className="relative overflow-hidden bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl shadow-lg h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image skeleton */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted/60 to-muted/30">
        <ShimmerOverlay />
        {/* Badge placeholder */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <ShimmerBox width="w-20" height="h-6" rounded="rounded-full" />
        </div>
        {/* Favorite button placeholder */}
        <div className="absolute top-4 right-4">
          <ShimmerCircle size="w-10 h-10" />
        </div>
        {/* Dots placeholder */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <ShimmerCircle size="w-2 h-2" />
          <ShimmerBox width="w-5" height="h-2" rounded="rounded-full" />
          <ShimmerCircle size="w-2 h-2" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <ShimmerBox width="w-28" height="h-7" />
          <ShimmerBox width="w-20" height="h-6" rounded="rounded-full" />
        </div>
        <ShimmerBox width="w-4/5" height="h-6" />
        <div className="flex items-center gap-2">
          <ShimmerCircle size="w-4 h-4" />
          <ShimmerBox width="w-2/3" height="h-4" />
        </div>
        <div className="flex items-center gap-4 py-2 border-t border-b border-border/20">
          <div className="flex items-center gap-1.5">
            <ShimmerCircle size="w-4 h-4" />
            <ShimmerBox width="w-6" height="h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <ShimmerCircle size="w-4 h-4" />
            <ShimmerBox width="w-6" height="h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <ShimmerCircle size="w-4 h-4" />
            <ShimmerBox width="w-12" height="h-4" />
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <ShimmerBox width="w-full" height="h-3" />
          <ShimmerBox width="w-4/5" height="h-3" />
        </div>
        <ShimmerBox width="w-full" height="h-12" rounded="rounded-xl" />
      </div>
    </motion.div>
  );
};

// Grid of property card skeletons
export const PropertyGridShimmer = ({ count = 6, viewMode = 'grid' }) => (
  <div className={viewMode === 'grid' 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
    : "space-y-6"
  }>
    {Array.from({ length: count }).map((_, index) => (
      <PropertyCardShimmer key={index} viewMode={viewMode} />
    ))}
  </div>
);

// Hero section skeleton
export const HeroShimmer = () => (
  <div className="relative min-h-[95vh] overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/60">
    <div className="absolute inset-0">
      <ShimmerOverlay />
    </div>
    <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-20">
      <ShimmerBox width="w-32" height="h-1.5" rounded="rounded-full" className="mb-10" />
      <ShimmerBox width="w-3/4 max-w-4xl" height="h-16 md:h-20" className="mb-8" />
      <ShimmerBox width="w-2/3 max-w-2xl" height="h-8" className="mb-12" />
      <div className="flex gap-4 mb-12">
        <ShimmerCircle size="w-4 h-4" />
        <ShimmerBox width="w-14" height="h-2.5" rounded="rounded-full" />
        <ShimmerCircle size="w-4 h-4" />
      </div>
      <div className="w-full max-w-5xl">
        <ShimmerBox width="w-full" height="h-48" rounded="rounded-3xl" />
      </div>
    </div>
  </div>
);

// Stats section skeleton
export const StatsShimmer = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        className="relative overflow-hidden bg-card/80 rounded-2xl border border-border/40 p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <ShimmerOverlay />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <ShimmerCircle size="w-20 h-20" />
          <ShimmerBox width="w-24" height="h-10" />
          <ShimmerBox width="w-32" height="h-4" />
        </div>
      </motion.div>
    ))}
  </div>
);

// Section header skeleton
export const SectionHeaderShimmer = () => (
  <div className="flex flex-col items-center gap-4 mb-12">
    <ShimmerBox width="w-16" height="h-1" rounded="rounded-full" />
    <ShimmerBox width="w-64" height="h-12" />
    <ShimmerBox width="w-96 max-w-full" height="h-6" />
  </div>
);

// Feature card skeleton
export const FeatureCardShimmer = () => (
  <motion.div
    className="relative overflow-hidden bg-card/80 rounded-2xl border border-border/40 p-6"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
  >
    <ShimmerOverlay />
    <div className="relative z-10 space-y-4">
      <ShimmerCircle size="w-14 h-14" />
      <ShimmerBox width="w-3/4" height="h-6" />
      <div className="space-y-2">
        <ShimmerBox width="w-full" height="h-4" />
        <ShimmerBox width="w-5/6" height="h-4" />
      </div>
    </div>
  </motion.div>
);

// Testimonial card skeleton
export const TestimonialCardShimmer = () => (
  <motion.div
    className="relative overflow-hidden bg-card/80 rounded-2xl border border-border/40 p-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <ShimmerOverlay />
    <div className="relative z-10 space-y-4">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <ShimmerCircle key={i} size="w-5 h-5" />
        ))}
      </div>
      <div className="space-y-2">
        <ShimmerBox width="w-full" height="h-4" />
        <ShimmerBox width="w-full" height="h-4" />
        <ShimmerBox width="w-2/3" height="h-4" />
      </div>
      <div className="flex items-center gap-3 pt-4">
        <ShimmerCircle size="w-12 h-12" />
        <div className="space-y-2">
          <ShimmerBox width="w-24" height="h-4" />
          <ShimmerBox width="w-32" height="h-3" />
        </div>
      </div>
    </div>
  </motion.div>
);

export default {
  ShimmerBox,
  ShimmerCircle,
  PropertyCardShimmer,
  PropertyGridShimmer,
  HeroShimmer,
  StatsShimmer,
  SectionHeaderShimmer,
  FeatureCardShimmer,
  TestimonialCardShimmer,
};
