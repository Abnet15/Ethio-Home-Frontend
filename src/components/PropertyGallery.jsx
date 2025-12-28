import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Minimize2,
  Download,
  RotateCw
} from "lucide-react";

const PropertyGallery = ({ 
  images = [], 
  currentIndex = 0, 
  isOpen = false, 
  onClose, 
  onIndexChange,
  propertyTitle = "Property"
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const goToNext = useCallback(() => {
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    setZoom(1);
    setRotation(0);
    setDragOffset({ x: 0, y: 0 });
    onIndexChange?.(newIndex);
  }, [activeIndex, images.length, onIndexChange]);

  const goToPrev = useCallback(() => {
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    setZoom(1);
    setRotation(0);
    setDragOffset({ x: 0, y: 0 });
    onIndexChange?.(newIndex);
  }, [activeIndex, images.length, onIndexChange]);

  const goToImage = (index) => {
    setActiveIndex(index);
    setZoom(1);
    setRotation(0);
    setDragOffset({ x: 0, y: 0 });
    onIndexChange?.(index);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          onClose?.();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "ArrowLeft":
          goToPrev();
          break;
        case "+":
        case "=":
          setZoom((prev) => Math.min(prev + 0.5, 4));
          break;
        case "-":
          setZoom((prev) => Math.max(prev - 0.5, 0.5));
          break;
        case "r":
        case "R":
          setRotation((prev) => (prev + 90) % 360);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToNext, goToPrev, onClose]);

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    if (zoom > 1) return; // Disable swipe when zoomed
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    if (zoom > 1) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || zoom > 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 4));
    }
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.log("Fullscreen not supported");
    }
  };

  // Zoom controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 4));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 0.5));
  const resetZoom = () => {
    setZoom(1);
    setRotation(0);
    setDragOffset({ x: 0, y: 0 });
  };
  const rotate = () => setRotation((prev) => (prev + 90) % 360);

  // Download image
  const downloadImage = async () => {
    try {
      const response = await fetch(images[activeIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${propertyTitle}-image-${activeIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.log("Download failed");
    }
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onWheel={handleWheel}
      >
        {/* Premium backdrop with blur */}
        <motion.div 
          className="absolute inset-0 bg-black/98 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
        />
        
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, hsl(48 96% 53% / 0.4) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, hsl(145 63% 32% / 0.4) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        {/* Header Controls */}
        <motion.div 
          className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 md:p-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <span className="text-white font-semibold">
                {activeIndex + 1} / {images.length}
              </span>
            </div>
            <span className="hidden md:block text-white/70 text-sm truncate max-w-[300px] font-medium">
              {propertyTitle}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <button
                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                className="p-2.5 rounded-lg hover:bg-white/20 text-white transition-all duration-200"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                className="px-3 py-2 rounded-lg hover:bg-white/20 text-white text-sm font-semibold transition-all duration-200 min-w-[70px]"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                className="p-2.5 rounded-lg hover:bg-white/20 text-white transition-all duration-200"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* Rotate Button */}
            <button
              onClick={(e) => { e.stopPropagation(); rotate(); }}
              className="hidden md:flex p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/20 backdrop-blur-md"
              title="Rotate (R)"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Download Button */}
            <button
              onClick={(e) => { e.stopPropagation(); downloadImage(); }}
              className="hidden md:flex p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/20 backdrop-blur-md"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="hidden md:flex p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/20 backdrop-blur-md"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose?.(); }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white transition-all duration-200 border border-red-400/30 backdrop-blur-md ml-2 shadow-lg"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Main Image Area */}
        <div
          className="absolute inset-0 flex items-center justify-center p-4 md:p-20 pt-24 pb-36"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              className="relative max-w-full max-h-full flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.img
                ref={imageRef}
                src={images[activeIndex]}
                alt={`${propertyTitle} - Image ${activeIndex + 1}`}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing select-none"
                style={{ 
                  transform: `scale(${zoom}) rotate(${rotation}deg) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                  transformOrigin: 'center center',
                }}
                draggable={false}
                onDoubleClick={() => setZoom(zoom === 1 ? 2 : 1)}
              />
              
              {/* Image glow effect */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: '0 0 100px 20px hsl(48 96% 53% / 0.1)',
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <motion.button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-4 md:p-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 border border-white/20 backdrop-blur-xl group shadow-xl"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-4 md:p-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 border border-white/20 backdrop-blur-xl group shadow-xl"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </>
        )}

        {/* Premium Thumbnail Strip */}
        {images.length > 1 && (
          <motion.div 
            className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="flex items-center justify-center gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((img, index) => (
                    <motion.button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); goToImage(index); }}
                      className={`relative flex-shrink-0 w-16 h-12 md:w-24 md:h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                        index === activeIndex
                          ? "ring-2 ring-gold-400 ring-offset-2 ring-offset-black/50 scale-105"
                          : "opacity-60 hover:opacity-90"
                      }`}
                      whileHover={{ scale: index === activeIndex ? 1.05 : 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === activeIndex && (
                        <motion.div
                          className="absolute inset-0 bg-gold-400/20 border-2 border-gold-400 rounded-xl"
                          layoutId="activeThumbnail"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile Controls */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 md:hidden z-20">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <button
              onClick={(e) => { e.stopPropagation(); zoomOut(); }}
              className="p-2 rounded-lg hover:bg-white/20 text-white"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white text-sm font-medium min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); zoomIn(); }}
              className="p-2 rounded-lg hover:bg-white/20 text-white"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Touch Hint for Mobile */}
        <motion.div 
          className="absolute bottom-36 left-1/2 -translate-x-1/2 text-white/50 text-xs md:hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Swipe to navigate • Double-tap to zoom
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PropertyGallery;
