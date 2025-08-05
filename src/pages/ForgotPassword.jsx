import { Home, Mail } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";


const ForgotPassword = () => {
  const { t } = useLanguage();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setMessage(t(result.data?.message || "Password reset email sent"));
      } else {
        setError(t(result.error || "Failed to send reset email"));
      }
    } catch (err) {
      setError(t("An unexpected error occurred. Please try again."));
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

          <h1 className="auth-title">{t("Forgot Password")}</h1>
          <p className="auth-subtitle">
            {t("Enter your email address and we'll send you a reset link")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {message && <div className="form-success">{message}</div>}
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t("Email Address")}
            </label>
            <div className="form-input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("Enter your email")}
                className="form-input"
                autoComplete="email"
                required
              />
              <Mail />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                {t("Sending...")}
              </>
            ) : (
              t("Send Reset Link")
            )}
          </button>
        </form>

        <div className="auth-link">
          <span className="auth-link-text">
            {t("Remembered your password?")}
            <Link to="/login" className="auth-link-button">
              {t("Back to Sign In")}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;


