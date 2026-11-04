import {
  Home,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";


const Signup = () => {
  const { t } = useLanguage();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    role: "buyer",
    location: "",
    address: "",
    city: "",
    state: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-select buyer role since it's the only option
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      role: "buyer",
    }));
  }, []);

  // Validation functions
  const validatePhone = (phone) => {
    const ethiopianPhoneRegex = /^(\+251|251|0)?[79]\d{8}$/;
    return ethiopianPhoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid Ethiopian phone number';
    }

    // Location validation
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    // State validation
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate form before submission
    if (!validateForm()) {
      setError("Please fix the errors in the form");
      setLoading(false);
      return;
    }

    try {
      const result = await signup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        role: formData.role,
        location: formData.location.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
      });

      if (result.success) {
        setSuccess(
          t("Account created successfully! Please check your email to verify your account.")
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(t(result.error || "Failed to create account"));
      }
    } catch (err) {
      setError(
        t(
          err.response?.data?.message ||
            "An unexpected error occurred. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative py-16 px-4 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-accent via-accent/90 to-foreground/90"></div>
      <div className="fixed inset-0 bg-gradient-radial-gold opacity-40"></div>
      
      {/* Floating decorative elements */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-gold-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
      
      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in-up">
        <div className="glass-card rounded-3xl shadow-luxury overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#0B6E4F] via-[#095C42] to-[#043324] p-8 sm:p-10 text-white overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            
            <Link to="/" className="relative flex items-center gap-4 mb-8 group">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Home className="h-7 w-7" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">Ethio-Home</span>
            </Link>
            
            <div className="ethiopian-accent-bar w-16 mb-6"></div>
            <h1 className="font-serif text-4xl font-bold mb-3">{t("Create Account")}</h1>
            <p className="text-accent-foreground/80 text-lg font-light">
              {t("Join Ethio-Home and start your real estate journey")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-10 space-y-6 bg-card max-h-[60vh] overflow-y-auto scrollbar-luxury">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive font-medium animate-fade-in">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-accent font-medium animate-fade-in">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                {t("Full Name")}
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4B5563] dark:text-[#A8B5AE] group-focus-within:text-[#0B6E4F] dark:group-focus-within:text-[#10B981] transition-colors" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("Enter your full name")}
                  className={`w-full pl-12 pr-4 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40 ${
                    formErrors.name ? 'border-destructive' : 'border-[#E5E0D8] dark:border-[#2A342E]'
                  }`}
                  autoComplete="name"
                  required
                />
              </div>
              {formErrors.name && <div className="text-sm text-destructive font-medium animate-fade-in">{formErrors.name}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                  {t("Email Address")}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4B5563] dark:text-[#A8B5AE] group-focus-within:text-[#0B6E4F] dark:group-focus-within:text-[#10B981] transition-colors" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("Enter your email")}
                    className={`w-full pl-12 pr-4 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40 ${
                      formErrors.email ? 'border-destructive' : 'border-[#E5E0D8] dark:border-[#2A342E]'
                    }`}
                    autoComplete="email"
                    required
                  />
                </div>
                {formErrors.email && <div className="text-sm text-destructive font-medium animate-fade-in">{formErrors.email}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                  {t("Phone Number")}
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4B5563] dark:text-[#A8B5AE] group-focus-within:text-[#0B6E4F] dark:group-focus-within:text-[#10B981] transition-colors" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("+251 911 123 456")}
                    className={`w-full pl-12 pr-4 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40 ${
                      formErrors.phone ? 'border-destructive' : 'border-[#E5E0D8] dark:border-[#2A342E]'
                    }`}
                    autoComplete="tel"
                    required
                  />
                </div>
                {formErrors.phone && <div className="text-sm text-destructive font-medium animate-fade-in">{formErrors.phone}</div>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                {t("Location")}
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4B5563] dark:text-[#A8B5AE] group-focus-within:text-[#0B6E4F] dark:group-focus-within:text-[#10B981] transition-colors" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t("e.g., Bole, Addis Ababa")}
                  className={`w-full pl-12 pr-4 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40 ${
                    formErrors.location ? 'border-destructive' : 'border-[#E5E0D8] dark:border-[#2A342E]'
                  }`}
                  autoComplete="address-line1"
                  required
                />
              </div>
              {formErrors.location && <div className="text-sm text-destructive font-medium animate-fade-in">{formErrors.location}</div>}
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                {t("Full Address")}
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4B5563] dark:text-[#A8B5AE] group-focus-within:text-[#0B6E4F] dark:group-focus-within:text-[#10B981] transition-colors" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t("Enter your full address")}
                  className={`w-full pl-12 pr-4 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40 ${
                    formErrors.address ? 'border-destructive' : 'border-[#E5E0D8] dark:border-[#2A342E]'
                  }`}
                  autoComplete="address-line2"
                  required
                />
              </div>
              {formErrors.address && <div className="text-sm text-destructive font-medium animate-fade-in">{formErrors.address}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                  {t("City")}
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4B5563] dark:text-[#A8B5AE] group-focus-within:text-[#0B6E4F] dark:group-focus-within:text-[#10B981] transition-colors" />
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={t("Enter your city")}
                    className={`w-full pl-12 pr-4 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40 ${
                      formErrors.city ? 'border-destructive' : 'border-[#E5E0D8] dark:border-[#2A342E]'
                    }`}
                    autoComplete="address-level2"
                    required
                  />
                </div>
                {formErrors.city && <div className="text-sm text-destructive font-medium animate-fade-in">{formErrors.city}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                  {t("State/Region")}
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4B5563] dark:text-[#A8B5AE] group-focus-within:text-[#0B6E4F] dark:group-focus-within:text-[#10B981] transition-colors" />
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder={t("Enter your state or region")}
                    className={`w-full pl-12 pr-4 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40 ${
                      formErrors.state ? 'border-destructive' : 'border-[#E5E0D8] dark:border-[#2A342E]'
                    }`}
                    autoComplete="address-level1"
                    required
                  />
                </div>
                {formErrors.state && <div className="text-sm text-destructive font-medium animate-fade-in">{formErrors.state}</div>}
              </div>
            </div>

            {/* Role info card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground mb-1">{t("Property Buyer Account")}</h4>
                  <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE] mb-3">
                    {t("You're creating a buyer account to search and purchase properties.")}
                  </p>
                  <p className="text-xs text-[#4B5563] dark:text-[#A8B5AE]/80 p-3 rounded-lg bg-[#F0EDE6]/30 dark:bg-[#1C2420]/30">
                    <strong className="text-foreground">{t("Note")}:</strong>{" "}
                    {t("Other account types (Seller, Agent, Employee) are created by administrators only.")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                  {t("Password")}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4B5563] dark:text-[#A8B5AE] group-focus-within:text-[#0B6E4F] dark:group-focus-within:text-[#10B981] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("Create password")}
                    className={`w-full pl-12 pr-14 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40 ${
                      formErrors.password ? 'border-destructive' : 'border-[#E5E0D8] dark:border-[#2A342E]'
                    }`}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] dark:text-[#A8B5AE] hover:text-foreground transition-colors p-1 rounded-lg hover:bg-[#F0EDE6] dark:bg-[#1C2420]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formErrors.password && <div className="text-sm text-destructive font-medium animate-fade-in">{formErrors.password}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                  {t("Confirm Password")}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4B5563] dark:text-[#A8B5AE] group-focus-within:text-[#0B6E4F] dark:group-focus-within:text-[#10B981] transition-colors" />
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    id="passwordConfirm"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder={t("Confirm password")}
                    className={`w-full pl-12 pr-14 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40 ${
                      formErrors.passwordConfirm ? 'border-destructive' : 'border-[#E5E0D8] dark:border-[#2A342E]'
                    }`}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] dark:text-[#A8B5AE] hover:text-foreground transition-colors p-1 rounded-lg hover:bg-[#F0EDE6] dark:bg-[#1C2420]"
                  >
                    {showPasswordConfirm ? (
                      <EyeOff style={{ width: "20px", height: "20px" }} />
                    ) : (
                      <Eye style={{ width: "20px", height: "20px" }} />
                    )}
                  </button>
                </div>
                {formErrors.passwordConfirm && <div className="text-sm text-destructive font-medium animate-fade-in">{formErrors.passwordConfirm}</div>}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-[#0B6E4F] hover:bg-[#095C42] text-white rounded-xl font-bold text-base shadow-lg hover:shadow-[0_0_20px_rgba(212,160,23,0.35)] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></div>
                  {t("Creating Account...")}
                </>
              ) : (
                t("Create Account")
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-10 pb-10 text-center bg-card border-t border-[#E5E0D8] dark:border-[#2A342E] pt-6">
            <p className="text-[#4B5563] dark:text-[#A8B5AE]">
              {t("Already have an account?")}{" "}
              <Link to="/login" className="font-bold text-[#0B6E4F] dark:text-[#10B981] hover:underline transition-colors">
                {t("Sign in here")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;