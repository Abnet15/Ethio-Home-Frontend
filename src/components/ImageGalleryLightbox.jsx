import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Maximize2,
  Grid3X3
} from 'lucide-react';

/**
 * Premium Image Gallery Lightbox
 * Features: Zoom, swipe gestures, keyboard navigation, thumbnails
 */
const ImageGalleryLightbox = ({ 
  images = [], 
  isOpen, 
  onClose, 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, currentIndex]);

  const goToNext = useCallback(() => {
    setScale(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setScale(1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleDragStart = (e) => {
    setDragStart(e.clientX || e.touches?.[0]?.clientX);
  };

  const handleDragEnd = (e) => {
    if (!dragStart) return;
    const endX = e.clientX || e.changedTouches?.[0]?.clientX;
    const diff = endX - dragStart;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
    setDragStart(null);
  };

  const handleDownload = async () => {
    const imageUrl = images[currentIndex];
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `property-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col"
      >
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Top Controls */}
        <motion.div 
          className="relative z-10 flex items-center justify-between p-4 md:p-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white font-semibold text-sm border border-white/20">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 border border-white/20 hover:scale-105"
              disabled={scale <= 0.5}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 text-white/80 text-sm font-medium min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 border border-white/20 hover:scale-105"
              disabled={scale >= 3}
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-white/20 mx-2" />

            {/* Thumbnails Toggle */}
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-3 rounded-xl backdrop-blur-sm text-white transition-all duration-300 border hover:scale-105 ${
                showThumbnails 
                  ? 'bg-gold-400/30 border-gold-400/50' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 border border-white/20 hover:scale-105"
            >
              <Download className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-white/20 mx-2" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-white/10 hover:bg-ethiopian-red/80 backdrop-blur-sm text-white transition-all duration-300 border border-white/20 hover:border-ethiopian-red/50 hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Main Image Area */}
        <div 
          className="relative flex-1 flex items-center justify-center px-4 md:px-16 overflow-hidden"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          {/* Previous Button */}
          {images.length > 1 && (
            <motion.button
              onClick={goToPrevious}
              className="absolute left-4 md:left-8 z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 border border-white/20 hover:scale-110 group"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </motion.button>
          )}

          {/* Image */}
          <motion.div
            key={currentIndex}
            className="relative max-w-full max-h-full cursor-grab active:cursor-grabbing select-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            drag={scale === 1}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
          >
            <motion.img
              src={images[currentIndex]}
              alt={`Property image ${currentIndex + 1}`}
              className="max-w-[90vw] max-h-[70vh] object-contain rounded-lg shadow-2xl"
              style={{ scale }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onDoubleClick={() => setScale(scale === 1 ? 2 : 1)}
            />
          </motion.div>

          {/* Next Button */}
          {images.length > 1 && (
            <motion.button
              onClick={goToNext}
              className="absolute right-4 md:right-8 z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 border border-white/20 hover:scale-110 group"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          )}
        </div>

        {/* Thumbnails */}
        <AnimatePresence>
          {showThumbnails && images.length > 1 && (
            <motion.div 
              className="relative z-10 p-4 md:p-6"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex gap-3 justify-center overflow-x-auto pb-2 scrollbar-luxury max-w-full">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setScale(1);
                    }}
                    className={`flex-shrink-0 relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden transition-all duration-300 ${
                      index === currentIndex 
                        ? 'ring-3 ring-gold-400 ring-offset-2 ring-offset-black scale-105 shadow-glow-gold' 
                        : 'ring-2 ring-white/20 hover:ring-white/40 opacity-70 hover:opacity-100'
                    }`}
                    whileHover={{ scale: index === currentIndex ? 1.05 : 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === currentIndex && (
                      <motion.div 
                        className="absolute inset-0 bg-gold-400/20"
                        layoutId="thumbnailHighlight"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe Hint (Mobile) */}
        <motion.div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden text-white/50 text-xs flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Swipe to navigate</span>
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageGalleryLightbox;
