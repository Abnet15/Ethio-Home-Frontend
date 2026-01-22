import React from 'react';

/**
 * Reusable Page Wrapper Component
 * Applies consistent dark purple theme background to all pages
 */
const PageWrapper = ({ children, className = '', showStars = true }) => {
  return (
    <div className={`min-h-screen bg-purple-dark relative overflow-hidden ${className}`}>
      {/* Dark purple gradient background */}
      <div className="absolute inset-0 bg-gradient-purple-dark"></div>
      
      {/* Subtle stars effect */}
      {showStars && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-purple-400/40 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;















