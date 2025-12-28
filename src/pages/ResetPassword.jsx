import { Home, Lock, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";


const ResetPassword = () => {
  const { t } = useLanguage();
  const { resetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError(t("Password must be at least 6 characters"));
      setLoading(false);
      return;
    }
    if (password !== passwordConfirm) {
      setError(t("Passwords do not match"));
      setLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, password, passwordConfirm);
      if (result.success) {
        setMessage(t("Password reset successfully"));
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(t(result.error || "Failed to reset password"));
      }
    } catch (err) {
      setError(t("An unexpected error occurred. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent/90 to-foreground/90"></div>
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-40"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gold-400/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Premium Card with glassmorphism */}
        <div className="glass-card rounded-3xl shadow-luxury overflow-hidden animate-fade-in-up">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-accent to-accent/80 p-10 text-accent-foreground overflow-hidden">
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
            <h1 className="font-serif text-4xl font-bold mb-3">{t("Reset Password")}</h1>
            <p className="text-accent-foreground/80 text-lg font-light">{t("Enter and confirm your new password")}</p>
          </div>

          {/* Form section */}
          <form onSubmit={handleSubmit} className="p-10 space-y-6 bg-card">
            {message && (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-accent font-medium animate-fade-in">
                {message}
              </div>
            )}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive font-medium animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                {t("New Password")}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("Enter new password")}
                  className="w-full pl-12 pr-14 py-4 bg-background/50 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 hover:border-accent/50"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-foreground uppercase tracking-wider">
                {t("Confirm Password")}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder={t("Confirm new password")}
                  className="w-full pl-12 pr-14 py-4 bg-background/50 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 hover:border-accent/50"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                >
                  {showPasswordConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-xl font-bold text-lg shadow-lg hover:shadow-glow-green transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></div>
                  {t("Resetting...")}
                </>
              ) : (
                t("Reset Password")
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-10 pb-10 text-center bg-card">
            <div className="luxury-divider mb-6"></div>
            <p className="text-muted-foreground">
              {t("Back to")}{" "}
              <Link to="/login" className="font-semibold text-accent hover:underline transition-colors">
                {t("Sign In")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


