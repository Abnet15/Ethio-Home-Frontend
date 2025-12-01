import {
  User,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Camera,
  ArrowLeft,
  Upload,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { authService } from "@/services/authService";
import { userService } from "@/services/userService";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getUserPhotoFromResponse } from "../utils/imageUtils";
import { getUserPhotoUrl } from "../utils/photoUtils";

const Profile = () => {
  const {
    user,
    updateProfile,
    updatePassword,
    updateUserPhoto,
    refreshUserData,
  } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    photo: user?.photo || "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Check URL parameters for tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "photo") {
      setActiveTab("photo");
    }
  }, [location.search]);

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
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Please enter a valid Ethiopian phone number";
    }

    // Location validation
    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    // State validation
    if (!formData.state.trim()) {
      errors.state = "State is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Photo upload functions
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size must be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a photo to upload");
      return;
    }

    setPhotoLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);

      const result = await userService.uploadPhoto(formData);

      if (result.success) {
        setMessage("Photo uploaded successfully!");
        setSelectedFile(null);
        setPhotoPreview(null); // Clear the preview since we'll use backend URL

        // Update user state in AuthContext with the complete user data from backend
        const updatedUserData = result.data.data.user;
        if (updatedUserData) {
          //console.log("Updating user with backend data:", updatedUserData);
          await updateUserPhoto(updatedUserData);

          // Force a re-fetch to ensure we have the latest data
          const refreshResult = await refreshUserData();
          if (refreshResult.success) {
            console.log(
              "User data refreshed successfully:",
              refreshResult.user
            );
          }
        } else {
          console.warn(
            "No user data in upload response, falling back to refresh"
          );
          // Fallback: refresh user data from server
          await refreshUserData();
        }
      } else {
        setMessage(result.error || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("An error occurred while uploading photo");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (
      !window.confirm("Are you sure you want to remove your profile photo?")
    ) {
      return;
    }

    setPhotoLoading(true);
    setMessage("");

    try {
      const result = await userService.removePhoto();

      if (result.success) {
        setMessage("Photo removed successfully!");

        // Update user state in AuthContext with the complete user data from backend
        const  updatedUserData = result.data.data.user;
        
        if (updatedUserData) {
          console.log("Updating user after photo removal:", updatedUserData);
          await updateUserPhoto(updatedUserData);

          // Force a re-fetch to ensure we have the latest data
          const refreshResult = await refreshUserData();
          if (refreshResult.success) {
            console.log(
              "User data refreshed successfully after removal:",
              refreshResult.user
            );
          }
        } else {
          console.warn(
            "No user data in remove response, falling back to refresh"
          );
          // Fallback: refresh user data from server
          await refreshUserData();
        }
      } else {
        setMessage(result.error || "Failed to remove photo");
      }
    } catch (error) {
      console.error("Remove photo error:", error);
      setMessage("An error occurred while removing photo");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage("");
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setPasswordMessage("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate form before submission
    if (!validateForm()) {
      setMessage("Please fix the errors in the form");
      setLoading(false);
      return;
    }

    try {
      const result = await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        photo: formData.photo.trim(),
      });
      console.log("here is bro🤣😃🤣🤣😂")
      if (result.success) {
        setMessage("Profile updated successfully!");
        setIsEditing(false);
        setFormErrors({});
      } else {
        setMessage(result.error || "Failed to update profile");
      }
    } catch (error) {
      setMessage("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage("");

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New password and confirm password do not match");
      setPasswordLoading(false);
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters long");
      setPasswordLoading(false);
      return;
    }

    try {
      const result = await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      if (result.success) {
        setPasswordMessage("Password updated successfully!");
        setIsPasswordEditing(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordMessage(result.error || "Failed to update password");
      }
    } catch (error) {
      setPasswordMessage("An error occurred while updating password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      photo: user?.photo || "",
    });
    setIsEditing(false);
    setMessage("");
    setFormErrors({});
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordEditing(false);
    setPasswordMessage("");
    setShowPasswords({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Back Button */}
        <div className="profile-back-button">
          <button onClick={handleBack} className="back-btn">
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {(() => {
              const photoUrl = getUserPhotoFromResponse(user);
              if (photoUrl) {
                return (
                  <img
                    src={photoUrl}
                    alt={user.name}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid var(--border-primary)",
                    }}
                  />
                );
              }
              return <User size={64} />;
            })()}
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-role">{user.role}</p>
          </div>
          <button
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X size={20} /> : <Edit size={20} />}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={16} />
            Profile Information
          </button>
          <button
            className={`tab-button ${activeTab === "photo" ? "active" : ""}`}
            onClick={() => setActiveTab("photo")}
          >
            <Camera size={16} />
            Profile Photo
          </button>
          <button
            className={`tab-button ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            <Lock size={16} />
            Change Password
          </button>
        </div>

        {message && (
          <div
            className={`message ${
              message.includes("success") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile Information Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  <User size={16} />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={formErrors.name ? "error" : ""}
                  required
                />
                {formErrors.name && (
                  <div className="error-message">{formErrors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={formErrors.email ? "error" : ""}
                  required
                />
                {formErrors.email && (
                  <div className="error-message">{formErrors.email}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={formErrors.phone ? "error" : ""}
                  placeholder="+251 911 123 456"
                  required
                />
                {formErrors.phone && (
                  <div className="error-message">{formErrors.phone}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  <MapPin size={16} />
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={formErrors.location ? "error" : ""}
                  placeholder="e.g., Bole, Addis Ababa"
                  required
                />
                {formErrors.location && (
                  <div className="error-message">{formErrors.location}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">
                  <MapPin size={16} />
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={formErrors.address ? "error" : ""}
                  placeholder="Enter your full address"
                  required
                />
                {formErrors.address && (
                  <div className="error-message">{formErrors.address}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="city">
                  <MapPin size={16} />
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={formErrors.city ? "error" : ""}
                  placeholder="Enter your city"
                  required
                />
                {formErrors.city && (
                  <div className="error-message">{formErrors.city}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="state">
                <MapPin size={16} />
                State/Region *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={formErrors.state ? "error" : ""}
                placeholder="Enter your state or region"
                required
              />
              {formErrors.state && (
                <div className="error-message">{formErrors.state}</div>
              )}
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Photo Upload Tab */}
        {activeTab === "photo" && (
          <div className="photo-upload-section">
            <div className="current-photo">
              <h3>Current Profile Photo</h3>
              <div className="photo-display">
                {user.photo && user.photo !== "default.png" ? (
                  <img
                    src={getUserPhotoFromResponse(user)}
                    alt="Current profile"
                  />
                ) : (
                  <div className="no-photo">
                    <User size={64} />
                    <p>No profile photo</p>
                  </div>
                )}
              </div>
              {user.photo && user.photo !== "default.png" && (
                <button
                  className="btn btn-danger"
                  onClick={handleRemovePhoto}
                  disabled={photoLoading}
                >
                  <Trash2 size={16} />
                  {photoLoading ? "Removing..." : "Remove Photo"}
                </button>
              )}
            </div>

            <div className="upload-new-photo">
              <h3>Upload New Photo</h3>
              <div className="upload-area">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <label htmlFor="photo-upload" className="upload-button">
                  <Upload size={24} />
                  <span>Choose Image</span>
                  <small>Max size: 5MB</small>
                </label>
              </div>

              {photoPreview && (
                <div className="photo-preview">
                  <h4>Preview</h4>
                  <img src={photoPreview} alt="Preview" />
                  <button
                    className="btn btn-primary"
                    onClick={handlePhotoUpload}
                    disabled={photoLoading}
                  >
                    {photoLoading ? "Uploading..." : "Upload Photo"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Change Tab */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">
                <Lock size={16} />
                Current Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.currentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("currentPassword")}
                >
                  {showPasswords.currentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="newPassword">
                  <Lock size={16} />
                  New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <Lock size={16} />
                  Confirm New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`message ${
                  passwordMessage.includes("success") ? "success" : "error"
                }`}
              >
                {passwordMessage}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePasswordCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
