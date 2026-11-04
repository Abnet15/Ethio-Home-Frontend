import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

/**
 * Premium Hero Video / Skyline Background Component
 * Features: Cinematic Addis Ababa skyline at golden hour / dusk, parallax scrolling, soft glass overlays
 */
const HeroVideo = ({ 
  videoSrc = null,
  posterImage = '/hero-bg-addis.jpg',
  fallbackImages = ['/hero-bg-addis.jpg', '/hero-bg-modern.jpg', '/hero-bg-1.jpg'],
  children,
  className = '',
  overlayOpacity = 0.65,
  parallaxStrength = 0.35,
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
  const opacity = useTransform(scrollY, [0, 600], [1, 0.4]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.08]);

  // Image carousel for fallback
  useEffect(() => {
    if (!videoSrc && fallbackImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % fallbackImages.length);
      }, 7000);
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
      className={`relative min-h-[95vh] lg:min-h-screen w-full overflow-hidden flex flex-col justify-center ${className}`}
    >
      {/* Parallax Background Container */}
      <motion.div 
        className="absolute inset-0 w-full h-[125%] -top-[12%]"
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
          /* Fallback Addis Ababa Skyline Image Carousel with Smooth Ken Burns effect */
          <div className="absolute inset-0 w-full h-full">
            {fallbackImages.map((img, index) => (
              <motion.div
                key={img}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ 
                  opacity: index === currentImageIndex ? 1 : 0,
                  scale: index === currentImageIndex ? 1.08 : 1,
                }}
                transition={{ 
                  opacity: { duration: 2, ease: 'easeInOut' },
                  scale: { duration: 9, ease: 'easeInOut' },
                }}
              >
                <img
                  src={img}
                  alt="Modern Addis Ababa Skyline at Dusk"
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Cinematic Golden Hour / Dusk Atmosphere Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 90% 60% at 50% 25%, rgba(212, 160, 23, 0.22) 0%, transparent 65%),
              linear-gradient(180deg, 
                rgba(15, 20, 18, 0.72) 0%, 
                rgba(15, 20, 18, 0.45) 35%, 
                rgba(15, 20, 18, 0.75) 75%, 
                hsl(var(--background)) 100%
              )
            `,
          }}
        />

        {/* Subtle Warm Amber / Emerald Glow Mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Honey Gold Dusk Ambient Light */}
          <div 
            className="absolute -top-[10%] left-[20%] w-[600px] h-[500px] rounded-full pointer-events-none opacity-25 dark:opacity-35"
            style={{
              background: 'radial-gradient(circle, rgba(212, 160, 23, 0.5) 0%, rgba(234, 179, 8, 0.1) 50%, transparent 75%)',
              filter: 'blur(80px)',
            }}
          />

          {/* Deep Emerald Accent Light */}
          <div 
            className="absolute bottom-[20%] right-[10%] w-[500px] h-[450px] rounded-full pointer-events-none opacity-25 dark:opacity-35"
            style={{
              background: 'radial-gradient(circle, rgba(11, 110, 79, 0.5) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 75%)',
              filter: 'blur(80px)',
            }}
          />
        </div>
      </motion.div>

      {/* Video Controls (if video source is active) */}
      {videoSrc && showControls && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
};

export default HeroVideo;
