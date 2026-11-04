import { Home, Eye, EyeOff, Mail, Lock } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { redirectToDashboard } from "../utils/dashboardRedirect";

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Login successful, redirect to role-specific dashboard
        redirectToDashboard(result.user.role, navigate, { replace: true });
      } else {
        setError(t(result.error || "Failed to sign in"));
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
    <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] relative flex items-center justify-center p-4 overflow-hidden transition-colors duration-200">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B6E4F]/5 via-transparent to-[#D4A017]/5 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-40"></div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gold-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Premium Card with glassmorphism */}
        <div className="bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-[#0B6E4F] via-[#095C42] to-[#043324] p-8 sm:p-10 text-white overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>

            <Link to="/" className="relative flex items-center gap-4 mb-8 group">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Home className="h-7 w-7" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">Ethio-Home</span>
            </Link>

            <div className="ethiopian-accent-bar w-16 mb-6"></div>
            <h1 className="font-serif text-4xl font-bold mb-3">{t("Sign In")}</h1>
            <p className="text-accent-foreground/80 text-lg font-light">{t("Welcome back! Please sign in to your account")}</p>
          </div>

          {/* Form section */}
          <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6 bg-white dark:bg-[#141A17]">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive font-medium animate-fade-in">
                {error}
              </div>
            )}

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
                  className="w-full pl-12 pr-4 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

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
                  placeholder={t("Enter your password")}
                  className="w-full pl-12 pr-14 py-4 bg-[#F0EDE6]/50 dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] rounded-xl focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#0B6E4F] focus:border-transparent transition-all duration-200 hover:border-[#0B6E4F]/40"
                  autoComplete="current-password"
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
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm font-bold text-[#0B6E4F] dark:text-[#10B981] hover:underline transition-colors">
                  {t("Forgot your password?")}
                </Link>
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
                  {t("Signing in...")}
                </>
              ) : (
                t("Sign In")
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 sm:px-10 pb-8 sm:pb-10 text-center bg-white dark:bg-[#141A17]">
            <div className="luxury-divider mb-6"></div>
            <p className="text-[#4B5563] dark:text-[#A8B5AE]">
              {t("Don't have an account?")}{" "}
              <Link to="/signup" className="font-bold text-[#0B6E4F] dark:text-[#10B981] hover:underline transition-colors">
                {t("Sign up here")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;