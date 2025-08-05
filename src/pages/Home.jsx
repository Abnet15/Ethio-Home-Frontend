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
    <div style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(29, 78, 216, 0.8) 100%), url(${
            backgroundImages[currentBgIndex]
          })`,
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <h1 className="hero-title">{t("heroTitle")}</h1>
          <p className="hero-subtitle">{t("heroSubtitle")}</p>

          <div className="hero-indicators">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentBgIndex ? "active" : ""}`}
                onClick={() => setCurrentBgIndex(index)}
                aria-label={`Select background image ${index + 1}`}
              />
            ))}
          </div>

          <div className="advanced-search-bar">
            <form onSubmit={handleSearch} className="search-form-advanced">
              <div className="filter-dropdowns">
                <div className="filter-group">
                  <label htmlFor="location-filter">{t("Location")}</label>
                  <select
                    id="location-filter"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="">{t("All Locations")}</option>
                    <option value="Addis Ababa">{t("Addis Ababa")}</option>
                    <option value="Bole">{t("Bole")}</option>
                    <option value="Kazanchis">{t("Kazanchis")}</option>
                    <option value="Gerji">{t("Gerji")}</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="type-filter">{t("Property Type")}</label>
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">{t("All Types")}</option>
                    <option value="house">{t("house")}</option>
                    <option value="apartment">{t("apartment")}</option>
                    <option value="villa">{t("villa")}</option>
                    <option value="commercial">{t("commercial")}</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="price-filter">{t("Price Range")}</label>
                  <select
                    id="price-filter"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                  >
                    <option value="">{t("Any Price")}</option>
                    <option value="0-500000">{t("Under 500K ETB")}</option>
                    <option value="500000-1000000">{t("500K - 1M ETB")}</option>
                    <option value="1000000-2000000">{t("1M - 2M ETB")}</option>
                    <option value="2000000+">{t("Above 2M ETB")}</option>
                  </select>
                </div>
              </div>

              <div className="search-input-group">
                <input
                  type="text"
                  placeholder={t("Search by keywords...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-keyword-input"
                />
                <button type="submit" className="search-button" aria-label={t("Search properties")}>
                  <Search />
                  {t("Search")}
                </button>
              </div>
            </form>
          </div>

          <div className="hero-quick-links">
            <Link to="/properties?type=house" className="quick-link">
              {t("house")}
            </Link>
            <Link to="/properties?type=apartment" className="quick-link">
              {t("apartment")}
            </Link>
            <Link to="/properties?type=villa" className="quick-link">
              {t("villa")}
            </Link>
            <Link to="/properties?type=commercial" className="quick-link">
              {t("commercial")}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">
                  <stat.icon />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
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
      <section className="featured-section">
        <div className="featured-container">
          <div className="section-header">
            <h2 className="section-title">{t("featuredProperties")}</h2>
            <p className="section-subtitle">
              {t("Discover our handpicked selection of premium properties")}
            </p>
          </div>
          {loading.properties ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{t("Loading properties...")}</p>
            </div>
          ) /* : error.properties ? (
            <div className="error-container">
              <p>{error.properties}</p>
            </div>
          )*/  : featuredProperties.length > 0 ? (
            <div className="properties-grid">
              {featuredProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <p>{t("No properties available at the moment.")}</p>
          )}
          <div className="text-center">
            <Link to="/properties" className="view-all-btn">
              {t("View All Properties")}
              <ArrowRight />
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
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">{t("Ready to Find Your Dream Home?")}</h2>
          <p className="cta-subtitle">
            {t("Join thousands of satisfied customers who found their perfect property with Ethio-Home")}
          </p>
          <div className="cta-buttons">
            <Link to="/properties" className="cta-btn-primary">
              {t("Browse Properties")}
            </Link>
            <Link to="/signup" className="cta-btn-secondary">
              {t("Get Started")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;