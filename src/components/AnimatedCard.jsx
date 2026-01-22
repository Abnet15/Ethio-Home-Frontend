import React from 'react';
import { motion } from 'framer-motion';
import useScrollAnimation from '../hooks/useScrollAnimation';

const animationVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  },
  fadeDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 }
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 }
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  rotate: {
    hidden: { opacity: 0, scale: 0.9, rotate: -5 },
    visible: { opacity: 1, scale: 1, rotate: 0 }
  }
};

const AnimatedCard = ({
  children,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  triggerOnce = true,
  as = 'div',
  ...props
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold, triggerOnce });
  
  const variants = animationVariants[animation] || animationVariants.fadeUp;
  
  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export const AnimatedSection = ({
  children,
  className = '',
  staggerChildren = 0.1,
  ...props
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.05 });

  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.section>
  );
};

export const AnimatedItem = ({
  children,
  className = '',
  animation = 'fadeUp',
  ...props
}) => {
  const variants = animationVariants[animation] || animationVariants.fadeUp;

  return (
    <motion.div
      className={className}
      variants={variants}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
