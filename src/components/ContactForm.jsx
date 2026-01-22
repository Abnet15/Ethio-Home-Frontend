import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  FileText,
  MessageCircle,
  Send,
  CheckCircle,
  Users,
  Building,
  HeadphonesIcon,
  CreditCard,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const INQUIRY_TYPES = [
  { value: 'general', label: 'General Inquiry', icon: MessageCircle },
  { value: 'property', label: 'Property Related', icon: Building },
  { value: 'technical', label: 'Technical Support', icon: HeadphonesIcon },
  { value: 'billing', label: 'Billing Question', icon: CreditCard },
];

const FormField = ({ 
  label, 
  icon: Icon, 
  required, 
  children, 
  focused, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <div
      className={`relative rounded-xl border-2 transition-all duration-300 ${
        focused
          ? 'border-gold-400 shadow-[0_0_20px_hsl(var(--gold-400)/0.2)]'
          : 'border-border hover:border-gold-400/50'
      }`}
    >
      {children}
    </div>
  </div>
);

const ContactForm = ({
  user,
  isAuthenticated,
  onSubmit,
  loading = false,
  success = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });
  const [focusedField, setFocusedField] = useState(null);

  // Pre-populate with user data
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Reset form on success
  useEffect(() => {
    if (success && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        subject: '',
        message: '',
        inquiryType: 'general',
      });
    }
  }, [success, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Character limit for message
    if (name === 'message' && value.length > 1000) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return;
    onSubmit({ ...formData, sender: user._id });
  };

  return (
    <div className="relative bg-card/95 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-accent via-accent/90 to-foreground/80 p-6 md:p-8 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Send a Message</h2>
            <p className="text-white/80 text-sm md:text-base">We'll respond within 24 hours</p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6 md:p-8">
        {/* Login Required */}
        <AnimatePresence>
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Login Required</h3>
                  <p className="text-sm text-muted-foreground">Please log in to submit a message</p>
                </div>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground">We'll get back to you soon.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" icon={User} required focused={focusedField === 'name'}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3.5 bg-transparent rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder="Enter your name"
                required
              />
            </FormField>
            <FormField label="Email" icon={Mail} required focused={focusedField === 'email'}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3.5 bg-transparent rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder="your@email.com"
                required
              />
            </FormField>
          </div>

          {/* Row 2: Phone & Inquiry Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Phone Number" icon={Phone} focused={focusedField === 'phone'}>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3.5 bg-transparent rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder="+251 911 123 456"
              />
            </FormField>
            <FormField label="Inquiry Type" icon={FileText} focused={focusedField === 'inquiryType'}>
              <div className="relative">
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('inquiryType')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3.5 bg-transparent rounded-xl text-foreground focus:outline-none appearance-none cursor-pointer pr-10"
                >
                  {INQUIRY_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="bg-card text-foreground">
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </FormField>
          </div>

          {/* Subject */}
          <FormField label="Subject" icon={Sparkles} required focused={focusedField === 'subject'}>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onFocus={() => setFocusedField('subject')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-4 py-3.5 bg-transparent rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none"
              placeholder="What is this about?"
              required
            />
          </FormField>

          {/* Message */}
          <FormField label="Message" icon={MessageCircle} required focused={focusedField === 'message'}>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              onFocus={() => setFocusedField('message')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-4 py-3.5 bg-transparent rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[140px]"
              placeholder="Tell us more about your inquiry..."
              required
            />
          </FormField>
          <div className="flex justify-end -mt-2">
            <span className={`text-xs ${formData.message.length > 900 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {formData.message.length}/1000
            </span>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading || !isAuthenticated}
            className="w-full relative group py-4 px-6 rounded-xl font-bold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isAuthenticated ? 1.02 : 1 }}
            whileTap={{ scale: isAuthenticated ? 0.98 : 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            <span className="relative flex items-center justify-center gap-3 text-white">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : !isAuthenticated ? (
                <>
                  <Users className="w-5 h-5" />
                  Login Required
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </span>
          </motion.button>

          <p className="text-center text-sm text-muted-foreground">
            Fields marked with <span className="text-destructive">*</span> are required
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
