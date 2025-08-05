import {
  Home,
  Building,
  Info,
  Phone,
  User,
  Settings,
  Globe,
  Menu,
  X,
  Sun,
  Moon,
  UserCircle,
  Award,
  Briefcase,
  LogOut,
  Camera,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import MessageNotification from "./MessageNotification";
import PrivateRoute from "./PrivateRoute";
import api from "../config/api";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getUserPhotoFromResponse, hasValidUserPhoto, handleUserPhotoError } from '../utils/imageUtils';
import "../styles/navbar-unbelievable.css";

const Navbar = () => {
  const { t, currentLanguage, switchLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Log authentication state changes for debugging
  useEffect(() => {
    console.log("Navbar auth state changed:", { user: !!user, isAuthenticated });
  }, [user, isAuthenticated]);

  // Force re-render when authentication state changes
  useEffect(() => {
    // This will trigger a re-render when auth state changes
    const handleAuthChange = () => {
      // Force component to re-render
      setIsMobileMenuOpen(false);
      setIsLanguageMenuOpen(false);
      setIsUserMenuOpen(false);
    };

    // Listen for storage events (when auth data changes)
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Close all dropdowns when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLanguageMenuOpen(false);
    setIsUserMenuOpen(false);
    console.log("location: ",location);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    if (window.confirm(t("Are you sure you want to log out?"))) {
      logout();
      navigate("/");
    }
  };

  const navItems = [
    { to: "/", label: t("home"), icon: Home },
    { to: "/properties", label: t("properties"), icon: Building },
    { to: "/about", label: t("about"), icon: Info },
    ...(user?.role !== "admin"
      ? [{ to: "/contact", label: t("contact"), icon: Phone }]
      : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <Home style={{ width: "20px", height: "20px", color: "white" }} />
            </div>
            <span className="navbar-logo-text">Ethio-Home</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={`navbar-nav-item ${location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)) ? 'active' : ''}`}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side - Theme, Language, Auth */}
          <div className="navbar-controls">
            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={
                theme === "light" ? t("Switch to dark mode") : t("Switch to light mode")
              }
            >
              {theme === "light" ? <Moon /> : <Sun />}
            </button>

            {/* Language Switcher */}
            <div className="language-dropdown">
              <button
                className="language-trigger"
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              >
                <Globe style={{ width: "16px", height: "16px" }} />
                <span>{currentLanguage.toUpperCase()}</span>
              </button>
              <div
                className={`language-menu ${isLanguageMenuOpen ? "" : "hidden"}`}
              >
                <button
                  className="language-menu-item"
                  onClick={() => {
                    switchLanguage("en");
                    setIsLanguageMenuOpen(false);
                  }}
                >
                  {t("English")}
                </button>
                <button
                  className="language-menu-item"
                  onClick={() => {
                    switchLanguage("am");
                    setIsLanguageMenuOpen(false);
                  }}
                >
                  {t("Amharic")}
                </button>
              </div>
            </div>

            {/* Message Notification */}
            {isAuthenticated && <MessageNotification />}

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="user-dropdown">
                <button
                  className="user-trigger"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onMouseEnter={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  /* onMouseLeave={() => setIsUserMenuOpen(!isUserMenuOpen)} */
                >
                  {(() => {
                    const photoUrl = getUserPhotoFromResponse(user);
                    if (hasValidUserPhoto(user) && photoUrl) {
                      return (
                        <>
                          <img
                            src={photoUrl}
                            alt={user.name}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              objectFit: "cover",
                              marginRight: 8,
                            }}
                            onError={(e) => handleUserPhotoError(e)}
                          />
                          <User
                            style={{ 
                              width: "16px", 
                              height: "16px", 
                              marginRight: 8,
                              display: 'none'
                            }}
                          />
                        </>
                      );
                    }
                    return (
                      <User
                        style={{ width: "16px", height: "16px", marginRight: 8 }}
                      />
                    );
                  })()}
                  <span>{user?.name || t("User")}</span>
                </button>
                <div className={`user-menu ${isUserMenuOpen ? "" : "hidden"}`}>
                  {/* User Profile Header */}
                  <div className="user-menu-header">
                    <div className="user-menu-avatar">
                      {(() => {
                        const photoUrl = getUserPhotoFromResponse(user);
                        if (hasValidUserPhoto(user) && photoUrl) {
                          return (
                            <>{console.log("photoUrl 😁😁😁😁☺☺☺☺😚😚😶😑😑😑😐",photoUrl)};
                              <img
                                src={photoUrl}
                                alt={user.name}
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  console.warn('User photo failed to load:', photoUrl);
                                  handleUserPhotoError(e);
                                  // Hide the image and show fallback icon
                                  e.target.style.display = 'none';
                                  const fallbackIcon = e.target.nextElementSibling;
                                  if (fallbackIcon) {
                                    fallbackIcon.style.display = 'inline';
                                  }
                                }}
                              />
                              <User
                                style={{ 
                                  width: 48, 
                                  height: 48,
                                  color: '#6b7280',
                                  display: 'none'
                                }}
                              />
                            </>
                          );
                        }
                        return (
                          <User
                            style={{ 
                              width: 48, 
                              height: 48,
                              color: '#6b7280'
                            }}
                          />
                        );
                      })()}
                    </div>
                    <div className="user-menu-info">
                      <div className="user-menu-name">{user?.name || t("User")}</div>
                      <div className="user-menu-email">{user?.email}</div>
                      <div className="user-menu-role">{user?.role}</div>
                    </div>
                  </div>
                  
                  <div className="user-menu-divider"></div>
                  
                  <Link
                    to="/dashboard"
                    className="user-menu-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings />
                    {t("dashboard")}
                  </Link>
                  <Link
                    to="/profile"
                    className="user-menu-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <UserCircle />
                    {t("Personal Profile")}
                  </Link>
                  <Link
                    to="/profile?tab=photo"
                    className="user-menu-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Camera />
                    {t("Upload Photo")}
                  </Link>{/* 
                 {( user.role=="agent" ? <Link
                    to="/professional-profile"
                    className="user-menu-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Award />
                    {t("Agent Profile")}
                  </Link>
                  : '')} */}
                 {/*  <Link
                    to="/my-listings"
                    className="user-menu-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Briefcase />
                    {t("My Listings")}
                  </Link> */}
                  <button
                    className="user-menu-item"
                    onClick={handleLogout}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <LogOut />
                    {t("Logout")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate("/login")}
                >
                  {t("login")}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate("/signup")}
                >
                  {t("signup")}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <X style={{ width: "20px", height: "20px" }} />
            ) : (
              <Menu style={{ width: "20px", height: "20px" }} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? "" : "hidden"}`}>
          <div className="mobile-nav-content">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="mobile-nav-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Mobile Theme Toggle */}
            <button
              className="mobile-nav-item"
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              style={{
                border: "none",
                background: "none",
                width: "100%",
                textAlign: "left",
              }}
            >
              {theme === "light" ? <Moon /> : <Sun />}
              <span>
                {theme === "light" ? t("Dark Mode") : t("Light Mode")}
              </span>
            </button>

            {/* Mobile Language Switcher */}
            <div className="mobile-language">
              <div className="mobile-language-content">
                <Globe style={{ width: "16px", height: "16px" }} />
                <select
                  value={currentLanguage}
                  onChange={(e) => switchLanguage(e.target.value)}
                >
                  <option value="en">{t("English")}</option>
                  <option value="am">{t("Amharic")}</option>
                </select>
              </div>
            </div>

            {/* Mobile Auth */}
            {isAuthenticated ? (
              <div className="mobile-nav-content">
                {/* Mobile User Info Header */}
                <div className="mobile-user-header">
                  <div className="mobile-user-avatar">
                                          {(() => {
                        const photoUrl = getUserPhotoFromResponse(user);
                        if (hasValidUserPhoto(user) && photoUrl) {
                          return (
                            <>
                              <img
                                src={photoUrl}
                                alt={user.name}
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "2px solid var(--border-primary)"
                                }}
                                onError={(e) => {
                                  console.warn('User photo failed to load:', photoUrl);
                                  handleUserPhotoError(e);
                                  // Hide the image and show fallback icon
                                  e.target.style.display = 'none';
                                  const fallbackIcon = e.target.nextElementSibling;
                                  if (fallbackIcon) {
                                    fallbackIcon.style.display = 'inline';
                                  }
                                }}
                              />
                              <User
                                style={{ 
                                  width: 40, 
                                  height: 40,
                                  color: '#6b7280',
                                  display: 'none'
                                }}
                              />
                            </>
                          );
                        }
                        return (
                          <User
                            style={{ 
                              width: 40, 
                              height: 40,
                              color: '#6b7280'
                            }}
                          />
                        );
                      })()}
                  </div>
                  <div className="mobile-user-info">
                    <div className="mobile-user-name">{user?.name || t("User")}</div>
                    <div className="mobile-user-email">{user?.email}</div>
                  </div>
                </div>
                
                <Link
                  to="/dashboard"
                  className="mobile-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings />
                  <span>{t("dashboard")}</span>
                </Link>
                <Link
                  to="/profile"
                  className="mobile-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircle />
                  <span>{t("Personal Profile")}</span>
                </Link>
                <Link
                  to="/profile?tab=photo"
                  className="mobile-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Camera />
                  <span>{t("Upload Photo")}</span>
                </Link>
                <Link
                  to="/professional-profile"
                  className="mobile-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Award />
                  <span>{t("Agent Profile")}</span>
                </Link>
                <Link
                  to="/my-listings"
                  className="mobile-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Briefcase />
                  <span>{t("My Listings")}</span>
                </Link>
                <button
                  className="mobile-nav-item"
                  onClick={handleLogout}
                  style={{
                    border: "none",
                    background: "none",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <LogOut />
                  <span>{t("Logout")}</span>
                </button>
              </div>
            ) : (
              <div className="mobile-auth">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t("login")}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigate("/signup");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t("signup")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;