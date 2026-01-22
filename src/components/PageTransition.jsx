import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * PageTransition Component
 * Premium page transitions with staggered entrance animations
 * Features glassmorphism, Ethiopian-inspired colors, and luxury effects
 */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.99,
    filter: "blur(4px)",
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.4,
      staggerChildren: 0.08,
      delayChildren: 0.15,
      filter: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.99,
    filter: "blur(4px)",
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
      filter: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
};

const childVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
  exit: { opacity: 0, y: -10 },
};

// Slide variants for different directions
const slideVariants = {
  slideUp: {
    initial: { opacity: 0, y: 60 },
    enter: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -60 },
    enter: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 60 },
    enter: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -60 },
    enter: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { opacity: 0, x: 20 },
  },
  fade: {
    initial: { opacity: 0 },
    enter: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    enter: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { opacity: 0, scale: 0.95 },
  },
};

export function PageTransition({ children, variant = "default" }) {
  const location = useLocation();
  const variants = variant === "default" ? pageVariants : (slideVariants[variant] || pageVariants);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
        className="page-transition-wrapper"
        style={{ willChange: 'transform, opacity, filter' }}
      >
        {/* Page overlay for smooth transitions */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 bg-gradient-to-b from-background/80 to-transparent"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Export child variants for use in page components
export { childVariants, pageVariants, slideVariants };

// Stagger container for section animations
export function StaggerContainer({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial="initial"
      whileInView="enter"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        initial: {},
        enter: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger Item
export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 30 },
        enter: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated section wrapper
export function AnimatedSection({ children, className = "", delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 30,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Fade in animation wrapper
export function FadeIn({ children, direction = "up", delay = 0, className = "" }) {
  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale in animation
export function ScaleIn({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover lift effect
export function HoverLift({ children, className = "", scale = 1.02, y = -8 }) {
  return (
    <motion.div
      whileHover={{ 
        y, 
        scale,
        transition: { type: "spring", stiffness: 400, damping: 20 } 
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating animation
export function FloatingElement({ children, className = "", intensity = 10, duration = 4 }) {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Parallax element
export function ParallaxElement({ children, className = "", speed = 0.5 }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{
        y: [-20 * speed, 20 * speed],
        transition: {
          duration: 1,
          ease: "linear",
        }
      }}
      viewport={{ once: false }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Text reveal animation
export function TextReveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Gradient border animation
export function GradientBorder({ children, className = "" }) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-ethiopian opacity-0"
        whileHover={{ opacity: 0.3 }}
        transition={{ duration: 0.3 }}
        style={{ filter: "blur(8px)", zIndex: -1 }}
      />
      {children}
    </motion.div>
  );
}

// Pulse glow effect
export function PulseGlow({ children, className = "", color = "gold" }) {
  const colors = {
    gold: "shadow-glow-gold",
    green: "shadow-glow-green",
    luxury: "shadow-luxury",
  };

  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 20px hsl(48 96% 53% / 0.2)",
          "0 0 40px hsl(48 96% 53% / 0.4)",
          "0 0 20px hsl(48 96% 53% / 0.2)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`${className} ${colors[color]}`}
    >
      {children}
    </motion.div>
  );
}

// Card 3D tilt effect
export function Card3D({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      whileHover={{
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.3 },
      }}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}
