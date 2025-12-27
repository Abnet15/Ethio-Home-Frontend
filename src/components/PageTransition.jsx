import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * PageTransition Component
 * Adds smooth page transitions matching nextjs-frontend design
 * Wraps page content with Framer Motion animations
 */
export function PageTransition({ children }) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}
    >
      {children}
    </motion.div>
  );
}









