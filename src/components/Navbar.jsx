import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
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
  LogOut,
  ChevronDown,
  Check,
  ShieldCheck,
  Sparkles,
  Heart,
  PlusCircle,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import MessageNotification from "./MessageNotification";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  getUserPhotoFromResponse,
  hasValidUserPhoto,
  handleUserPhotoError,
} from "../utils/imageUtils";

/**
 * World-Class Luxury PropTech Navigation for Ethio-Home
 * Strictly adheres to Ethiopian Luxury Design System:
 * Emerald: #0B6E4F | Gold: #D4A017 | Dark: #0B0F0D / #141A17 | Cream: #F8F4EC
 *
 * Responsiveness Rule:
 * - Desktop & Wide View (>= 440px): Full desktop navigation bar with links & controls, ZERO hamburger.
 * - Mobile Phone View (< 440px): Compact header with Theme Toggle + Hamburger drawer button.
 */
const Navbar = () => {
  const { t, currentLanguage, switchLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Responsive state guaranteeing correct mode even with browser zoom/Windows scaling
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 440 : true
  );

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 440;
      setIsDesktop(desktop);
      if (desktop) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const langMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close all menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLanguageMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key to dismiss menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsLanguageMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    if (window.confirm(t("Are you sure you want to log out?"))) {
      logout();
      navigate("/");
    }
  };

  const navItems = [
    { to: "/", label: t("home") || "Home", icon: Home },
    { to: "/properties", label: t("properties") || "Properties", icon: Building2 },
    { to: "/about", label: t("about") || "About", icon: Info },
    ...(user?.role !== "admin"
      ? [{ to: "/contact", label: t("contact") || "Contact", icon: Phone }]
      : []),
  ];

  const isCurrentActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const userPhoto = getUserPhotoFromResponse(user);
  const hasPhoto = hasValidUserPhoto(user) && userPhoto;

  const getRoleDashboardPath = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "seller":
        return "/seller/dashboard";
      case "agent":
        return "/agent/dashboard";
      case "buyer":
        return "/buyer/dashboard";
      case "employee":
        return "/employee/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#F8F4EC]/95 dark:bg-[#0B0F0D]/95 backdrop-blur-xl border-b border-[#E5E0D8] dark:border-[#2A342E] transition-colors duration-200">
        {/* Subtle Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A017] dark:via-[#EAB308] to-transparent opacity-85" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Brand Logo with Ethiopian Soul */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0B6E4F] via-[#095C42] to-[#043324] dark:from-[#10B981] dark:via-[#0B6E4F] dark:to-[#043324] flex items-center justify-center text-white shadow-md group-hover:shadow-[0_0_20px_rgba(212,160,23,0.35)] transition-all duration-300">
                <Home className="w-5 h-5 text-[#F8F4EC] transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-base sm:text-lg lg:text-xl font-black tracking-tight text-[#1A1A1A] dark:text-[#F8F4EC]">
                    Ethio<span className="text-[#0B6E4F] dark:text-[#10B981]">-Home</span>
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#D4A017] dark:bg-[#EAB308] animate-pulse" />
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#6B7280] dark:text-[#6B7A73]">
                  {currentLanguage === "am" ? "የተረጋገጠ ሪል እስቴት" : "Verified PropTech"}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Rendered when width >= 600px, hidden on mobile) */}
            {isDesktop ? (
              <nav className="ethio-desktop-nav flex items-center gap-1 lg:gap-2 bg-[#F0EDE6]/80 dark:bg-[#1C2420]/80 p-1 rounded-xl border border-[#E5E0D8] dark:border-[#2A342E]">
                {navItems.map((item) => {
                  const active = isCurrentActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="relative px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200"
                    >
                      <span
                        className={`relative z-10 transition-colors ${
                          active
                            ? "text-[#0B6E4F] dark:text-[#10B981] font-bold"
                            : "text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]"
                        }`}
                      >
                        {item.label}
                      </span>
                      {active && (
                        <motion.div
                          layoutId="navbar-active-pill"
                          className="absolute inset-0 bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 rounded-lg border border-[#0B6E4F]/25 dark:border-[#10B981]/30 shadow-xs"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            ) : null}

            {/* Desktop Right Controls: Language, Theme, Auth (Rendered when width >= 600px) */}
            {isDesktop ? (
              <div className="ethio-desktop-nav flex items-center gap-2 lg:gap-3 flex-shrink-0">
                {/* Message Notification (if authenticated) */}
                {isAuthenticated && <MessageNotification />}

                {/* Language Switcher Dropdown */}
                <div className="relative" ref={langMenuRef}>
                  <button
                    onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-bold text-[#1A1A1A] dark:text-[#F8F4EC] hover:border-[#D4A017] dark:hover:border-[#EAB308] transition-all cursor-pointer shadow-xs"
                    aria-label="Select Language"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#D4A017] dark:text-[#EAB308]" />
                    <span>{currentLanguage === "am" ? "አማርኛ" : "English"}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  <AnimatePresence>
                    {isLanguageMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-xl p-1.5 z-50"
                      >
                        <button
                          onClick={() => {
                            switchLanguage("en");
                            setIsLanguageMenuOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            currentLanguage === "en"
                              ? "bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] font-bold"
                              : "text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]"
                          }`}
                        >
                          <span>English</span>
                          {currentLanguage === "en" && <Check className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />}
                        </button>
                        <button
                          onClick={() => {
                            switchLanguage("am");
                            setIsLanguageMenuOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            currentLanguage === "am"
                              ? "bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] font-bold"
                              : "text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]"
                          }`}
                        >
                          <span>አማርኛ</span>
                          {currentLanguage === "am" && <Check className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] dark:hover:text-[#10B981] hover:border-[#0B6E4F]/40 dark:hover:border-[#10B981]/40 transition-all shadow-xs cursor-pointer"
                  aria-label="Toggle Theme"
                >
                  {theme === "light" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4 text-[#EAB308]" />
                  )}
                </button>

                {/* Authenticated User Menu or Guest Auth Buttons */}
                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] hover:border-[#0B6E4F] dark:hover:border-[#10B981] transition-all cursor-pointer shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0B6E4F]/10 dark:bg-[#10B981]/10 flex items-center justify-center">
                        {hasPhoto ? (
                          <img
                            src={userPhoto}
                            alt={user?.name || "User"}
                            className="w-full h-full object-cover"
                            onError={(e) => handleUserPhotoError(e)}
                          />
                        ) : (
                          <User className="w-4 h-4 text-[#0B6E4F] dark:text-[#10B981]" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F8F4EC] max-w-[100px] truncate">
                        {user?.name || "Account"}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#0B6E4F]/10 text-[#0B6E4F] dark:text-[#10B981]">
                        {user?.role || "user"}
                      </span>
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-2xl p-2 z-50 overflow-hidden"
                        >
                          {/* User Header */}
                          <div className="p-3 bg-[#F0EDE6] dark:bg-[#1C2420] rounded-xl mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#0B6E4F]/10 dark:bg-[#10B981]/10 flex items-center justify-center border border-[#0B6E4F]/30 dark:border-[#10B981]/30 flex-shrink-0">
                              {hasPhoto ? (
                                <img
                                  src={userPhoto}
                                  alt={user?.name || "User"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => handleUserPhotoError(e)}
                                />
                              ) : (
                                <User className="w-5 h-5 text-[#0B6E4F] dark:text-[#10B981]" />
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-[#1A1A1A] dark:text-[#F8F4EC] truncate">
                                {user?.name}
                              </p>
                              <p className="text-xs text-[#6B7280] dark:text-[#A8B5AE] truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <Link
                              to={getRoleDashboardPath()}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] dark:hover:text-[#10B981] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] rounded-xl transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-[#0B6E4F] dark:text-[#10B981]" />
                              <span>{t("dashboard") || "Dashboard"}</span>
                            </Link>

                            <Link
                              to="/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] dark:hover:text-[#10B981] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] rounded-xl transition-colors"
                            >
                              <UserCircle className="w-4 h-4" />
                              <span>{t("personalProfile") || "Profile"}</span>
                            </Link>

                            {(user?.role === "seller" || user?.role === "agent" || user?.role === "admin") && (
                              <Link
                                to="/my-listings"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] dark:hover:text-[#10B981] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] rounded-xl transition-colors"
                              >
                                <Building2 className="w-4 h-4 text-[#D4A017] dark:text-[#EAB308]" />
                                <span>{t("myListings") || "My Listings"}</span>
                              </Link>
                            )}

                            <Link
                              to="/favorites"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] dark:hover:text-[#10B981] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] rounded-xl transition-colors"
                            >
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>{t("favorites") || "Favorites"}</span>
                            </Link>

                            <Link
                              to="/messages"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] dark:hover:text-[#10B981] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] rounded-xl transition-colors"
                            >
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                              <span>{t("messages") || "Messages"}</span>
                            </Link>
                          </div>

                          <div className="h-[1px] bg-[#E5E0D8] dark:bg-[#2A342E] my-2" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-[#C45C26] hover:bg-[#C45C26]/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t("logout") || "Log Out"}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate("/login")}
                      className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-[#F8F4EC] hover:text-[#0B6E4F] dark:hover:text-[#10B981] transition-colors cursor-pointer"
                    >
                      {t("login") || "Log In"}
                    </button>
                    <button
                      onClick={() => navigate("/signup")}
                      className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] text-white shadow-md hover:shadow-[0_0_20px_rgba(212,160,23,0.35)] transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                      <span>{t("signup") || "Sign Up"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Mobile Controls: Theme + Hamburger Toggle (Rendered ONLY on phone screens < 600px) */}
            {!isDesktop ? (
              <div className="ethio-mobile-toggle flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] cursor-pointer"
                  aria-label="Toggle Theme"
                >
                  {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#EAB308]" />}
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2.5 rounded-xl bg-[#0B6E4F] text-white transition-all shadow-md active:scale-95 cursor-pointer"
                  aria-label="Toggle Navigation Menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Only mounted when opened on mobile screens) */}
      {!isDesktop && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop Dimmer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm ethio-mobile-drawer z-[99998]"
              />

              {/* Slide-over Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-[#F8F4EC] dark:bg-[#0B0F0D] ethio-mobile-drawer z-[99999] border-l border-[#E5E0D8] dark:border-[#2A342E] shadow-2xl flex flex-col justify-between overflow-y-auto p-5"
              >
                <div>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#E5E0D8] dark:border-[#2A342E] mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B6E4F] to-[#043324] flex items-center justify-center text-white">
                        <Home className="w-4 h-4" />
                      </div>
                      <span className="font-sans text-base font-black tracking-tight text-[#1A1A1A] dark:text-[#F8F4EC]">
                        Ethio<span className="text-[#0B6E4F] dark:text-[#10B981]">-Home</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#F8F4EC] cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1.5 mb-5">
                    {navItems.map((item) => {
                      const active = isCurrentActive(item.to);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            active
                              ? "bg-[#0B6E4F] text-white shadow-md"
                              : "text-[#4B5563] dark:text-[#A8B5AE] hover:bg-white dark:hover:bg-[#141A17]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Language Switcher */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] mb-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#6B7A73] uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#D4A017] dark:text-[#EAB308]" /> Language / ቋንቋ
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => switchLanguage("en")}
                        className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          currentLanguage === "en"
                            ? "bg-[#0B6E4F] text-white shadow-sm"
                            : "bg-[#F0EDE6] dark:bg-[#1C2420] text-[#4B5563] dark:text-[#A8B5AE]"
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => switchLanguage("am")}
                        className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          currentLanguage === "am"
                            ? "bg-[#0B6E4F] text-white shadow-sm"
                            : "bg-[#F0EDE6] dark:bg-[#1C2420] text-[#4B5563] dark:text-[#A8B5AE]"
                        }`}
                      >
                        አማርኛ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer: Authenticated or Guest */}
                <div className="pt-4 border-t border-[#E5E0D8] dark:border-[#2A342E]">
                  {isAuthenticated ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#141A17] rounded-xl border border-[#E5E0D8] dark:border-[#2A342E]">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#0B6E4F]/10 dark:bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                          {hasPhoto ? (
                            <img
                              src={userPhoto}
                              alt={user?.name || "User"}
                              className="w-full h-full object-cover"
                              onError={(e) => handleUserPhotoError(e)}
                            />
                          ) : (
                            <User className="w-4 h-4 text-[#0B6E4F] dark:text-[#10B981]" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#1A1A1A] dark:text-[#F8F4EC] truncate">
                            {user?.name}
                          </p>
                          <p className="text-[10px] text-[#6B7280] dark:text-[#6B7A73] truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={getRoleDashboardPath()}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#F8F4EC]"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                          <span>{t("dashboard") || "Dashboard"}</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#F8F4EC]"
                        >
                          <UserCircle className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                          <span>{t("personalProfile") || "Profile"}</span>
                        </Link>
                      </div>

                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold text-[#C45C26] bg-[#C45C26]/10 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("logout") || "Log Out"}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate("/login");
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold border border-[#E5E0D8] dark:border-[#2A342E] bg-white dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#F8F4EC] cursor-pointer"
                      >
                        {t("login") || "Log In"}
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate("/signup");
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0B6E4F] hover:bg-[#095C42] text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                        <span>{t("signup") || "Sign Up"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Navbar;
