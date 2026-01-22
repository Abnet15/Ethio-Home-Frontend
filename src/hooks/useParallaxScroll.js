import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Premium scroll-linked parallax hook
 * Creates smooth parallax effects based on scroll position
 */
export const useParallaxScroll = (options = {}) => {
  const {
    speed = 0.5,
    direction = 'vertical',
    offset = 0,
    clamp = true,
    minValue = -100,
    maxValue = 100,
  } = options;

  const ref = useRef(null);
  const [scrollValue, setScrollValue] = useState(0);
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  const updateScroll = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementTop = rect.top;
    const elementHeight = rect.height;

    // Calculate how far the element is through the viewport
    const scrollProgress = 1 - (elementTop / (windowHeight + elementHeight));
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
    
    setProgress(clampedProgress);

    // Calculate parallax offset
    let value = ((clampedProgress - 0.5) * 2) * speed * 100 + offset;
    
    if (clamp) {
      value = Math.max(minValue, Math.min(maxValue, value));
    }

    setScrollValue(value);
    ticking.current = false;
  }, [speed, offset, clamp, minValue, maxValue]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScroll);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateScroll]);

  const style = direction === 'vertical' 
    ? { transform: `translateY(${scrollValue}px)` }
    : { transform: `translateX(${scrollValue}px)` };

  return { ref, scrollValue, progress, style };
};

/**
 * Hook for revealing elements on scroll with various animations
 */
export const useScrollReveal = (options = {}) => {
  const {
    threshold = 0.15,
    rootMargin = '-50px 0px',
    triggerOnce = true,
    animation = 'fadeUp', // fadeUp, fadeDown, fadeLeft, fadeRight, scale, blur
    delay = 0,
    duration = 0.6,
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsVisible(true);
          setHasTriggered(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  const animations = {
    fadeUp: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    },
    fadeDown: {
      hidden: { opacity: 0, y: -40 },
      visible: { opacity: 1, y: 0 },
    },
    fadeLeft: {
      hidden: { opacity: 0, x: 40 },
      visible: { opacity: 1, x: 0 },
    },
    fadeRight: {
      hidden: { opacity: 0, x: -40 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(10px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
    },
    rotate: {
      hidden: { opacity: 0, rotate: -5, y: 20 },
      visible: { opacity: 1, rotate: 0, y: 0 },
    },
  };

  const selectedAnimation = animations[animation] || animations.fadeUp;

  const variants = {
    hidden: selectedAnimation.hidden,
    visible: {
      ...selectedAnimation.visible,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay,
        duration,
      },
    },
  };

  return { ref, isVisible, variants, animate: isVisible ? 'visible' : 'hidden' };
};

/**
 * Hook for scroll progress tracking
 */
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [direction, setDirection] = useState('down');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = maxScroll > 0 ? currentScrollY / maxScroll : 0;

      setProgress(currentProgress);
      setScrollY(currentScrollY);
      setDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { progress, scrollY, direction };
};

/**
 * Hook for element-based scroll progress (how much of element is visible)
 */
export const useElementScrollProgress = (options = {}) => {
  const { offset = 0 } = options;
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on element position in viewport
      const start = windowHeight - offset;
      const end = -rect.height + offset;
      const current = rect.top;
      
      const rawProgress = (start - current) / (start - end);
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      
      setProgress(clampedProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [offset]);

  return { ref, progress };
};

export default useParallaxScroll;
