import {
  Search,
  Home as HomeIcon,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Building,
  Shield,
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

import "../styles/home-unbelievable.css";
import "../styles/properties.css";

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
      try {
        const usersRes = await userService.getUsers();
        if (usersRes.success) {
          return usersRes.data?.results || usersRes.data?.total || usersRes.data?.data?.results || 0;
        }
        const listRes = await userService.getUsers({ limit: 200 });
        const users = listRes.success ? listRes.data?.data?.data || [] : [];
        return users.length;
      } catch (_) {
        const props = allPropertiesData?.properties || [];
        const uniqueOwners = new Set(props.map((p) => p.owner?._id || p.owner || ""));
        return Math.max(0, uniqueOwners.size);
      }
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
    if (locationFilter && ["Addis Ababa", "Bole", "Kazanchis", "Gerji"].includes(locationFilter)) {
      queryParams.append("location", locationFilter);
    }
    if (typeFilter && ["house", "apartment", "villa", "commercial"].includes(typeFilter)) {
      queryParams.append("type", typeFilter);
    }
    if (priceFilter && ["0-500000", "500000-1000000", "1000000-2000000", "2000000+"].includes(priceFilter)) {
      queryParams.append("price", priceFilter);
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
          HERO SECTION - Premium Video/Image Background
          ============================================ */}
      <HeroVideo
        fallbackImages={["/hero-bg-addis.jpg", "/hero-bg-modern.jpg"]}
        overlayOpacity={0.65}
        parallaxStrength={0.4}
      >
        <motion.div 
          className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <div className="container mx-auto text-center max-w-6xl">
            {/* Ethiopian Accent Bar - Premium Animation */}
            <motion.div
              className="relative w-24 sm:w-32 mx-auto mb-8 sm:mb-10"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="h-1 sm:h-1.5 rounded-full bg-gradient-to-r from-[hsl(var(--ethiopian-green))] via-[hsl(var(--ethiopian-yellow))] to-[hsl(var(--ethiopian-red))]" />
              <div className="absolute inset-0 h-1 sm:h-1.5 rounded-full bg-gradient-to-r from-[hsl(var(--ethiopian-green))] via-[hsl(var(--ethiopian-yellow))] to-[hsl(var(--ethiopian-red))] blur-md opacity-60" />
            </motion.div>

            {/* Animated Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-sm font-medium text-white/90">{t("Ethiopia's Premier Real Estate Platform")}</span>
            </motion.div>

            {/* Main Headline - Responsive Typography - AMAZING DESIGN */}
            <motion.h1
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 leading-[1.1] relative"
              style={{
                letterSpacing: "-0.02em",
                textShadow: "0 4px 30px rgba(0,0,0,0.5), 0 0 80px hsl(var(--gold-400) / 0.3), 0 0 120px hsl(var(--gold-400) / 0.2)",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="relative z-10 bg-gradient-to-r from-white via-gold-100 to-white bg-clip-text text-transparent">
                {t("heroTitle")}
              </span>
              {/* Glowing effect behind text */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-gold-400/20 via-gold-300/30 to-gold-400/20 blur-3xl -z-0"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.h1>

            {/* Subheadline - Responsive */}
            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/85 mb-8 sm:mb-12 max-w-4xl mx-auto font-light tracking-wide leading-relaxed"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {t("heroSubtitle")}
            </motion.p>

            {/* Premium Search Card - Fully Responsive */}
            <motion.div
              className="w-full max-w-5xl mx-auto backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-white/20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {/* Location Filter */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gold-400" />
                      {t("Location")}
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 hover:bg-white/15 backdrop-blur-sm"
                    >
                      <option value="" className="bg-gray-900 text-white">{t("All Locations")}</option>
                      <option value="Addis Ababa" className="bg-gray-900 text-white">{t("Addis Ababa")}</option>
                      <option value="Bole" className="bg-gray-900 text-white">{t("Bole")}</option>
                      <option value="Kazanchis" className="bg-gray-900 text-white">{t("Kazanchis")}</option>
                      <option value="Gerji" className="bg-gray-900 text-white">{t("Gerji")}</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                      <Building className="w-3 h-3 sm:w-4 sm:h-4 text-gold-400" />
                      {t("Property Type")}
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 hover:bg-white/15 backdrop-blur-sm"
                    >
                      <option value="" className="bg-gray-900 text-white">{t("All Types")}</option>
                      <option value="house" className="bg-gray-900 text-white">{t("house")}</option>
                      <option value="apartment" className="bg-gray-900 text-white">{t("apartment")}</option>
                      <option value="villa" className="bg-gray-900 text-white">{t("villa")}</option>
                      <option value="commercial" className="bg-gray-900 text-white">{t("commercial")}</option>
                    </select>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-2 text-left sm:col-span-2 lg:col-span-1">
                    <label className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-gold-400" />
                      {t("Price Range")}
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 hover:bg-white/15 backdrop-blur-sm"
                    >
                      <option value="" className="bg-gray-900 text-white">{t("Any Price")}</option>
                      <option value="0-500000" className="bg-gray-900 text-white">{t("Under 500K ETB")}</option>
                      <option value="500000-1000000" className="bg-gray-900 text-white">{t("500K - 1M ETB")}</option>
                      <option value="1000000-2000000" className="bg-gray-900 text-white">{t("1M - 2M ETB")}</option>
                      <option value="2000000+" className="bg-gray-900 text-white">{t("Above 2M ETB")}</option>
                    </select>
                  </div>
                </div>

                {/* Search Input & Button */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
                    <input
                      type="text"
                      placeholder={t("Search by keywords...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="group relative px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gradient-to-r from-[hsl(var(--ethiopian-green))] to-[hsl(var(--accent))] text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg overflow-hidden flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px hsl(var(--ethiopian-green) / 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    <span className="relative z-10">{t("Search")}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* Quick Property Type Links - Responsive */}
            <motion.div
              className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 mt-8 sm:mt-10 lg:mt-12 justify-center px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {["house", "apartment", "villa", "commercial"].map((type, index) => (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={`/properties?type=${type}`}
                    className="group relative px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 backdrop-blur-md bg-white/10 text-white rounded-full font-medium text-xs sm:text-sm lg:text-base overflow-hidden transition-all duration-300 border border-white/20 hover:border-gold-400/50 hover:shadow-[0_0_20px_hsl(var(--gold-400)/0.3)] flex items-center gap-1.5 sm:gap-2"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-gold-400/0 via-gold-400/20 to-gold-400/0"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 capitalize">{t(type)}</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </HeroVideo>

      {/* ============================================
          STATS SECTION - Responsive Floating Cards
          ============================================ */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-0 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-gold-400/10 rounded-full blur-[80px] sm:blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-accent/10 rounded-full blur-[80px] sm:blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Circular Gradient Background */}
                <div className="absolute -inset-2 sm:-inset-3 lg:-inset-4 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] rounded-full"
                    style={{
                      background: `radial-gradient(circle at center, hsl(var(--gold-400) / 0.15) 0%, hsl(var(--gold-500) / 0.05) 50%, transparent 70%)`,
                    }}
                    whileHover={{ scale: 1.2, opacity: 1 }}
                    initial={{ opacity: 0.5 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <motion.div
                  className="relative bg-card/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-border/50 p-4 sm:p-6 lg:p-8 text-center overflow-hidden"
                  whileHover={{
                    y: -8,
                    boxShadow: "0 25px 50px -12px hsl(var(--gold-400) / 0.15)",
                    borderColor: "hsl(var(--gold-400) / 0.3)",
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 text-gold-500 mb-3 sm:mb-4 lg:mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                  </motion.div>
                  <div className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1.5 sm:mb-2 lg:mb-3 bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider sm:tracking-widest">
                    {stat.label}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          VERIFICATION PROCESS SECTION
          ============================================ */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-1 w-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-[hsl(var(--ethiopian-green))] via-[hsl(var(--ethiopian-yellow))] to-[hsl(var(--ethiopian-red))]" />
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {t("Property Verification Process")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              {t("Every property on our platform goes through rigorous verification")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {verificationSteps.map((step, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Circular Gradient Background */}
                <div className="absolute -inset-3 rounded-3xl overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full"
                    style={{
                      background: `radial-gradient(circle at center, hsl(var(--accent) / 0.12) 0%, transparent 60%)`,
                    }}
                    whileHover={{ scale: 1.3 }}
                    initial={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <motion.div
                  className="relative bg-card/90 backdrop-blur-md rounded-2xl border border-border/50 p-8 h-full"
                  whileHover={{
                    y: -8,
                    boxShadow: "0 25px 50px -12px hsl(var(--accent) / 0.15)",
                    borderColor: "hsl(var(--accent) / 0.3)",
                  }}
                >
                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-gray-900 font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>

                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center text-accent mb-6"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <step.icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED PROPERTIES SECTION
          ============================================ */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/4 left-0 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-gold-400/5 rounded-full blur-[100px] sm:blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-accent/5 rounded-full blur-[100px] sm:blur-[150px]" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-8 sm:mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-1 w-12 sm:w-16 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-gold-400 to-gold-500" />
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">
              {t("featuredProperties")}
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              {t("Discover our handpicked selection of premium properties")}
            </p>
          </motion.div>

          {loading.properties ? (
            <PropertyGridShimmer count={6} viewMode="grid" />
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 mb-8 sm:mb-12 lg:mb-16">
              {featuredProperties.map((property, index) => (
                <PropertyCardEnhanced key={property._id} property={property} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-12 sm:py-16 lg:py-20 bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-border/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-muted-foreground text-base sm:text-lg lg:text-xl">{t("No properties available at the moment.")}</p>
            </motion.div>
          )}

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/properties"
              className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg hover:shadow-[0_0_40px_hsl(var(--accent)/0.3)] transition-all duration-500 hover:scale-105"
            >
              {t("View All Properties")}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          PLATFORM FEATURES SECTION
          ============================================ */}
      <section className="py-12 sm:py-16 lg:py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            className="text-center mb-8 sm:mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-1 w-12 sm:w-16 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-[hsl(var(--ethiopian-green))] via-[hsl(var(--ethiopian-yellow))] to-[hsl(var(--ethiopian-red))]" />
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">
              {t("Why Choose Ethio-Home?")}
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              {t("Comprehensive features designed for the Ethiopian real estate market")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Circular Gradient Background */}
                <div className="absolute -inset-3 rounded-3xl overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full"
                    style={{
                      background: `radial-gradient(circle at center, hsl(var(--gold-400) / 0.1) 0%, transparent 60%)`,
                    }}
                    whileHover={{ scale: 1.4 }}
                    initial={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <motion.div
                  className="relative bg-card/90 backdrop-blur-md rounded-2xl border border-border/50 p-8 h-full"
                  whileHover={{
                    y: -8,
                    boxShadow: "0 25px 50px -12px hsl(var(--gold-400) / 0.1)",
                    borderColor: "hsl(var(--gold-400) / 0.3)",
                  }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 flex items-center justify-center text-gold-500 mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <feature.icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS SECTION
          ============================================ */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-1 w-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-gold-400 to-gold-500" />
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {t("How Ethio-Home Works")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              {t("Simple steps to find your perfect property")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-gold-400/30 to-transparent -translate-y-8" />

            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.step}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {/* Circular Gradient Background */}
                <div className="absolute -inset-4 rounded-3xl overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full"
                    style={{
                      background: `radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 60%)`,
                    }}
                    whileHover={{ scale: 1.3 }}
                    initial={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <motion.div
                  className="relative bg-card/90 backdrop-blur-md rounded-2xl border border-border/50 p-8 text-center"
                  whileHover={{
                    y: -8,
                    boxShadow: "0 25px 50px -12px hsl(var(--primary) / 0.15)",
                    borderColor: "hsl(var(--primary) / 0.3)",
                  }}
                >
                  {/* Step Number Circle */}
                  <motion.div
                    className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-gray-900 font-bold text-2xl mb-6 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    {step.step}
                  </motion.div>

                  <motion.div
                    className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary mb-4"
                    whileHover={{ scale: 1.1 }}
                  >
                    <step.icon className="w-7 h-7" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS SECTION
          ============================================ */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-1 w-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-[hsl(var(--ethiopian-green))] via-[hsl(var(--ethiopian-yellow))] to-[hsl(var(--ethiopian-red))]" />
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {t("testimonials")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              {t("See what our satisfied clients have to say")}
            </p>
          </motion.div>

          {loading.testimonials ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <TestimonialCardShimmer key={i} />
              ))}
            </div>
          ) : error.testimonials ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{error.testimonials}</p>
            </div>
          ) : Array.isArray(testimonials) && testimonials.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Circular Gradient Background */}
                  <div className="absolute -inset-3 rounded-3xl overflow-hidden pointer-events-none">
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full"
                      style={{
                        background: `radial-gradient(circle at center, hsl(var(--gold-400) / 0.08) 0%, transparent 60%)`,
                      }}
                      whileHover={{ scale: 1.3 }}
                      initial={{ scale: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  <motion.div
                    className="relative bg-card/90 backdrop-blur-md rounded-2xl border border-border/50 p-8 h-full"
                    whileHover={{
                      y: -8,
                      boxShadow: "0 25px 50px -12px hsl(var(--gold-400) / 0.1)",
                      borderColor: "hsl(var(--gold-400) / 0.3)",
                    }}
                  >
                    {/* Quote Icon */}
                    <div className="absolute -top-4 -left-2 text-6xl text-gold-400/20 font-serif">"</div>

                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-gold-400 fill-gold-400" />
                      ))}
                    </div>

                    <p className="text-foreground mb-6 italic">
                      "{testimonial.title ? `${testimonial.title}: ` : ""}{testimonial.review}"
                    </p>

                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-gray-900 font-bold text-lg">
                        {(testimonial.buyer?.name || "A").charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{testimonial.buyer?.name || t("Anonymous User")}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.location || t("Unknown Location")}</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t("No testimonials available at the moment.")}</p>
              <p className="text-muted-foreground">{t("Be the first to share your experience!")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          CTA SECTION - Final Call to Action
          ============================================ */}
      <section className="py-28 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent/95 to-[hsl(var(--ethiopian-green))]" />

        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        {/* Floating Decorative Elements */}
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-gold-400/20 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-1 w-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-[hsl(var(--ethiopian-green))] via-[hsl(var(--ethiopian-yellow))] to-[hsl(var(--ethiopian-red))]" />
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t("Ready to Find Your Dream Home?")}
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-white/80 font-light">
              {t("Join thousands of satisfied customers who found their perfect property with Ethio-Home")}
            </p>
            <div className="flex flex-row flex-wrap gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/properties"
                  className="group px-8 py-4 bg-white text-accent rounded-xl font-semibold text-base hover:bg-white/95 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                >
                  {t("Browse Properties")}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-transparent border-2 border-white/50 text-white rounded-xl font-semibold text-base hover:bg-white/10 hover:border-white transition-all duration-300 inline-flex items-center justify-center"
                >
                  {t("Get Started")}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
