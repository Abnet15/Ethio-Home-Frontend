import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

/**
 * Premium Hero Video Background Component
 * Features: Parallax scrolling, video controls, overlay effects
 */
const HeroVideo = ({ 
  videoSrc = null,
  posterImage = '/hero-bg-addis.jpg',
  fallbackImages = ['/hero-bg-addis.jpg', '/hero-bg-modern.jpg'],
  children,
  className = '',
  overlayOpacity = 0.6,
  parallaxStrength = 0.3,
  showControls = false,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Parallax scroll effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * parallaxStrength]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  // Image carousel for fallback
  useEffect(() => {
    if (!videoSrc && fallbackImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % fallbackImages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [videoSrc, fallbackImages]);

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative min-h-[100vh] w-full overflow-hidden ${className}`}
    >
      {/* Parallax Background Container */}
      <motion.div 
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ y, scale }}
      >
        {/* Video Background */}
        {videoSrc ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={videoSrc}
            poster={posterImage}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
          />
        ) : (
          /* Fallback Image Carousel with Ken Burns effect */
          <div className="absolute inset-0 w-full h-full">
            {fallbackImages.map((img, index) => (
              <motion.div
                key={img}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ 
                  opacity: index === currentImageIndex ? 1 : 0,
                  scale: index === currentImageIndex ? 1.1 : 1,
                }}
                transition={{ 
                  opacity: { duration: 1.5, ease: 'easeInOut' },
                  scale: { duration: 8, ease: 'linear' },
                }}
              >
                <img
                  src={img}
                  alt="Hero background"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Animated Gradient Mesh Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, hsl(var(--background) / 0.4) 100%),
              linear-gradient(180deg, 
                hsl(var(--foreground) / ${overlayOpacity * 0.8}) 0%, 
                hsl(var(--foreground) / ${overlayOpacity * 0.5}) 40%,
                hsl(var(--foreground) / ${overlayOpacity * 0.7}) 70%,
                hsl(var(--background)) 100%
              )
            `,
          }}
        />

        {/* Ethiopian Flag Accent Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `
              linear-gradient(135deg, 
                hsl(var(--ethiopian-green) / 0.3) 0%, 
                transparent 33%,
                hsl(var(--ethiopian-yellow) / 0.2) 33%,
                transparent 66%,
                hsl(var(--ethiopian-red) / 0.2) 66%,
                transparent 100%
              )
            `,
          }}
        />

        {/* Animated Floating Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Gold orb - top left */}
          <motion.div
            className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, hsl(var(--gold-400) / 0.4) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Green orb - bottom right */}
          <motion.div
            className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full opacity-25"
            style={{
              background: 'radial-gradient(circle, hsl(var(--ethiopian-green) / 0.5) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
            animate={{
              y: [0, 25, 0],
              x: [0, -15, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />

          {/* Red accent orb - center right */}
          <motion.div
            className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, hsl(var(--ethiopian-red) / 0.4) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 4,
            }}
          />

          {/* Small floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gold-400/40"
              style={{
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                top: `${10 + Math.random() * 70}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                y: [0, -30 - Math.random() * 20, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>

        {/* Animated Grid Pattern Overlay */}
        <motion.div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--gold-400) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--gold-400) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>

      {/* Content Container with parallax opacity */}
      <motion.div 
        className="relative z-10 min-h-[100vh] flex flex-col"
        style={{ opacity }}
      >
        {children}
      </motion.div>

      {/* Video Controls (if enabled) */}
      {showControls && videoSrc && (
        <div className="absolute bottom-8 right-8 z-20 flex gap-3">
          <motion.button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
          <motion.button
            onClick={toggleMute}
            className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <motion.div 
          className="relative"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-8 h-14 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <motion.div 
              className="w-2 h-4 bg-white/70 rounded-full"
              animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <motion.div 
            className="absolute -inset-3 rounded-full border border-white/10"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>

      {/* Image Indicators (for fallback carousel) */}
      {!videoSrc && fallbackImages.length > 1 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {fallbackImages.map((_, index) => (
            <motion.button
              key={index}
              className={`relative h-2.5 rounded-full transition-all duration-500 ${
                index === currentImageIndex 
                  ? 'w-10 bg-gradient-to-r from-gold-400 to-gold-500' 
                  : 'w-4 bg-white/30 hover:bg-white/50'
              }`}
              onClick={() => setCurrentImageIndex(index)}
              whileHover={{ scale: 1.2 }}
            >
              {index === currentImageIndex && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-400 to-gold-500"
                  style={{ filter: 'blur(8px)' }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroVideo;
