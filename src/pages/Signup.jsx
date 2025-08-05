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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <Home style={{ width: "24px", height: "24px", color: "white" }} />
            </div>
            <span className="auth-logo-text">Ethio-Home</span>
          </Link>

          <h1 className="auth-title">{t("Create Account")}</h1>
          <p className="auth-subtitle">
            {t("Join Ethio-Home and start your real estate journey")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-success">
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              {t("Full Name")}
            </label>
            <div className="form-input-container">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("Enter your full name")}
                className={`form-input ${formErrors.name ? 'error' : ''}`}
                autoComplete="name"
                required
              />
              <User />
            </div>
            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
          </div>

          <div className="form-group-row">
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
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                autoComplete="email"
                required
              />
                                  <Mail />
                </div>
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                {t("Phone Number")}
              </label>
              <div className="form-input-container">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("+251 911 123 456")}
                  className={`form-input ${formErrors.phone ? 'error' : ''}`}
                  autoComplete="tel"
                  required
                />
                <Phone />
              </div>
              {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              {t("Location")}
            </label>
            <div className="form-input-container">
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t("e.g., Bole, Addis Ababa")}
                className={`form-input ${formErrors.location ? 'error' : ''}`}
                autoComplete="address-line1"
                required
              />
              <MapPin />
            </div>
            {formErrors.location && <div className="error-message">{formErrors.location}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              {t("Full Address")}
            </label>
            <div className="form-input-container">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t("Enter your full address")}
                className={`form-input ${formErrors.address ? 'error' : ''}`}
                autoComplete="address-line2"
                required
              />
              <MapPin />
            </div>
            {formErrors.address && <div className="error-message">{formErrors.address}</div>}
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                {t("City")}
              </label>
              <div className="form-input-container">
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t("Enter your city")}
                  className={`form-input ${formErrors.city ? 'error' : ''}`}
                  autoComplete="address-level2"
                  required
                />
                <MapPin />
              </div>
              {formErrors.city && <div className="error-message">{formErrors.city}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="state" className="form-label">
                {t("State/Region")}
              </label>
              <div className="form-input-container">
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder={t("Enter your state or region")}
                  className={`form-input ${formErrors.state ? 'error' : ''}`}
                  autoComplete="address-level1"
                  required
                />
                <MapPin />
              </div>
              {formErrors.state && <div className="error-message">{formErrors.state}</div>}
            </div>
          </div>

          <div className="form-group">
            <div className="selected-role-info">
              <div className="selected-role-header">
                <ShoppingCart className="selected-role-icon" />
                <div>
                  <div className="selected-role-title">
                    {t("Property Buyer Account")}
                  </div>
                  <div className="selected-role-description">
                    {t("You're creating a buyer account to search and purchase properties.")}
                  </div>
                </div>
              </div>
              <div className="role-note">
                <strong>{t("Note")}:</strong>{" "}
                {t(
                  "Other account types (Seller, Agent, Employee) are created by administrators only. If you need a different account type, please contact our support team."
                )}
              </div>
            </div>
          </div>

          <div className="form-group-row">
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
                  placeholder={t("Create password")}
                  className={`form-input ${formErrors.password ? 'error' : ''}`}
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
                {formErrors.password && <div className="error-message">{formErrors.password}</div>}
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
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder={t("Confirm password")}
                  className={`form-input ${formErrors.passwordConfirm ? 'error' : ''}`}
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
                {formErrors.passwordConfirm && <div className="error-message">{formErrors.passwordConfirm}</div>}
              </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                {t("Creating Account...")}
              </>
            ) : (
              t("Create Account")
            )}
          </button>
        </form>

        <div className="auth-link">
          <span className="auth-link-text">
            {t("Already have an account?")}
            <Link to="/login" className="auth-link-button">
              {t("Sign in here")}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;