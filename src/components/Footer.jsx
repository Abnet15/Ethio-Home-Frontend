import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUpRight } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    }
  };

  return (
    <footer className="relative mt-12 sm:mt-16 overflow-hidden">
      {/* Ethiopian accent bar */}
      <div className="ethiopian-accent-bar w-full" />
      
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/80 via-card/90 to-background backdrop-blur-xl" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial-gold opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, hsl(145 63% 32% / 0.15) 0%, transparent 70%)' }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 sm:pt-12 pb-6">
        <motion.div 
          className="footer-grid-horizontal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Link to="/" className="group inline-flex items-center gap-3 no-underline">
              <div className="w-12 h-12 rounded-2xl bg-gradient-luxury flex items-center justify-center shadow-glow-gold transition-transform group-hover:scale-110">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold text-gradient-gold">Ethio-Home</span>
            </Link>
            <p className="text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[#4B5563] dark:text-[#A8B5AE] hover:text-primary hover:border-primary/50 hover:shadow-glow-gold transition-all duration-300 hover:-translate-y-1"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-gold rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: t('home') },
                { to: '/properties', label: t('properties') },
                { to: '/about', label: t('about') },
                { to: '/contact', label: t('contact') }
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.to} 
                    className="group flex items-center gap-2 text-[#4B5563] dark:text-[#A8B5AE] hover:text-foreground transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gold-400" />
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-gold group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Property Types */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-ethiopian rounded-full" />
              Property Types
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/properties?type=house', label: t('house') || 'House' },
                { to: '/properties?type=apartment', label: t('apartment') || 'Apartment' },
                { to: '/properties?type=villa', label: t('villa') || 'Villa' },
                { to: '/properties?type=commercial', label: t('commercial') || 'Commercial' }
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.to} 
                    className="group flex items-center gap-2 text-[#4B5563] dark:text-[#A8B5AE] hover:text-foreground transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[hsl(145_63%_32%)]" />
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[hsl(145_63%_32%)] group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-luxury rounded-full" />
              Contact Info
            </h3>
            <div className="space-y-4">
              {[
                { icon: MapPin, text: 'Bole, Addis Ababa, Ethiopia' },
                { icon: Phone, text: '+251 911 123 456' },
                { icon: Mail, text: 'info@ethiohome.com' }
              ].map((item, i) => (
                <div key={i} className="group flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center flex-shrink-0 group-hover:border-primary/50 transition-colors">
                    <item.icon className="w-4 h-4 text-gold-400" />
                  </div>
                  <span className="text-[#4B5563] dark:text-[#A8B5AE] pt-2 group-hover:text-foreground transition-colors">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Luxury Divider */}
        <div className="luxury-divider my-10" />

        {/* Bottom Bar */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">
            © {new Date().getFullYear()} Ethio-Home. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-[#4B5563] dark:text-[#A8B5AE] hover:text-foreground transition-colors relative group">
              Privacy Policy
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-400 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link to="/terms" className="text-sm text-[#4B5563] dark:text-[#A8B5AE] hover:text-foreground transition-colors relative group">
              Terms of Service
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-400 group-hover:w-full transition-all duration-300" />
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
