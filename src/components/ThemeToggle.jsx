import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-colors ${className}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: isDark 
          ? 'linear-gradient(145deg, hsl(256 28% 18%), hsl(256 28% 14%))'
          : 'linear-gradient(145deg, hsl(260 15% 96%), hsl(260 15% 92%))',
        border: `1px solid ${isDark ? 'hsl(270 50% 40% / 0.4)' : 'hsl(270 50% 70% / 0.4)'}`,
        boxShadow: isDark 
          ? '0 4px 12px hsl(0 0% 0% / 0.3)' 
          : '0 4px 12px hsl(256 30% 15% / 0.1)'
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Sun 
              className="w-5 h-5"
              style={{ color: 'hsl(45 100% 60%)' }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Moon 
              className="w-5 h-5"
              style={{ color: 'hsl(270 60% 55%)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: isDark 
            ? '0 0 20px hsl(45 100% 60% / 0.2)' 
            : '0 0 20px hsl(270 60% 55% / 0.2)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

export default ThemeToggle;
