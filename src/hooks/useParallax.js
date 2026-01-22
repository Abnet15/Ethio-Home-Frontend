import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Custom hook for scroll-linked parallax effects
 * @param {Object} options - Configuration options
 * @param {number} options.speed - Parallax speed multiplier (default: 0.5)
 * @param {string} options.direction - Direction: 'up', 'down', 'left', 'right' (default: 'up')
 * @param {boolean} options.disabled - Disable parallax (default: false)
 * @returns {Object} { ref, style, scrollY, progress }
 */
export const useParallax = (options = {}) => {
  const {
    speed = 0.5,
    direction = 'up',
    disabled = false,
  } = options;

  const ref = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [elementTop, setElementTop] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (disabled) return;

    const updatePosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setElementTop(rect.top + window.scrollY);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = rect.height;

        // Calculate progress (0 when element enters viewport, 1 when it leaves)
        const start = elementTop - windowHeight;
        const end = elementTop + elementHeight;
        const current = currentScrollY;
        const prog = Math.max(0, Math.min(1, (current - start) / (end - start)));
        setProgress(prog);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [elementTop, disabled]);

  const getTransform = useCallback(() => {
    if (disabled) return {};

    const offset = (scrollY - elementTop) * speed;

    switch (direction) {
      case 'up':
        return { transform: `translateY(${-offset}px)` };
      case 'down':
        return { transform: `translateY(${offset}px)` };
      case 'left':
        return { transform: `translateX(${-offset}px)` };
      case 'right':
        return { transform: `translateX(${offset}px)` };
      default:
        return { transform: `translateY(${-offset}px)` };
    }
  }, [scrollY, elementTop, speed, direction, disabled]);

  return {
    ref,
    style: getTransform(),
    scrollY,
    progress,
  };
};

/**
 * Hook for reveal animations on scroll
 * @param {Object} options - Configuration options
 * @returns {Object} { ref, isVisible, progress }
 */
export const useScrollReveal = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setProgress(entry.intersectionRatio);
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
            setProgress(0);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible, progress };
};

/**
 * Hook for scroll-linked opacity/scale effects
 * @param {Object} options - Configuration options
 * @returns {Object} { ref, opacity, scale }
 */
export const useScrollFade = (options = {}) => {
  const {
    fadeStart = 0,
    fadeEnd = 200,
    scaleStart = 1,
    scaleEnd = 0.95,
  } = options;

  const ref = useRef(null);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, (fadeStart - rect.top) / (fadeEnd - fadeStart)));

      setOpacity(1 - scrollProgress);
      setScale(scaleStart - (scaleStart - scaleEnd) * scrollProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [fadeStart, fadeEnd, scaleStart, scaleEnd]);

  return {
    ref,
    style: {
      opacity,
      transform: `scale(${scale})`,
    },
  };
};

export default useParallax;
