import { Heart, MapPin, Bed, Bath, Square, Trash2, Eye } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { favoritesService } from "../services/favoritesService";
import "./Favorites.css";

const Favorites = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    console.log('here is life')
    loadFavorites();
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch favorites from API
      const result = await favoritesService.getFavorites();
      if (result.success) {
        setFavorites(result.data.data.favorites);
      } else {
        setError(t(result.error || "Failed to load favorites"));
      }
    } catch (err) {
      console.error("Failed to load favorites:", err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("Loading favorites...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground">
                  {t("My Favorites")}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {favorites.length} {t("property")}{favorites.length !== 1 ? 's' : ''} {t("saved")}
                </p>
              </div>
            </div>
            
            {favorites.length > 0 && (
              <button 
                onClick={clearAllFavorites}
                className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                {t("Clear All")}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 text-center">
            <p className="text-red-700 font-semibold mb-4">{error}</p>
            <button 
              onClick={loadFavorites} 
              className="px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {t("Try Again")}
            </button>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t("No favorites yet")}</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {t("Start browsing properties and add them to your favorites!")}
            </p>
            <button 
              onClick={() => navigate("/properties")}
              className="px-8 py-4 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              {t("Browse Properties")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <div key={property._id} className="bg-card rounded-xl border shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={property.imagesUrl?.[0] || property.images?.[0] || '/placeholder-property.jpg'} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => navigate(`/properties/${property._id}`)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                      title={t("View Details")}
                    >
                      <Eye className="h-5 w-5 text-foreground" />
                    </button>
                    <button
                      onClick={() => removeFromFavorites(property._id)}
                      className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors"
                      title={t("Remove from Favorites")}
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{property.title}</h3>
                  <p className="text-muted-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-ethiopian-yellow" />
                    {property.location}
                  </p>
                  <p className="text-2xl font-black text-ethiopian-green mb-4">{formatPrice(property.price)}</p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {property.features?.bedrooms || property.bedrooms} {t("beds")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {property.features?.bathrooms || property.bathrooms} {t("baths")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      {property.features?.area || property.area} m²
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-ethiopian-yellow/20 text-ethiopian-yellow rounded-full text-sm font-semibold">
                      {t(property.type || 'property')}
                    </span>
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
