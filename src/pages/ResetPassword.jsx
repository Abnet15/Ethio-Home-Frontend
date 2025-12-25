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
    <div className="min-h-screen bg-gradient-to-br from-ethiopian-green via-ethiopian-green/90 to-ethiopian-green flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
          <Link to="/" className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Home className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black">Ethio-Home</span>
          </Link>
          <h1 className="text-3xl font-black mb-2">{t("Reset Password")}</h1>
          <p className="text-white/90">{t("Enter and confirm your new password")}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {message && (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 font-semibold">
              {message}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-foreground">
              {t("New Password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("Enter new password")}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ethiopian-green focus:border-transparent"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-foreground">
              {t("Confirm Password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showPasswordConfirm ? "text" : "password"}
                id="passwordConfirm"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder={t("Confirm new password")}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ethiopian-green focus:border-transparent"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswordConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("Resetting...")}
              </>
            ) : (
              t("Reset Password")
            )}
          </button>
        </form>

        <div className="px-8 pb-8 text-center">
          <p className="text-muted-foreground">
            {t("Back to")}{" "}
            <Link to="/login" className="font-semibold text-ethiopian-green hover:underline">
              {t("Sign In")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


