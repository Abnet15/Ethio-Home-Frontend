import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * Premium Animated Gradient Parallax Hero Component
 * Features floating orbs, animated gradients, and smooth parallax effects
 */
const HeroParallax = ({ children, className = '' }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  
  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -150]), springConfig);
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -300]), springConfig);
  const y3 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -200]), springConfig);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div 
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden ${className}`}
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/50">
        {/* Primary gradient overlay */}
        <div 
          className="absolute inset-0 opacity-90"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--gold-400) / 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 100% 0%, hsl(var(--ethiopian-green) / 0.12) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 0% 100%, hsl(var(--primary) / 0.08) 0%, transparent 50%)
            `
          }}
        />
        
        {/* Animated mesh gradient */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, hsl(var(--gold-400) / 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, hsl(var(--gold-400) / 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, hsl(var(--gold-400) / 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, hsl(var(--gold-400) / 0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating Orbs with Parallax */}
      <motion.div 
        className="absolute top-10 left-[10%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] rounded-full pointer-events-none"
        style={{ 
          y: y1,
          background: 'radial-gradient(circle, hsl(var(--gold-400) / 0.2) 0%, hsl(var(--gold-500) / 0.05) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      <motion.div 
        className="absolute top-[30%] right-[5%] w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[500px] lg:h-[500px] rounded-full pointer-events-none"
        style={{ 
          y: y2,
          background: 'radial-gradient(circle, hsl(var(--ethiopian-green) / 0.15) 0%, hsl(var(--accent) / 0.03) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      
      <motion.div 
        className="absolute bottom-[10%] left-[20%] w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[450px] lg:h-[450px] rounded-full pointer-events-none"
        style={{ 
          y: y3,
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.02) 50%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Animated Particles/Stars (subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Gradient Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/10 to-transparent" />

      {/* Content with Parallax */}
      <motion.div 
        className="relative z-10 min-h-screen flex flex-col"
        style={{ opacity, scale }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default HeroParallax;
