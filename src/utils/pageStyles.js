/**
 * Consistent Page Styling Utilities
 * Ensures all pages use the same premium purple theme
 */

export const pageContainerStyles = {
  base: "min-h-screen bg-purple-dark relative overflow-hidden",
  content: "relative z-10 container mx-auto px-4 py-8 lg:py-12",
  section: "mb-12 lg:mb-16"
};

export const cardStyles = {
  premium: "glass-card-premium border-purple-600/40 shadow-purple-glow p-6 lg:p-8",
  standard: "bg-gradient-to-br from-gray-900/95 via-purple-950/90 to-gray-900/95 backdrop-blur-xl border border-purple-800/30 rounded-xl p-6 shadow-lg",
  hover: "hover:border-purple-600/60 hover:shadow-purple-glow-lg hover:-translate-y-1 transition-all duration-300"
};

export const buttonStyles = {
  primary: "bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 px-6 py-3 rounded-lg font-semibold",
  outline: "border-2 border-purple-600/50 bg-transparent text-purple-400 hover:bg-purple-600/10 hover:text-purple-300 hover:border-purple-500 hover:shadow-purple-500/20 backdrop-blur-sm transition-all px-6 py-3 rounded-lg font-semibold",
  ghost: "text-purple-400 hover:bg-purple-600/15 hover:text-purple-300 transition-all px-6 py-3 rounded-lg font-semibold"
};

export const inputStyles = {
  base: "w-full px-4 py-3 bg-gray-900/70 border border-purple-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all backdrop-blur-sm",
  error: "border-red-500 focus:ring-red-500/50"
};

export const textStyles = {
  heading1: "text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4",
  heading2: "text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3",
  heading3: "text-xl md:text-2xl font-bold text-white mb-2",
  body: "text-gray-300 leading-relaxed",
  muted: "text-gray-400 text-sm",
  accent: "text-purple-400 font-semibold"
};

export const sectionStyles = {
  header: "text-center mb-8 lg:mb-12",
  title: "text-3xl md:text-4xl font-bold text-white mb-3",
  subtitle: "text-gray-400 text-lg max-w-2xl mx-auto"
};















