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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <Home style={{ width: "24px", height: "24px", color: "white" }} />
            </div>
            <span className="auth-logo-text">Ethio-Home</span>
          </Link>

          <h1 className="auth-title">{t("Reset Password")}</h1>
          <p className="auth-subtitle">{t("Enter and confirm your new password")}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {message && <div className="form-success">{message}</div>}
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t("New Password")}
            </label>
            <div className="form-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("Enter new password")}
                className="form-input"
                style={{ paddingRight: "48px" }}
                autoComplete="new-password"
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
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              {t("Confirm Password")}
            </label>
            <div className="form-input-container">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                id="passwordConfirm"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder={t("Confirm new password")}
                className="form-input"
                style={{ paddingRight: "48px" }}
                autoComplete="new-password"
                required
              />
              <Lock />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="password-toggle"
              >
                {showPasswordConfirm ? (
                  <EyeOff style={{ width: "20px", height: "20px" }} />
                ) : (
                  <Eye style={{ width: "20px", height: "20px" }} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                {t("Resetting...")}
              </>
            ) : (
              t("Reset Password")
            )}
          </button>
        </form>

        <div className="auth-link">
          <span className="auth-link-text">
            {t("Back to")}
            <Link to="/login" className="auth-link-button">
              {t("Sign In")}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


