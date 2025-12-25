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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section
        className="relative h-[70vh] min-h-[600px] w-full overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 122, 51, 0.85) 0%, rgba(29, 78, 216, 0.75) 100%), url(${
            backgroundImages[currentBgIndex]
          })`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 drop-shadow-2xl">
            {t("heroTitle")}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl drop-shadow-lg">
            {t("heroSubtitle")}
          </p>

          <div className="flex gap-2 mb-8">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentBgIndex 
                    ? "w-8 bg-ethiopian-yellow" 
                    : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => setCurrentBgIndex(index)}
                aria-label={`Select background image ${index + 1}`}
              />
            ))}
          </div>

          <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="location-filter" className="text-sm font-semibold text-gray-700">
                    {t("Location")}
                  </label>
                  <select
                    id="location-filter"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow focus:border-transparent"
                  >
                    <option value="">{t("All Locations")}</option>
                    <option value="Addis Ababa">{t("Addis Ababa")}</option>
                    <option value="Bole">{t("Bole")}</option>
                    <option value="Kazanchis">{t("Kazanchis")}</option>
                    <option value="Gerji">{t("Gerji")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="type-filter" className="text-sm font-semibold text-gray-700">
                    {t("Property Type")}
                  </label>
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow focus:border-transparent"
                  >
                    <option value="">{t("All Types")}</option>
                    <option value="house">{t("house")}</option>
                    <option value="apartment">{t("apartment")}</option>
                    <option value="villa">{t("villa")}</option>
                    <option value="commercial">{t("commercial")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="price-filter" className="text-sm font-semibold text-gray-700">
                    {t("Price Range")}
                  </label>
                  <select
                    id="price-filter"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow focus:border-transparent"
                  >
                    <option value="">{t("Any Price")}</option>
                    <option value="0-500000">{t("Under 500K ETB")}</option>
                    <option value="500000-1000000">{t("500K - 1M ETB")}</option>
                    <option value="1000000-2000000">{t("1M - 2M ETB")}</option>
                    <option value="2000000+">{t("Above 2M ETB")}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={t("Search by keywords...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow focus:border-transparent"
                />
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  aria-label={t("Search properties")}
                >
                  <Search className="h-5 w-5" />
                  {t("Search")}
                </button>
              </div>
            </form>
          </div>

          <div className="flex flex-wrap gap-3 mt-8 justify-center">
            <Link 
              to="/properties?type=house" 
              className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              {t("house")}
            </Link>
            <Link 
              to="/properties?type=apartment" 
              className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              {t("apartment")}
            </Link>
            <Link 
              to="/properties?type=villa" 
              className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              {t("villa")}
            </Link>
            <Link 
              to="/properties?type=commercial" 
              className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              {t("commercial")}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-card rounded-xl border shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-ethiopian-yellow/20 to-ethiopian-yellow/10 text-ethiopian-yellow mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-foreground mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</div>
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

      {/* Featured Properties */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              {t("featuredProperties")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("Discover our handpicked selection of premium properties")}
            </p>
          </div>
          {loading.properties ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">{t("Loading properties...")}</p>
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">{t("No properties available at the moment.")}</p>
            </div>
          )}
          <div className="text-center">
            <Link 
              to="/properties" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              {t("View All Properties")}
              <ArrowRight className="h-5 w-5" />
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ethiopian-green via-ethiopian-green/90 to-ethiopian-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t("Ready to Find Your Dream Home?")}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t("Join thousands of satisfied customers who found their perfect property with Ethio-Home")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/properties" 
              className="px-8 py-4 bg-white text-ethiopian-green rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              {t("Browse Properties")}
            </Link>
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
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