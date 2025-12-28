import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium Shimmer Skeleton for Property Cards
 * Luxurious loading state with smooth animations
 */
export const PropertyCardSkeleton = ({ viewMode = 'grid' }) => {
  const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

  if (viewMode === 'list') {
    return (
      <motion.div 
        className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0">
          {/* Image Skeleton */}
          <div className={`relative aspect-[16/10] lg:aspect-auto lg:h-64 bg-muted ${shimmerClass}`}>
            <div className="absolute bottom-4 left-4 flex gap-2">
              <div className={`w-20 h-6 rounded-full bg-muted-foreground/20 ${shimmerClass}`} />
              <div className={`w-16 h-6 rounded-full bg-muted-foreground/20 ${shimmerClass}`} />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-32 rounded-lg bg-gold-400/20 ${shimmerClass}`} />
              <div className={`h-6 w-20 rounded-full bg-muted-foreground/20 ${shimmerClass}`} />
            </div>
            <div className={`h-7 w-3/4 rounded-lg bg-muted-foreground/20 ${shimmerClass}`} />
            <div className={`h-5 w-1/2 rounded-lg bg-muted-foreground/20 ${shimmerClass}`} />
            <div className="flex gap-3">
              <div className={`h-8 w-24 rounded-lg bg-muted-foreground/20 ${shimmerClass}`} />
              <div className={`h-8 w-24 rounded-lg bg-muted-foreground/20 ${shimmerClass}`} />
              <div className={`h-8 w-24 rounded-lg bg-muted-foreground/20 ${shimmerClass}`} />
            </div>
            <div className="space-y-2">
              <div className={`h-4 w-full rounded bg-muted-foreground/15 ${shimmerClass}`} />
              <div className={`h-4 w-2/3 rounded bg-muted-foreground/15 ${shimmerClass}`} />
            </div>
            <div className={`h-12 w-40 rounded-xl bg-gradient-to-r from-gold-400/30 to-gold-500/20 ${shimmerClass}`} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View Skeleton
  return (
    <motion.div 
      className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden shadow-lg h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Image Container Skeleton */}
      <div className={`relative aspect-[16/10] bg-muted ${shimmerClass}`}>
        {/* Badge placeholders */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className={`w-20 h-6 rounded-full bg-muted-foreground/20 ${shimmerClass}`} />
        </div>
        
        {/* Favorite button placeholder */}
        <div className="absolute top-4 right-4">
          <div className={`w-10 h-10 rounded-full bg-muted-foreground/20 ${shimmerClass}`} />
        </div>
        
        {/* Image dots placeholder */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <div className={`w-2 h-2 rounded-full bg-white/30 ${shimmerClass}`} />
          <div className={`w-5 h-2 rounded-full bg-gold-400/50 ${shimmerClass}`} />
          <div className={`w-2 h-2 rounded-full bg-white/30 ${shimmerClass}`} />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        {/* Price & Type */}
        <div className="flex items-center justify-between gap-2">
          <div className={`h-7 w-28 rounded-lg bg-gold-400/20 ${shimmerClass}`} />
          <div className={`h-6 w-20 rounded-full bg-muted-foreground/20 ${shimmerClass}`} />
        </div>

        {/* Title */}
        <div className={`h-6 w-4/5 rounded-lg bg-muted-foreground/20 ${shimmerClass}`} />

        {/* Location */}
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded bg-gold-400/30 ${shimmerClass}`} />
          <div className={`h-4 w-2/3 rounded bg-muted-foreground/20 ${shimmerClass}`} />
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 py-2 border-t border-b border-border/30">
          <div className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded bg-gold-400/20 ${shimmerClass}`} />
            <div className={`w-6 h-4 rounded bg-muted-foreground/20 ${shimmerClass}`} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded bg-gold-400/20 ${shimmerClass}`} />
            <div className={`w-6 h-4 rounded bg-muted-foreground/20 ${shimmerClass}`} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded bg-gold-400/20 ${shimmerClass}`} />
            <div className={`w-12 h-4 rounded bg-muted-foreground/20 ${shimmerClass}`} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 flex-1">
          <div className={`h-3 w-full rounded bg-muted-foreground/15 ${shimmerClass}`} />
          <div className={`h-3 w-4/5 rounded bg-muted-foreground/15 ${shimmerClass}`} />
        </div>

        {/* Action Button */}
        <div className={`mt-auto h-12 w-full rounded-xl bg-gradient-to-r from-gold-400/30 to-gold-500/20 ${shimmerClass}`} />
      </div>
    </motion.div>
  );
};

/**
 * Grid of skeleton cards for loading states
 */
export const PropertySkeletonGrid = ({ count = 6, viewMode = 'grid' }) => {
  return (
    <div className={viewMode === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
      : "space-y-6"
    }>
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default PropertyCardSkeleton;
