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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
        
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <Home style={{ width: "24px", height: "24px", color: "white" }} />
            </div>
            <span className="auth-logo-text">Ethio-Home</span>
          </Link>

          <h1 className="auth-title">{t("Sign In")}</h1>
          <p className="auth-subtitle">{t("Welcome back! Please sign in to your account")}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t("Email Address")}
            </label>
            <div className="form-input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("Enter your email")}
                className="form-input"
                autoComplete="email"
                required
              />
              <Mail />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t("Password")}
            </label>
            <div className="form-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("Enter your password")}
                className="form-input"
                style={{ paddingRight: "48px" }}
                autoComplete="current-password"
                required
              />
              <Lock />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <EyeOff style={{ width: "20px", height: "20px" }} />
                ) : (
                  <Eye style={{ width: "20px", height: "20px" }} />
                )}
              </button>
            </div>
            <div className="forgot-password">
              <Link to="/forgot-password" className="forgot-password-link">
                {t("Forgot your password?")}
              </Link>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                {t("Signing in...")}
              </>
            ) : (
              t("Sign In")
            )}
          </button>
        </form>

        <div className="auth-link">
          <span className="auth-link-text">
            {t("Don't have an account?")}
            <Link to="/signup" className="auth-link-button">
              {t("Sign up here")}
            </Link>
            {" "}|{" "}
            <Link to="/forgot-password" className="auth-link-button">
              {t("Forgot Password")}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;