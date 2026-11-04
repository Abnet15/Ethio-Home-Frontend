import { Heart, MapPin, Bed, Bath, Square, Trash2, Eye, Building2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { favoritesService } from "../services/favoritesService";
import PropertyCard from "../components/PropertyCard";

const Favorites = () => {
  const { t, currentLanguage } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    
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

      const result = await favoritesService.getFavorites();
      if (result.success) {
        setFavorites(result.data?.data?.favorites || []);
      } else {
        const errorMsg = result.error || "Failed to load favorites";
        if (
          errorMsg.toLowerCase().includes("not logged in") ||
          errorMsg.toLowerCase().includes("unauthorized") ||
          errorMsg.toLowerCase().includes("401")
        ) {
          navigate("/login");
          return;
        }
        setError(t(errorMsg) || errorMsg);
      }
    } catch (err) {
      console.error("Failed to load favorites:", err);
      if (err.response?.status === 401 || err.message?.toLowerCase().includes("unauthorized")) {
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
      const result = await favoritesService.removeFromFavorites(propertyId);
      if (result.success) {
        setFavorites((prev) => prev.filter((property) => (property._id || property.id) !== propertyId));
      }
    } catch (err) {
      console.error("Failed to remove from favorites:", err);
    }
  };

  const clearAllFavorites = async () => {
    if (window.confirm(t("Are you sure you want to clear all favorites?") || "Are you sure you want to clear all favorites?")) {
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0B6E4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-[#6B7280] dark:text-[#A8B5AE]">
            {authLoading ? (t("Checking authentication...") || "Checking authentication...") : (t("Loading favorites...") || "Loading favorites...")}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5E0D8] dark:border-[#2A342E]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center shadow-sm">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {currentLanguage === "am" ? "የተወደዱ ንብረቶች" : "Saved Properties"}
              </h1>
              <p className="text-xs text-[#6B7280] dark:text-[#6B7A73] mt-0.5">
                {favorites.length} {favorites.length === 1 ? "property" : "properties"} {currentLanguage === "am" ? "ተቀምጠዋል" : "saved to your wishlist"}
              </p>
            </div>
          </div>
          
          {favorites.length > 0 && (
            <button 
              onClick={clearAllFavorites}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] hover:border-red-400 text-red-500 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>{currentLanguage === "am" ? "ሁሉንም አጽዳ" : "Clear Wishlist"}</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold mb-6">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {currentLanguage === "am" ? "ምንም የተወደዱ ንብረቶች የሉም" : "No saved properties yet"}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#6B7A73] mb-6 max-w-md mx-auto">
              {currentLanguage === "am"
                ? "በፈለጉት ጊዜ በቀላሉ ለማግኘት ንብረቶችን ሲያስሱ የልብ ምልክቷን ይጫኑ"
                : "Explore verified listings across Addis Ababa and tap the heart icon to save them here for easy comparison."}
            </p>
            <button 
              onClick={() => navigate("/properties")}
              className="px-6 py-3 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] text-white text-sm font-bold shadow-md hover:shadow-[0_0_20px_rgba(212,160,23,0.3)] transition-all cursor-pointer"
            >
              {currentLanguage === "am" ? "ንብረቶችን አስስ" : "Browse Properties"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property, index) => (
              <PropertyCard
                key={property._id || property.id || index}
                property={property}
                isFavorite={true}
                onToggleFavorite={removeFromFavorites}
                index={index}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Favorites;
