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
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import {userService} from "@/services/userService";

import PropertyCard from "../components/PropertyCard";
import { useLanguage } from "../context/LanguageContext";
import { propertyService } from "../services/propertyService";
import { reviewService } from "../services/reviewService";

import "../styles/home-unbelievable.css";
import "../styles/properties.css";

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [stats , setStats]= useState([
            { icon: Building, label: t("Properties Listed"), value: "Loading..." },
            { icon: Users, label: t("Happy Clients"), value: "Loading..." },
            { icon: CheckCircle, label: t("Verified Properties"), value: "Loading..." },
            { icon: Shield, label: t("Secure Transactions"), value: "100%"},
          ]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState({ properties: true, testimonials: true });
  const [error, setError] = useState({ properties: "", testimonials: "" });

  const backgroundImages = ["/hero-bg-addis.jpg", "/hero-bg-modern.jpg"];
  const featuredProperties = useMemo(() => properties.slice(0, 6), [properties]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

   // Load real stats from database
    useEffect(() => {
      const loadStats = async () => {
        try {
          // Prefer lightweight public computations from existing endpoints
          // 1) Properties list (public) to compute counts and verified %
          const propsRes = await propertyService.getProperties({ limit: 500 });
          const props = propsRes.success ? propsRes.data?.data?.data || [] : [];
          const propertiesCount = props.length;
          const verifiedCount = props.filter(
            (p) => p.isVerified || p.status === "approved"
          ).length;
          const verifiedPercentage =
            propertiesCount > 0
              ? Math.round((verifiedCount / propertiesCount) * 100)
              : 0;
  
          // 2) Users count (protected). Try; if fails, approximate by unique owners from properties
          let usersCount = 0;
          try {
            const usersRes = await userService.getUsers();
            //console.log(usersRes);
            // Some backends include total in headers or response; try common shapes
            usersCount = usersRes.success
              ? usersRes.data?.results ||
                usersRes.data?.total ||
                usersRes.data?.data?.results ||
                0
              : 0;
            if (!usersCount) {
              const listRes = await userService.getUsers({ limit: 200 });
              const users = listRes.success ? listRes.data?.data?.data || [] : [];
              usersCount = users.length;
            }
          } catch (_) {
            // Fallback: unique owners derived from properties
            const uniqueOwners = new Set(
              (props || []).map((p) => p.owner?._id || p.owner || "")
            );
            usersCount = Math.max(0, uniqueOwners.size);
          }
  
          // Calculate years of experience (from 2016)
          const currentYear = new Date().getFullYear();
          const yearsOfExperience = currentYear - 2016;
  
          setStats([
            {
              icon: Building,
              label: "Properties Listed",
              value: `${propertiesCount.toLocaleString()}`,
            },
            {
              icon: Users,
              label: "Happy Clients",
              value: `${usersCount.toLocaleString()}`,
            },
            {
              icon: CheckCircle,
              label: "Verified Properties",
              value: `${verifiedPercentage}%`,
            },
            {
              icon: Shield,
              label: "Secure Transactions",
              value: "100%",
            },
          ]);
        } catch (error) {
          console.error("Failed to load stats:", error);
          // Fallback to static data if API fails
          setStats([
            { icon: Building, label: "Properties Listed", value: "0" },
            { icon: Users, label: "Happy Clients", value: "0" },
            { icon: CheckCircle, label: "Verified Properties", value: "0%" },
            {
              icon: Shield,
              label: "Years of Experience",
              value: `${new Date().getFullYear() - 2016}`,
            },
          ]);
        }
      };
  
      loadStats();
    }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading((prev) => ({ ...prev, properties: true }));
      setError((prev) => ({ ...prev, properties: "" }));
      try {
        const result = await propertyService.getProperties({isVerified: true});
        if (result.data.status=="success") {

          //console.log("😋😋😋😊",result.data);
          setProperties(result.data.data.data);
        } else {
          setError((prev) => ({
            ...prev,
            properties: t(result.error || "Failed to load properties. Please try again."),
          }));
          setProperties([]);
        }
      } catch (err) {
        setError((prev) => ({
          ...prev,
          properties: t(
            err.response?.data?.message || "Failed to load properties. Please try again ."
          ),
        }));
        setProperties([]);
      } finally {
        setLoading((prev) => ({ ...prev, properties: false }));
      }
    };
    fetchProperties();
  }, [t]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading((prev) => ({ ...prev, testimonials: true }));
      setError((prev) => ({ ...prev, testimonials: "" }));
      try {
        const result = await reviewService.getWebsiteServiceReviews(6);
        if (result.success && result.data.data.reviews) {
          //console.log(result.data.data.reviews);
          setTestimonials(result.data.data.reviews);
        } else {
          setError((prev) => ({
            ...prev,
            testimonials: t("Failed to load testimonials. Please try again."),
          }));
          setTestimonials([]);
        }
      } catch (err) {
        setError((prev) => ({
          ...prev,
          testimonials: t(
            err.response?.data?.message || "Failed to load testimonials. Please try again."
          ),
        }));
        setTestimonials([]);
      } finally {
        setLoading((prev) => ({ ...prev, testimonials: false }));
      }
    };
    fetchTestimonials();
  }, [t]);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) {
      queryParams.append("search", searchQuery.trim());
    }
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
    {
      icon: FileCheck,
      title: t("Document Verification"),
      description: t("All property documents are thoroughly checked for authenticity and legal compliance"),
    },
    {
      icon: MapPin,
      title: t("Physical Inspection"),
      description: t("Our certified inspectors visit and verify the actual property condition and location"),
    },
    {
      icon: Shield,
      title: t("Owner Verification"),
      description: t("Property owners undergo identity verification and ownership confirmation"),
    },
    {
      icon: CheckCircle,
      title: t("Final Approval"),
      description: t("Only verified properties receive our trust badge and are listed on the platform"),
    },
  ];

  const platformFeatures = [
    {
      icon: Search,
      title: t("Advanced Search"),
      description: t("Find properties with powerful filters including location, price, type, and amenities"),
    },
    {
      icon: Heart,
      title: t("Save Favorites"),
      description: t("Create your wishlist and get notified about price changes and similar properties"),
    },
    {
      icon: MessageCircle,
      title: t("Direct Communication"),
      description: t("Chat directly with property owners and agents through our secure messaging system"),
    },
    {
      icon: Calendar,
      title: t("Schedule Visits"),
      description: t("Book property visits at your convenience with our integrated scheduling system"),
    },
    {
      icon: CreditCard,
      title: t("Secure Payments"),
      description: t("Complete transactions safely with multiple payment options and escrow protection"),
    },
    {
      icon: Globe,
      title: t("Bilingual Support"),
      description: t("Full support in English and Amharic to serve all Ethiopian property seekers"),
    },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: t("Search Properties"),
      description: t("Browse through our extensive collection of verified properties using advanced filters"),
      icon: Search,
    },
    {
      step: 2,
      title: t("Schedule Visit"),
      description: t("Book property visits and connect with our professional agents for guided tours"),
      icon: Calendar,
    },
    {
      step: 3,
      title: t("Secure Purchase"),
      description: t("Complete your transaction safely with our secure platform and legal support"),
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section - Cinematic & Luxurious with Parallax */}
      <section
        className="relative min-h-[95vh] w-full overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImages[currentBgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Multi-layer gradient overlays for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/85 via-foreground/60 to-foreground/95"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-transparent to-primary/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        {/* Animated floating elements - parallax particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large gold accent orb - top left */}
          <div 
            className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, hsl(48 96% 53% / 0.3) 0%, transparent 70%)',
              animation: 'float 8s ease-in-out infinite',
              filter: 'blur(60px)',
            }}
          />
          
          {/* Green accent orb - bottom right */}
          <div 
            className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, hsl(145 63% 32% / 0.4) 0%, transparent 70%)',
              animation: 'float 10s ease-in-out infinite',
              animationDelay: '-3s',
              filter: 'blur(50px)',
            }}
          />
          
          {/* Red accent orb - center right */}
          <div 
            className="absolute top-[40%] right-[20%] w-[250px] h-[250px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, hsl(0 85% 47% / 0.3) 0%, transparent 70%)',
              animation: 'float 6s ease-in-out infinite',
              animationDelay: '-5s',
              filter: 'blur(40px)',
            }}
          />

          {/* Floating small particles */}
          <div className="absolute top-[20%] left-[30%] w-4 h-4 bg-gold-400/60 rounded-full animate-float" style={{ animationDelay: '-1s' }}></div>
          <div className="absolute top-[60%] left-[15%] w-3 h-3 bg-gold-400/40 rounded-full animate-float" style={{ animationDelay: '-2s' }}></div>
          <div className="absolute top-[35%] right-[25%] w-5 h-5 bg-accent/50 rounded-full animate-float" style={{ animationDelay: '-4s' }}></div>
          <div className="absolute bottom-[30%] left-[40%] w-2 h-2 bg-gold-400/80 rounded-full animate-float" style={{ animationDelay: '-6s' }}></div>
          <div className="absolute top-[70%] right-[35%] w-3 h-3 bg-white/30 rounded-full animate-float" style={{ animationDelay: '-3.5s' }}></div>
        </div>
        
        {/* Animated gradient mesh overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              linear-gradient(45deg, transparent 25%, hsl(48 96% 53% / 0.05) 50%, transparent 75%),
              linear-gradient(-45deg, transparent 25%, hsl(145 63% 32% / 0.05) 50%, transparent 75%)
            `,
            backgroundSize: '60px 60px',
            animation: 'shimmer 20s linear infinite',
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          {/* Ethiopian accent bar with glow */}
          <div className="relative w-32 mx-auto mb-10 animate-fade-in-down">
            <div className="ethiopian-accent-bar h-1.5 rounded-full"></div>
            <div className="absolute inset-0 ethiopian-accent-bar h-1.5 rounded-full blur-md opacity-60"></div>
          </div>
          
          {/* Main headline with letter-spacing and text shadow */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-tight animate-fade-in-up"
              style={{ 
                letterSpacing: '-0.02em',
                textShadow: '0 4px 30px rgba(0,0,0,0.3), 0 0 60px hsl(48 96% 53% / 0.2)'
              }}>
            <span className="block">{t("heroTitle")}</span>
          </h1>
          
          {/* Subheadline with elegant styling */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/85 mb-12 max-w-4xl mx-auto font-light tracking-wide animate-fade-in-up" 
             style={{ animationDelay: '0.2s', textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            {t("heroSubtitle")}
          </p>

          {/* Background image indicators with glow */}
          <div className="flex gap-4 mb-12 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                className={`relative h-2.5 rounded-full transition-all duration-500 hover:scale-110 ${
                  index === currentBgIndex 
                    ? "w-14 bg-gradient-to-r from-gold-400 to-gold-500" 
                    : "w-4 bg-white/30 hover:bg-white/50"
                }`}
                onClick={() => setCurrentBgIndex(index)}
                aria-label={`Select background image ${index + 1}`}
              >
                {index === currentBgIndex && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 blur-md animate-pulse-glow"></div>
                )}
              </button>
            ))}
          </div>

          {/* Premium Search Card with Glassmorphism */}
          <div className="w-full max-w-5xl mx-auto glass-card rounded-3xl shadow-luxury p-8 md:p-10 animate-fade-in-up border border-white/10" 
               style={{ animationDelay: '0.4s' }}>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 text-left">
                  <label htmlFor="location-filter" className="text-sm font-semibold text-card-foreground/80 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-400" />
                    {t("Location")}
                  </label>
                  <select
                    id="location-filter"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-5 py-4 bg-background/60 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 hover:border-gold-400/30 hover:shadow-inner-glow backdrop-blur-sm"
                  >
                    <option value="">{t("All Locations")}</option>
                    <option value="Addis Ababa">{t("Addis Ababa")}</option>
                    <option value="Bole">{t("Bole")}</option>
                    <option value="Kazanchis">{t("Kazanchis")}</option>
                    <option value="Gerji">{t("Gerji")}</option>
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label htmlFor="type-filter" className="text-sm font-semibold text-card-foreground/80 uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-gold-400" />
                    {t("Property Type")}
                  </label>
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-5 py-4 bg-background/60 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 hover:border-gold-400/30 hover:shadow-inner-glow backdrop-blur-sm"
                  >
                    <option value="">{t("All Types")}</option>
                    <option value="house">{t("house")}</option>
                    <option value="apartment">{t("apartment")}</option>
                    <option value="villa">{t("villa")}</option>
                    <option value="commercial">{t("commercial")}</option>
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label htmlFor="price-filter" className="text-sm font-semibold text-card-foreground/80 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gold-400" />
                    {t("Price Range")}
                  </label>
                  <select
                    id="price-filter"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-5 py-4 bg-background/60 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 hover:border-gold-400/30 hover:shadow-inner-glow backdrop-blur-sm"
                  >
                    <option value="">{t("Any Price")}</option>
                    <option value="0-500000">{t("Under 500K ETB")}</option>
                    <option value="500000-1000000">{t("500K - 1M ETB")}</option>
                    <option value="1000000-2000000">{t("1M - 2M ETB")}</option>
                    <option value="2000000+">{t("Above 2M ETB")}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("Search by keywords...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-background/60 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-300 hover:border-gold-400/30 backdrop-blur-sm"
                  />
                </div>
                <button 
                  type="submit" 
                  className="group relative px-10 py-4 bg-gradient-to-r from-accent to-accent/90 text-accent-foreground rounded-xl font-bold text-lg hover:shadow-glow-green transition-all duration-300 flex items-center gap-3 overflow-hidden"
                  aria-label={t("Search properties")}
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Search className="h-5 w-5 group-hover:scale-110 transition-transform relative z-10" />
                  <span className="hidden md:inline relative z-10">{t("Search")}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Property Type Links with hover effects */}
          <div className="flex flex-wrap gap-4 mt-12 justify-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {['house', 'apartment', 'villa', 'commercial'].map((type, index) => (
              <Link 
                key={type}
                to={`/properties?type=${type}`} 
                className="group relative px-8 py-4 glass text-white rounded-full font-medium overflow-hidden transition-all duration-300 hover:scale-105 border border-white/10 hover:border-gold-400/30"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400/0 via-gold-400/20 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">{t(type)}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator with enhanced animation */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="w-8 h-14 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
              <div className="w-2 h-4 bg-white/70 rounded-full animate-bounce"></div>
            </div>
            <div className="absolute -inset-2 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2s' }}></div>
          </div>
        </div>
      </section>

      {/* Stats Section - Floating Cards */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group bg-card rounded-2xl border border-border shadow-lg p-8 text-center card-hover-lift hover:border-gold-400/50 transition-all duration-500"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 text-gold-500 mb-6 group-hover:scale-110 group-hover:shadow-glow-gold transition-all duration-500">
                  <stat.icon className="h-10 w-10" />
                </div>
                <div className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3 text-gradient-gold">{stat.value}</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Steps Section */}
      <section className="verification-section">
        <div className="verification-container">
          <div className="section-header">
            <h2 className="section-title">{t("Property Verification Process")}</h2>
            <p className="section-subtitle">
              {t("Every property on our platform goes through rigorous verification")}
            </p>
          </div>

          <div className="verification-grid">
            {verificationSteps.map((step, index) => (
              <div key={index} className="verification-card">
                <div className="verification-icon">
                  <step.icon />
                </div>
                <h3 className="verification-title">{step.title}</h3>
                <p className="verification-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties - Premium Layout */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="ethiopian-accent-bar w-16 mx-auto mb-6"></div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {t("featuredProperties")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              {t("Discover our handpicked selection of premium properties")}
            </p>
          </div>
          
          {loading.properties ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-muted-foreground text-lg">{t("Loading properties...")}</p>
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="properties-container grid mb-16">
              {featuredProperties.map((property, index) => (
                <div key={property._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl">
              <p className="text-muted-foreground text-xl">{t("No properties available at the moment.")}</p>
            </div>
          )}
          
          <div className="text-center">
            <Link 
              to="/properties" 
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-2xl font-semibold text-lg hover:shadow-glow-green transition-all duration-500 hover:scale-105"
            >
              {t("View All Properties")}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="platform-features-section">
        <div className="platform-features-container">
          <div className="section-header">
            <h2 className="section-title">{t("Why Choose Ethio-Home?")}</h2>
            <p className="section-subtitle">
              {t("Comprehensive features designed for the Ethiopian real estate market")}
            </p>
          </div>

          <div className="features-grid">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="section-header">
            <h2 className="section-title">{t("How Ethio-Home Works")}</h2>
            <p className="section-subtitle">{t("Simple steps to find your perfect property")}</p>
          </div>

          <div className="steps-grid">
            {howItWorksSteps.map((step) => (
              <div key={step.step} className="step-card">
                <div className="step-icon">
                  <step.icon />
                </div>
                <div className="step-number">{t("Step")} {step.step}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header">
            <h2 className="section-title">{t("testimonials")}</h2>
            <p className="section-subtitle">{t("See what our satisfied clients have to say")}</p>
          </div>

          {loading.testimonials ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{t("Loading testimonials...")}</p>
            </div>
          ) : error.testimonials ? (
            <div className="error-container">
              <p>{error.testimonials}</p>
            </div>
          ) : Array.isArray(testimonials) && testimonials.length > 0 ? (
            <div className="testimonials-section-content">
              <div className="testimonials-grid">
                {testimonials.slice(0, 3).map((testimonial) => (
                  <div key={testimonial._id} className="testimonial-card">
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="star" />
                      ))}
                    </div>
                    <p className="testimonial-message">
                      "{testimonial.title ? `${testimonial.title}: ` : ''}{testimonial.review}"
                    </p>
                    <div className="testimonial-author">
                      <div className="author-name">{testimonial.buyer?.name || t("Anonymous User")}</div>
                      <div className="author-location">{testimonial.location || t("Unknown Location")}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {testimonials.length > 3 && (
                <div className="testimonials-navigation">
                  <div className="nav-dots">
                    {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
                      <button
                        key={index}
                        className={`nav-dot ${index === 0 ? 'active' : ''}`}
                        onClick={() => {
                          // This would be implemented with state to show different sets of reviews
                          console.log(`Navigate to review set ${index + 1}`);
                        }}
                      />
                    ))}
                  </div>
                  <p className="nav-text">
                    Showing 3 of {testimonials.length} reviews
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="no-testimonials">
              <p>{t("No testimonials available at the moment.")}</p>
              <p className="testimonial-subtitle">{t("Be the first to share your experience!")}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Luxurious Final Call */}
      <section className="py-28 relative overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent/95 to-accent/80"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-gold-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="ethiopian-accent-bar w-20 mx-auto mb-8"></div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t("Ready to Find Your Dream Home?")}
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-white/80 font-light">
            {t("Join thousands of satisfied customers who found their perfect property with Ethio-Home")}
          </p>
          <div className="flex flex-row flex-wrap gap-4 justify-center items-center">
            <Link 
              to="/properties" 
              className="group px-8 py-4 bg-white text-accent rounded-xl font-semibold text-base hover:bg-white/95 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              {t("Browse Properties")}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-transparent border-2 border-white/50 text-white rounded-xl font-semibold text-base hover:bg-white/10 hover:border-white transition-all duration-300 hover:scale-105 inline-flex items-center justify-center"
            >
              {t("Get Started")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;