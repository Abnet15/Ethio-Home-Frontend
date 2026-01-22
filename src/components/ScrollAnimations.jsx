import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

/**
 * Premium Scroll Progress Bar
 * Shows reading progress at the top of the page with Ethiopian colors
 */
export const ScrollProgressBar = ({ className = '' }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 z-[100] origin-left ${className}`}
      style={{
        scaleX,
        background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold-400)), hsl(var(--primary)))',
        boxShadow: '0 0 10px hsl(var(--primary) / 0.5)',
      }}
    />
  );
};

/**
 * Parallax Container - Creates smooth parallax scrolling effect
 */
export const ParallaxContainer = ({
  children,
  className = '',
  speed = 0.5,
  direction = 'up',
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  
  const multiplier = direction === 'up' ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * multiplier, -100 * speed * multiplier]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y: smoothY }}>
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Parallax Section Container
 * Creates depth effect with different scroll speeds
 */
export const ParallaxSection = ({ 
  children, 
  className = '', 
  speed = 0.5,
  direction = 'up',
  overflow = true 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const multiplier = direction === 'up' ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * multiplier, -100 * speed * multiplier]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`relative ${overflow ? 'overflow-hidden' : ''} ${className}`}>
      <motion.div style={{ y: smoothY }}>
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Reveal on Scroll - Animates elements as they enter viewport
 * Enhanced with blur and more animation types
 */
export const RevealOnScroll = ({
  children,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.2,
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '-50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once, threshold]);

  const animations = {
    fadeUp: {
      hidden: { opacity: 0, y: 60, filter: 'blur(4px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    },
    fadeDown: {
      hidden: { opacity: 0, y: -60, filter: 'blur(4px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    },
    fadeLeft: {
      hidden: { opacity: 0, x: 60, filter: 'blur(4px)' },
      visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
    },
    fadeRight: {
      hidden: { opacity: 0, x: -60, filter: 'blur(4px)' },
      visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.85, filter: 'blur(4px)' },
      visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    },
    rotate: {
      hidden: { opacity: 0, rotate: -10, y: 40 },
      visible: { opacity: 1, rotate: 0, y: 0 },
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(20px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
    },
    flip: {
      hidden: { opacity: 0, rotateX: 90 },
      visible: { opacity: 1, rotateX: 0 },
    },
  };

  const selectedAnimation = animations[animation] || animations.fadeUp;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: selectedAnimation.hidden,
        visible: {
          ...selectedAnimation.visible,
          transition: {
            type: 'spring',
            stiffness: 80,
            damping: 20,
            delay,
            duration,
            filter: {
              duration: duration || 0.6,
              ease: [0.4, 0, 0.2, 1],
            },
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger Container - Staggers child animations
 */
export const StaggerContainer = ({
  children,
  className = '',
  staggerDelay = 0.1,
  delayChildren = 0.2,
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger Item - Child element for StaggerContainer
 */
export const StaggerItem = ({
  children,
  className = '',
  animation = 'fadeUp',
}) => {
  const animations = {
    fadeUp: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    },
    fadeDown: {
      hidden: { opacity: 0, y: -40 },
      visible: { opacity: 1, y: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    fadeLeft: {
      hidden: { opacity: 0, x: 40 },
      visible: { opacity: 1, x: 0 },
    },
    fadeRight: {
      hidden: { opacity: 0, x: -40 },
      visible: { opacity: 1, x: 0 },
    },
  };

  return (
    <motion.div
      className={className}
      variants={animations[animation]}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered Children Reveal
 * Animates children one by one with stagger effect
 */
export const StaggerReveal = ({ 
  children, 
  className = '',
  staggerDelay = 0.1,
  animation = 'fadeUp',
  threshold = 0.1,
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '-30px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const animations = {
    fadeUp: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
    fadeDown: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } },
    fadeLeft: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
    fadeRight: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  };

  const selectedAnimation = animations[animation] || animations.fadeUp;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: selectedAnimation.hidden,
            visible: {
              ...selectedAnimation.visible,
              transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15,
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * Floating Element - Adds gentle floating animation
 */
export const FloatingElement = ({
  children,
  className = '',
  intensity = 20,
  duration = 4,
  delay = 0,
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-intensity / 2, intensity / 2, -intensity / 2],
        rotate: [-2, 2, -2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Parallax Image with depth effect
 */
export const ParallaxImage = ({ 
  src, 
  alt = '', 
  className = '',
  speed = 0.3,
  scale = 1.2,
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y: smoothY, scale }}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

/**
 * Text Reveal - Character-by-character text animation
 */
export const TextReveal = ({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
  once = true,
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once]);

  const words = text.split(' ');

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 20, rotateX: 90 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
};

/**
 * Counter animation
 */
export const CountUp = ({ 
  end, 
  duration = 2, 
  className = '',
  prefix = '',
  suffix = '',
  once = true,
}) => {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated)) {
          setHasAnimated(true);
          let startTime = null;
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, once, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

/**
 * Blur Reveal - Reveals content with blur effect
 */
export const BlurReveal = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      whileInView={{ opacity: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
        filter: {
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Magnetic Element - Creates magnetic hover effect
 */
export const MagneticElement = ({
  children,
  className = '',
  strength = 0.3,
}) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Scroll Scale - Scales element based on scroll
 */
export const ScrollScale = ({
  children,
  className = '',
  scaleRange = [0.8, 1],
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [scaleRange[0], 1, scaleRange[1]]);
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} className={className} style={{ scale: smoothScale }}>
      {children}
    </motion.div>
  );
};

/**
 * 3D Card Tilt - Creates 3D tilt effect on hover
 */
export const Card3DTilt = ({
  children,
  className = '',
  maxTilt = 10,
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);
    setRotateX(-percentY * maxTilt);
    setRotateY(percentX * maxTilt);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Smooth scroll link component
 */
export const SmoothScrollLink = ({ 
  children, 
  to, 
  className = '',
  offset = -80,
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    const element = document.querySelector(to);
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default {
  ScrollProgressBar,
  ParallaxContainer,
  ParallaxSection,
  RevealOnScroll,
  StaggerContainer,
  StaggerItem,
  StaggerReveal,
  FloatingElement,
  ParallaxImage,
  TextReveal,
  CountUp,
  BlurReveal,
  MagneticElement,
  ScrollScale,
  Card3DTilt,
  SmoothScrollLink,
};
