import { Heart, MapPin, Bed, Bath, Square, Trash2, Eye } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { favoritesService } from "../services/favoritesService";
import "./Favorites.css";

const Favorites = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }
    
    loadFavorites();
  }, [isAuthenticated, user, authLoading, navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch favorites from API
      const result = await favoritesService.getFavorites();
      if (result.success) {
        setFavorites(result.data.data.favorites);
      } else {
        // Check if error is authentication related
        const errorMsg = result.error || "Failed to load favorites";
        if (errorMsg.toLowerCase().includes('not logged in') || errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('401')) {
          // Redirect to login instead of showing error
          navigate("/login");
          return;
        }
        setError(t(errorMsg));
      }
    } catch (err) {
      console.error("Failed to load favorites:", err);
      // Check if error is authentication related
      if (err.response?.status === 401 || err.message?.toLowerCase().includes('unauthorized')) {
        navigate("/login");
        return;
      }
      setError(t("Failed to load favorites"));
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (propertyId) => {
    try {
      // Remove from API
      const result = await favoritesService.removeFromFavorites(propertyId);
      if (result.success) {
        // Remove from state
        setFavorites(prev => prev.filter(property => property._id !== propertyId));
      }
    } catch (err) {
      console.error("Failed to remove from favorites:", err);
    }
  };

  const clearAllFavorites = async () => {
    if (window.confirm(t("Are you sure you want to clear all favorites?"))) {
      try {
        const result = await favoritesService.clearFavorites();
        if (result.success) {
          setFavorites([]);
        }
      } catch (err) {
        console.error("Failed to clear favorites:", err);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Show loading while auth is loading or favorites are loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{authLoading ? t("Checking authentication...") : t("Loading favorites...")}</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, show nothing (redirect will happen)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, hsl(0 85% 47% / 0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, hsl(48 96% 53% / 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Premium Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ethiopian-red/20 to-ethiopian-red/10 flex items-center justify-center shadow-lg border border-ethiopian-red/20 group-hover:scale-110 transition-transform">
                <Heart className="h-10 w-10 text-ethiopian-red" />
              </div>
              <div>
                <div className="ethiopian-accent-bar w-16 mb-4"></div>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                  {t("My Favorites")}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {favorites.length} {t("property")}{favorites.length !== 1 ? 's' : ''} {t("saved")}
                </p>
              </div>
            </div>
            
            {favorites.length > 0 && (
              <button 
                onClick={clearAllFavorites}
                className="group px-6 py-3 glass border border-ethiopian-red/30 text-ethiopian-red rounded-xl font-semibold hover:bg-ethiopian-red/10 hover:border-ethiopian-red/50 transition-all duration-300 flex items-center gap-3 hover:scale-[1.02]"
              >
                <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {t("Clear All")}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="glass-card border border-destructive/30 rounded-2xl p-8 mb-8 text-center animate-fade-in">
            <p className="text-destructive font-semibold mb-6 text-lg">{error}</p>
            <button 
              onClick={loadFavorites} 
              className="px-8 py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-xl font-bold hover:shadow-glow-green transition-all duration-300 hover:scale-[1.02]"
            >
              {t("Try Again")}
            </button>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-8 shadow-luxury">
              <Heart className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="font-serif text-3xl font-bold text-foreground mb-4">{t("No favorites yet")}</h3>
            <p className="text-lg text-muted-foreground mb-8 text-center max-w-lg">
              {t("Start browsing properties and add them to your favorites!")}
            </p>
            <button 
              onClick={() => navigate("/properties")}
              className="px-10 py-5 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-2xl font-bold text-lg hover:shadow-glow-green transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("Browse Properties")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {favorites.map((property, index) => (
              <div 
                key={property._id} 
                className="group glass-card rounded-2xl border border-border/50 shadow-lg overflow-hidden hover:shadow-luxury hover:border-gold-400/30 transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={property.imagesUrl?.[0] || property.images?.[0] || '/placeholder-property.jpg'} 
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent"></div>
                  
                  {/* Floating action buttons */}
                  <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => navigate(`/properties/${property._id}`)}
                      className="p-3 glass border border-white/20 backdrop-blur-xl rounded-xl hover:bg-white/20 transition-all duration-300 text-white"
                      title={t("View Details")}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => removeFromFavorites(property._id)}
                      className="p-3 bg-ethiopian-red/80 backdrop-blur-xl rounded-xl hover:bg-ethiopian-red transition-all duration-300 text-white"
                      title={t("Remove from Favorites")}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Heart indicator */}
                  <div className="absolute top-4 left-4">
                    <div className="p-2 bg-ethiopian-red/80 backdrop-blur-sm rounded-lg">
                      <Heart className="h-4 w-4 text-white fill-white" />
                    </div>
                  </div>
                  
                  {/* Price overlay */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-2xl font-black text-gradient-gold" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                      {formatPrice(property.price)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-gold-500 transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-muted-foreground mb-5 flex items-center gap-2">
                    <span className="p-1 rounded-md bg-gold-400/20">
                      <MapPin className="h-4 w-4 text-gold-500" />
                    </span>
                    {property.location}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                      <Bed className="h-4 w-4 text-gold-500" />
                      {property.features?.bedrooms || property.bedrooms} {t("beds")}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                      <Bath className="h-4 w-4 text-gold-500" />
                      {property.features?.bathrooms || property.bathrooms} {t("baths")}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                      <Square className="h-4 w-4 text-gold-500" />
                      {property.features?.area || property.area} m²
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="px-4 py-2 bg-gradient-to-r from-gold-400/20 to-gold-500/10 text-gold-500 rounded-full text-sm font-bold border border-gold-400/30">
                      {t(property.type || 'property')}
                    </span>
                    <button
                      onClick={() => navigate(`/properties/${property._id}`)}
                      className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                    >
                      {t("View Details")} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
