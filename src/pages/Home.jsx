import {
  Search,
  Home as HomeIcon,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Building,
  Shield,
  ShieldCheck,
  Clock,
  FileCheck,
  MapPin,
  Heart,
  MessageCircle,
  Calendar,
  CreditCard,
  Globe,
  Play,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import { userService } from "@/services/userService";

import PropertyCardEnhanced from "../components/PropertyCardEnhanced";
import HeroVideo from "../components/HeroVideo";
import { PropertyGridShimmer, StatsShimmer, FeatureCardShimmer, TestimonialCardShimmer } from "../components/PremiumShimmer";
import { useLanguage } from "../context/LanguageContext";
import { usePropertiesQuery, usePropertyStatsQuery } from "../hooks/usePropertiesQuery";
import { reviewService } from "../services/reviewService";
import { useQuery } from "@tanstack/react-query";

import "../styles/properties.css";

// Spring-physics animated counter for stats
const SpringCounter = ({ value }) => {
  const numMatch = value.match(/\d+/g);
  const target = numMatch ? parseInt(numMatch.join(""), 10) : null;
  const suffix = value.replace(/[\d,]/g, "");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === null || isNaN(target)) return;
    let startTime = null;
    const duration = 1800;
    const step = (now) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.floor(ease * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };
    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target]);

  if (target === null || isNaN(target)) {
    return <span>{value}</span>;
  }

  return (
    <span>
      {current.toLocaleString()}
      {suffix}
    </span>
  );
};

const Home = () => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  // Use React Query to fetch properties
  const { data: propertiesData, isLoading: propertiesLoading, error: propertiesError } = usePropertiesQuery(
    { isVerified: true },
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  );
  
  // Use React Query to fetch property stats
  const { data: statsData, isLoading: statsLoading } = usePropertyStatsQuery();
  
  // Use React Query to fetch testimonials
  const { data: testimonialsData, isLoading: testimonialsLoading, error: testimonialsError } = useQuery({
    queryKey: ['reviews', 'website-service', 6],
    queryFn: async () => {
      const result = await reviewService.getWebsiteServiceReviews(6);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch testimonials');
      }
      return result.data?.data?.reviews || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const properties = propertiesData?.properties || [];
  const testimonials = testimonialsData || [];
  const loading = {
    properties: propertiesLoading,
    testimonials: testimonialsLoading,
  };
  const error = {
    properties: propertiesError?.message || "",
    testimonials: testimonialsError?.message || "",
  };

  // Calculate stats from properties data
  const [stats, setStats] = useState([
    { icon: Building, label: t("Properties Listed"), value: "Loading..." },
    { icon: Users, label: t("Happy Clients"), value: "Loading..." },
    { icon: CheckCircle, label: t("Verified Properties"), value: "Loading..." },
    { icon: Shield, label: t("Secure Transactions"), value: "100%" },
  ]);

  const featuredProperties = useMemo(() => properties.slice(0, 6), [properties]);

  // Scroll-based parallax
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  // Load stats from database using React Query
  const { data: allPropertiesData } = usePropertiesQuery({ limit: 500 }, { enabled: !statsLoading });
  const { data: usersData } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const usersRes = await userService.getUsers();
          if (usersRes.success) {
            return usersRes.data?.results || usersRes.data?.total || usersRes.data?.data?.results || 0;
          }
        } catch (_) {}
      }
      const props = allPropertiesData?.properties || [];
      const uniqueOwners = new Set(props.map((p) => p.owner?._id || p.owner || "").filter(Boolean));
      return Math.max(250, uniqueOwners.size);
    },
    enabled: !statsLoading,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!statsLoading && allPropertiesData) {
      const props = allPropertiesData.properties || [];
      const propertiesCount = props.length;
      const verifiedCount = props.filter((p) => p.isVerified || p.status === "approved").length;
      const verifiedPercentage = propertiesCount > 0 ? Math.round((verifiedCount / propertiesCount) * 100) : 0;
      const usersCount = usersData || 0;

      setStats([
        { icon: Building, label: "Properties Listed", value: `${propertiesCount.toLocaleString()}+` },
        { icon: Users, label: "Happy Clients", value: `${usersCount.toLocaleString()}+` },
        { icon: CheckCircle, label: "Verified Properties", value: `${verifiedPercentage}%` },
        { icon: Shield, label: "Secure Transactions", value: "100%" },
      ]);
    }
  }, [statsLoading, allPropertiesData, usersData]);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) queryParams.append("search", searchQuery.trim());
    if (locationFilter) queryParams.append("location", locationFilter);
    if (typeFilter) queryParams.append("type", typeFilter);
    if (priceFilter) queryParams.append("price", priceFilter);
    if (activeTab && activeTab !== "all") {
      queryParams.append("status", activeTab === "rent" ? "for-rent" : "for-sale");
    }
    navigate(`/properties?${queryParams.toString()}`);
  };

  const verificationSteps = [
    { icon: FileCheck, title: t("Document Verification"), description: t("All property documents are thoroughly checked for authenticity and legal compliance") },
    { icon: MapPin, title: t("Physical Inspection"), description: t("Our certified inspectors visit and verify the actual property condition and location") },
    { icon: Shield, title: t("Owner Verification"), description: t("Property owners undergo identity verification and ownership confirmation") },
    { icon: CheckCircle, title: t("Final Approval"), description: t("Only verified properties receive our trust badge and are listed on the platform") },
  ];

  const platformFeatures = [
    { icon: Search, title: t("Advanced Search"), description: t("Find properties with powerful filters including location, price, type, and amenities") },
    { icon: Heart, title: t("Save Favorites"), description: t("Create your wishlist and get notified about price changes and similar properties") },
    { icon: MessageCircle, title: t("Direct Communication"), description: t("Chat directly with property owners and agents through our secure messaging system") },
    { icon: Calendar, title: t("Schedule Visits"), description: t("Book property visits at your convenience with our integrated scheduling system") },
    { icon: CreditCard, title: t("Secure Payments"), description: t("Complete transactions safely with multiple payment options and escrow protection") },
    { icon: Globe, title: t("Bilingual Support"), description: t("Full support in English and Amharic to serve all Ethiopian property seekers") },
  ];

  const howItWorksSteps = [
    { step: 1, title: t("Search Properties"), description: t("Browse through our extensive collection of verified properties using advanced filters"), icon: Search },
    { step: 2, title: t("Schedule Visit"), description: t("Book property visits and connect with our professional agents for guided tours"), icon: Calendar },
    { step: 3, title: t("Secure Purchase"), description: t("Complete your transaction safely with our secure platform and legal support"), icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ============================================
          HERO SECTION - Cinematic Addis Ababa Skyline
          ============================================ */}
      <HeroVideo
        fallbackImages={["/hero-bg-addis.jpg", "/hero-bg-modern.jpg", "/hero-bg-1.jpg"]}
        overlayOpacity={0.65}
        parallaxStrength={0.35}
      >
        <motion.div 
          className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-14 pb-10 sm:pt-18 sm:pb-14 lg:pt-20 lg:pb-16"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <div className="container mx-auto text-center max-w-5xl">
            {/* Trust & Verification Pill Badge */}
            <motion.div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1A211E]/70 dark:bg-[#141A17]/80 backdrop-blur-md border border-[#D4A017]/40 dark:border-[#EAB308]/40 mb-3 sm:mb-4 shadow-sm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/95 tracking-wide">
                {t("verifiedBadge") || "100% Legally Verified & Inspected Properties"}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
            </motion.div>

            {/* Main Headline - Strict Design System Typography */}
            <motion.h1
              className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 leading-[1.15] tracking-tight"
              style={{
                textShadow: "0 4px 24px rgba(0,0,0,0.45)",
              }}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {currentLanguage === "am" ? (
                <>
                  በኢትዮጵያ ውስጥ የእርስዎን{" "}
                  <span className="text-[#EAB308] underline decoration-[#EAB308]/40 decoration-wavy underline-offset-8">
                    ፍጹም ቤት
                  </span>{" "}
                  በአስተማማኝ ሁኔታ ያግኙ
                </>
              ) : (
                <>
                  Discover Verified Properties in Ethiopia with{" "}
                  <span className="text-[#EAB308]">
                    Complete Trust
                  </span>
                </>
              )}
            </motion.h1>

            {/* Subheadline - Clear Value Proposition */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto font-normal leading-relaxed tracking-normal"
              style={{ textShadow: "0 2px 14px rgba(0,0,0,0.35)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {currentLanguage === "am"
                ? "በአዲስ አበባ እና በዋና ዋና ከተሞች የተረጋገጡ ቤቶችን፣ አፓርትመንቶችን እና የንግድ ቦታዎችን በህጋዊ ሰነድ እና በአካል ምርመራ ያግኙ።"
                : "Ethiopia's premier PropTech platform for verified residential and commercial real estate. Every listing is physically inspected, document-checked, and escrow-secured."}
            </motion.p>

            {/* Floating Glassmorphic Search Card */}
            <motion.div
              className="w-full max-w-4xl mx-auto bg-white/95 dark:bg-[#141A17]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-white/70 dark:border-[#2A342E] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Buy / Rent / All Filter Tabs */}
              <div className="flex items-center gap-2 mb-6">
                {[
                  { id: "all", label: t("allTypes") || "All" },
                  { id: "buy", label: t("buyTab") || "Buy" },
                  { id: "rent", label: t("rentTab") || "Rent" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-[#0B6E4F] dark:bg-[#10B981] text-white dark:text-[#0F1412] shadow-sm"
                        : "bg-[#F8F4EC] dark:bg-[#242C28] text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC] border border-[#E5E0D8] dark:border-[#2A342E]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Location Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#A8B5AE] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                      {t("location") || "Location"}
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#F8F4EC] dark:bg-[#242C28] border border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#F8F4EC] text-sm focus:outline-none focus:border-[#0B6E4F] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#0B6E4F]/20 dark:focus:ring-[#10B981]/20 transition-all font-medium"
                    >
                      <option value="">{t("allLocations") || "All Locations"}</option>
                      <option value="Addis Ababa">Addis Ababa (ሁሉም)</option>
                      <option value="Bole">Bole (ቦሌ)</option>
                      <option value="Kazanchis">Kazanchis (ካዛንቺስ)</option>
                      <option value="Gerji">Gerji (ገርጂ)</option>
                      <option value="CMC">CMC (ሲኤምሲ)</option>
                      <option value="Old Airport">Old Airport (ኦልድ ኤርፖርት)</option>
                      <option value="Sarbet">Sarbet (ሳርቤት)</option>
                      <option value="Ayat">Ayat (አያት)</option>
                    </select>
                  </div>

                  {/* Property Type Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#A8B5AE] flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                      {t("propertyType") || "Property Type"}
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#F8F4EC] dark:bg-[#242C28] border border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#F8F4EC] text-sm focus:outline-none focus:border-[#0B6E4F] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#0B6E4F]/20 dark:focus:ring-[#10B981]/20 transition-all font-medium"
                    >
                      <option value="">{t("allTypes") || "All Types"}</option>
                      <option value="house">{t("house") || "House"}</option>
                      <option value="apartment">{t("apartment") || "Apartment"}</option>
                      <option value="villa">{t("villa") || "Villa"}</option>
                      <option value="commercial">{t("commercial") || "Commercial"}</option>
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#A8B5AE] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#0B6E4F] dark:text-[#10B981]" />
                      {t("priceRange") || "Price Range"}
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#F8F4EC] dark:bg-[#242C28] border border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#F8F4EC] text-sm focus:outline-none focus:border-[#0B6E4F] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#0B6E4F]/20 dark:focus:ring-[#10B981]/20 transition-all font-medium"
                    >
                      <option value="">{t("anyPrice") || "Any Price"}</option>
                      <option value="0-500000">Under 500K ETB</option>
                      <option value="500000-1000000">500K - 1M ETB</option>
                      <option value="1000000-5000000">1M - 5M ETB</option>
                      <option value="5000000-15000000">5M - 15M ETB</option>
                      <option value="15000000+">Above 15M ETB</option>
                    </select>
                  </div>
                </div>

                {/* Keywords & Primary Search Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] dark:text-[#71717A]" />
                    <input
                      type="text"
                      placeholder={t("keywords") || "Search by keyword, neighborhood, or amenities..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#F8F4EC] dark:bg-[#242C28] border border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#F8F4EC] placeholder-[#6B7280] dark:placeholder-[#71717A] text-sm focus:outline-none focus:border-[#0B6E4F] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#0B6E4F]/20 dark:focus:ring-[#10B981]/20 transition-all font-medium"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] dark:bg-[#10B981] dark:hover:bg-[#34D399] text-white dark:text-[#0F1412] font-bold text-sm sm:text-base shadow-md hover:shadow-[0_0_25px_rgba(212,160,23,0.35)] transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Search className="w-4 h-4" />
                    <span>{t("searchPropertiesBtn") || "Search Properties"}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* Quick Filter Tag Pills */}
            <motion.div
              className="flex flex-wrap gap-2.5 mt-6 sm:mt-8 justify-center px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { type: "house", label: t("house") || "Houses" },
                { type: "apartment", label: t("apartment") || "Apartments" },
                { type: "villa", label: t("villa") || "Villas" },
                { type: "commercial", label: t("commercial") || "Commercial" },
              ].map((item) => (
                <Link
                  key={item.type}
                  to={`/properties?type=${item.type}`}
                  className="px-4 py-1.5 rounded-full bg-white/10 dark:bg-black/30 backdrop-blur-md text-white text-xs font-medium border border-white/20 dark:border-white/15 hover:border-[#D4A017] dark:hover:border-[#EAB308] hover:bg-white/20 transition-all duration-200 flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3 h-3 opacity-70" />
                </Link>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </HeroVideo>

      {/* ============================================
          STATS BAR SECTION - Below Hero
          ============================================ */}
      <section className="py-8 sm:py-10 bg-[#F8F4EC] dark:bg-[#0B0F0D] border-b border-[#E5E0D8] dark:border-[#2A342E] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-[#141A17] rounded-2xl p-5 sm:p-6 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm hover:border-[#D4A017]/50 dark:hover:border-[#EAB308]/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] border border-[#0B6E4F]/20 dark:border-[#10B981]/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#D4A017] dark:bg-[#EAB308]" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F4EC] tracking-tight mb-1">
                      <SpringCounter value={stat.value} />
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-[#4B5563] dark:text-[#A8B5AE]">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

{/* ============================================
          VERIFICATION PROCESS SECTION - 4 Pillars of Trust
          ============================================ */}
      <section className="py-10 sm:py-14 bg-background relative overflow-hidden">
        {/* Subtle background ambient glows */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#0B6E4F]/5 dark:bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-[#D4A017]/5 dark:bg-[#EAB308]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] text-xs font-bold uppercase tracking-wider mb-4 border border-[#0B6E4F]/20 dark:border-[#10B981]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentLanguage === "am" ? "የእውነተኛነት ማረጋገጫ" : "Four-Tier Verification"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] tracking-tight mb-4">
              {currentLanguage === "am" ? "የንብረት ማረጋገጫ ሂደት" : "Property Verification Process"}
            </h2>
            <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
              {currentLanguage === "am"
                ? "በመድረካችን ላይ የሚቀርብ ማንኛውም ንብረት በህግ ባለሙያዎች እና በመስክ ተቆጣጣሪዎች ጥብቅ የማጣራት ሂደት ያልፋል።"
                : "Every listing on Ethio-Home undergoes forensic document checks, on-site physical audits, and biometric owner validation before it ever appears."}
            </p>
          </motion.div>

          {/* 4 Process Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {verificationSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={index}
                  className="relative group bg-white dark:bg-[#141A17] rounded-2xl p-7 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm hover:shadow-xl hover:border-[#D4A017]/50 dark:hover:border-[#EAB308]/50 transition-all duration-300 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <div>
                    {/* Top Step Number Badge & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center border border-[#0B6E4F]/20 dark:border-[#10B981]/20 group-hover:scale-105 transition-transform duration-200">
                        <StepIcon className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#D4A017]/15 dark:bg-[#EAB308]/15 text-[#D4A017] dark:text-[#EAB308] border border-[#D4A017]/30 dark:border-[#EAB308]/30">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-2.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#E5E0D8]/60 dark:border-[#2A342E]/60 flex items-center gap-1.5 text-xs font-semibold text-[#0B6E4F] dark:text-[#10B981]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{currentLanguage === "am" ? "የተረጋገጠ ደረጃ" : "Standard Compliance"}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED PROPERTIES SECTION
          ============================================ */}
      <section className="py-10 sm:py-14 bg-[#F0EDE6]/50 dark:bg-[#141A17]/60 border-y border-[#E5E0D8] dark:border-[#2A342E] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <motion.div
              className="max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4A017]/15 dark:bg-[#EAB308]/15 text-[#D4A017] dark:text-[#EAB308] text-xs font-bold uppercase tracking-wider mb-4 border border-[#D4A017]/30 dark:border-[#EAB308]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentLanguage === "am" ? "የተመረጡ ቤቶች" : "Curated Selection"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] tracking-tight mb-3">
                {currentLanguage === "am" ? "ተለይተው የቀረቡ ቤቶች" : "Featured Verified Properties"}
              </h2>
              <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
                {currentLanguage === "am"
                  ? "በአዲስ አበባ ተመራጭ ሰፈሮች ውስጥ የሚገኙ፣ የተሟላ ህጋዊ ሰነድ ያላቸው ቤቶች"
                  : "Hand-inspected luxury apartments, private villas, and prime commercial plots across Addis Ababa."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#1C2420] text-[#0B6E4F] dark:text-[#10B981] hover:text-[#095C42] dark:hover:text-[#34D399] border border-[#E5E0D8] dark:border-[#2A342E] hover:border-[#0B6E4F] dark:hover:border-[#10B981] font-bold text-sm shadow-sm hover:shadow transition-all duration-200"
              >
                <span>{currentLanguage === "am" ? "ሁሉንም ቤቶች ይመልከቱ" : "View All Properties"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Properties Grid or Skeletons or Rich Empty State */}
          {loading.properties ? (
            <PropertyGridShimmer count={6} viewMode="grid" />
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuredProperties.map((property, index) => (
                <PropertyCardEnhanced key={property._id || index} property={property} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              className="bg-white dark:bg-[#141A17] rounded-3xl p-10 sm:p-14 border border-[#E5E0D8] dark:border-[#2A342E] text-center max-w-2xl mx-auto shadow-sm"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center mb-6 border border-[#0B6E4F]/20 dark:border-[#10B981]/20">
                <Building className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-3">
                {currentLanguage === "am" ? "አዳዲስ የተረጋገጡ ቤቶች በቅርቡ ይቀርባሉ" : "New Verified Properties Coming Soon"}
              </h3>
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed mb-8 max-w-md mx-auto">
                {currentLanguage === "am"
                  ? "የመስክ ተቆጣጣሪ ቡድናችን በአሁኑ ሰዓት አዳዲስ ዝርዝሮችን እያረጋገጠ ነው። የተመዘገቡ ቤቶችን ይመልከቱ ወይም የራስዎን ያስመዝግቡ።"
                  : "Our certified inspectors are currently completing forensic verification for new listings in Bole, CMC, and Kazanchis."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/properties"
                  className="px-6 py-3 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] dark:bg-[#10B981] dark:hover:bg-[#34D399] text-white dark:text-[#0F1412] font-bold text-sm shadow-md transition-all"
                >
                  {currentLanguage === "am" ? "የተዘረዘሩትን ያስሱ" : "Explore All Listings"}
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-[#F0EDE6] dark:bg-[#1C2420] text-[#1A1A1A] dark:text-[#F8F4EC] hover:bg-[#E5E0D8] dark:hover:bg-[#2A342E] font-bold text-sm transition-all border border-[#E5E0D8] dark:border-[#2A342E]"
                >
                  {currentLanguage === "am" ? "ያነጋግሩን" : "Contact Our Agents"}
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE ETHIO-HOME (PLATFORM PILLARS)
          ============================================ */}
      <section className="py-14 sm:py-18 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] text-xs font-bold uppercase tracking-wider mb-4 border border-[#0B6E4F]/20 dark:border-[#10B981]/20">
              <Zap className="w-3.5 h-3.5" />
              <span>{currentLanguage === "am" ? "የእኛ ብልጫ" : "The Ethio-Home Advantage"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] tracking-tight mb-4">
              {currentLanguage === "am" ? "ለምን ኢትዮ-ሆምን ይመርጣሉ?" : "Why Choose Ethio-Home?"}
            </h2>
            <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
              {currentLanguage === "am"
                ? "ለኢትዮጵያ የሪል እስቴት ገበያ የተዘጋጁ ዘመናዊ፣ አስተማማኝ እና ግልጽ የቴክኖሎጂ አገልግሎቶች"
                : "Engineered specifically for the Ethiopian market to eliminate broker scams and deliver complete transparency."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {platformFeatures.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-[#141A17] rounded-2xl p-6 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm hover:shadow-xl hover:border-[#0B6E4F]/50 dark:hover:border-[#10B981]/50 transition-all duration-300 group w-full flex flex-col justify-between"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center mb-6 border border-[#0B6E4F]/20 dark:border-[#10B981]/20 group-hover:scale-105 transition-transform">
                    <FeatureIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-2.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS (CINEMATIC 3-STEP JOURNEY)
          ============================================ */}
      <section className="py-14 sm:py-18 bg-[#F0EDE6]/50 dark:bg-[#141A17]/60 border-y border-[#E5E0D8] dark:border-[#2A342E] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4A017]/15 dark:bg-[#EAB308]/15 text-[#D4A017] dark:text-[#EAB308] text-xs font-bold uppercase tracking-wider mb-4 border border-[#D4A017]/30 dark:border-[#EAB308]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentLanguage === "am" ? "ቀላል አሰራር" : "Seamless Experience"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] tracking-tight mb-4">
              {currentLanguage === "am" ? "ኢትዮ-ሆም እንዴት ይሰራል?" : "How Ethio-Home Works"}
            </h2>
            <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
              {currentLanguage === "am"
                ? "በሦስት ቀላል ደረጃዎች ህልምዎን ወደ እውን ይቀይሩ"
                : "From discovery to receiving the keys, our process is clear, transparent, and completely protected."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 relative max-w-5xl mx-auto">
            {howItWorksSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  className="relative bg-white dark:bg-[#141A17] rounded-3xl p-6 sm:p-7 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm hover:shadow-xl hover:border-[#D4A017]/50 dark:hover:border-[#EAB308]/50 transition-all duration-300 text-center flex flex-col items-center w-full"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#D4A017] dark:bg-[#EAB308] text-[#0F1412] font-black text-xl flex items-center justify-center mb-6 shadow-md">
                    0{step.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center mb-4 border border-[#0B6E4F]/20 dark:border-[#10B981]/20">
                    <StepIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS SECTION (ETHIOPIAN VOICES)
          ============================================ */}
      <section className="py-14 sm:py-18 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] text-xs font-bold uppercase tracking-wider mb-4 border border-[#0B6E4F]/20 dark:border-[#10B981]/20">
              <Award className="w-3.5 h-3.5" />
              <span>{currentLanguage === "am" ? "የደንበኞች ምስክርነት" : "Client Stories"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] tracking-tight mb-4">
              {currentLanguage === "am" ? "ደንበኞቻችን ምን ይላሉ?" : "Trusted by Property Seekers Across Ethiopia"}
            </h2>
            <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
              {currentLanguage === "am"
                ? "በአገር ውስጥም ሆነ በውጭ የሚኖሩ ኢትዮጵያውያን ተሞክሯቸውን ያካፍላሉ"
                : "Real experiences from local homeowners, diaspora investors, and commercial tenants."}
            </p>
          </motion.div>

          {/* Testimonials Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Abebe Kebede",
                role: currentLanguage === "am" ? "የቤት ገዢ (ቦሌ)" : "Apartment Buyer, Bole",
                review: currentLanguage === "am"
                  ? "ኢትዮ-ሆም ያልተረጋገጡ ደላሎች የሚያስከትሉትን ጭንቀት ሙሉ በሙሉ አስቀርቷል። በቦሌ የገዛሁት አፓርትመንት ህጋዊ ሰነድ ሙሉ በሙሉ የተረጋገጠ ነበር።"
                  : "Ethio-Home completely removed the headache of unverified street brokers. Purchasing our apartment in Bole with verified municipal records was smooth and stress-free.",
                rating: 5,
              },
              {
                name: "Sara Tadesse",
                role: currentLanguage === "am" ? "የዲያስፖራ ባለሀብት (ሜሪላንድ)" : "Diaspora Investor, Silver Spring MD",
                review: currentLanguage === "am"
                  ? "ከውጭ ሆኖ በኢትዮጵያ ቤት መግዛት አስፈሪ ነበር። ነገር ግን የኢትዮ-ሆም የአካል ምርመራ ሪፖርት እና የህግ ድጋፍ 100% ሙሉ እምነት ሰጠኝ።"
                  : "Buying a home in Addis Ababa while living in Maryland used to feel full of risks. Ethio-Home's physical inspection report and escrow safety gave me complete confidence.",
                rating: 5,
              },
              {
                name: "Dawit Haile",
                role: currentLanguage === "am" ? "የንግድ ድርጅት ባለቤት (ካዛንቺስ)" : "Tech Startup Founder, Kazanchis",
                review: currentLanguage === "am"
                  ? "ለድርጅታችን የቢሮ ቦታ በካዛንቺስ በአንድ ሳምንት ውስጥ አገኘን። ቀጥታ ከባለቤቱ ጋር መገናኘታችን ብዙ ጊዜ እና ገንዘብ አድኖልናል።"
                  : "We leased our company's office in Kazanchis within a week. Direct connection to verified landlords saved us excessive broker fees and months of delay.",
                rating: 5,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-[#141A17] rounded-3xl p-8 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm hover:shadow-xl hover:border-[#D4A017]/50 dark:hover:border-[#EAB308]/50 transition-all duration-300 flex flex-col justify-between"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#D4A017] dark:text-[#EAB308] fill-[#D4A017] dark:fill-[#EAB308]" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-[#1A1A1A] dark:text-[#F8F4EC] leading-relaxed italic mb-6">
                    "{item.review}"
                  </p>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-[#E5E0D8]/60 dark:border-[#2A342E]/60">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0B6E4F] to-[#043324] dark:from-[#10B981] dark:to-[#0B6E4F] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#6B7280] dark:text-[#71717A]">
                      {item.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA SECTION (CINEMATIC DEEP EMERALD & GOLD)
          ============================================ */}
      <section className="py-14 sm:py-20 relative overflow-hidden bg-gradient-to-br from-[#0B6E4F] via-[#095C42] to-[#043324] text-white">
        {/* Warm gold ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A017]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-[#EAB308]" />
              <span>{currentLanguage === "am" ? "ህልምዎን ዛሬውኑ ይጀምሩ" : "Begin Your Property Journey Today"}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.2]">
              {currentLanguage === "am"
                ? "በኢትዮጵያ ውስጥ ህልምዎን ቤት ለማግኘት ዝግጁ ኖት?"
                : "Ready to Find Your Verified Property in Ethiopia?"}
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              {currentLanguage === "am"
                ? "በሺዎች የሚቆጠሩ ደንበኞች በኢትዮ-ሆም አማካኝነት አስተማማኝ ንብረታቸውን አግኝተዋል። እርስዎም ዛሬውኑ ይቀላቀሉ።"
                : "Join thousands of home seekers, diaspora investors, and verified property owners on Ethiopia's premier trusted real estate platform."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/properties"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-white/95 text-[#0B6E4F] font-bold text-sm sm:text-base shadow-xl hover:shadow-[0_0_30px_rgba(212,160,23,0.4)] transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <span>{currentLanguage === "am" ? "የተረጋገጡ ቤቶችን ያስሱ" : "Browse Verified Properties"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-white/10 text-white font-bold text-sm sm:text-base border-2 border-white/40 hover:border-white transition-all duration-200 inline-flex items-center justify-center"
              >
                <span>{currentLanguage === "am" ? "መለያ በነጻ ይክፈቱ" : "Create Free Account"}</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
