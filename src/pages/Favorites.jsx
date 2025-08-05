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
      <div className="favorites-page">
        <div className="favorites-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t("Loading favorites...")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <div className="favorites-header">
          <div className="favorites-title">
            <Heart style={{ width: "24px", height: "24px", color: "#e74c3c" }} />
            <h1>{t("My Favorites")}</h1>
            <span className="favorites-count">({favorites.length})</span>
          </div>
          
          {favorites.length > 0 && (
            <button 
              onClick={clearAllFavorites}
              className="clear-favorites-btn"
            >
              <Trash2 style={{ width: "16px", height: "16px" }} />
              {t("Clear All")}
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadFavorites} className="btn btn-primary">
              {t("Try Again")}
            </button>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <Heart style={{ width: "64px", height: "64px", color: "#bdc3c7" }} />
            <h3>{t("No favorites yet")}</h3>
            <p>{t("Start browsing properties and add them to your favorites!")}</p>
            <button 
              onClick={() => navigate("/properties")}
              className="btn btn-primary"
            >
              {t("Browse Properties")}
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {console.log("favorites",favorites)}
            {favorites.map((property) => (
              <div key={property._id} className="favorite-card">
                <div className="favorite-card-image">
                  <img 
                    src={property.imagesUrl?.[0]} 
                    alt={property.title}
                  />
                  <div className="favorite-card-actions">
                    <button
                      onClick={() => navigate(`/properties/${property._id}`)}
                      className="view-btn"
                      title={t("View Details")}
                    >
                      <Eye style={{ width: "40px", height: "40px" }} />
                    </button>
                    <button
                      onClick={() => removeFromFavorites(property._id)}
                      className="remove-btn"
                      title={t("Remove from Favorites")}
                    >
                      <Trash2 style={{ width: "16px", height: "16px" }} />
                    </button>
                  </div>
                </div>
                
                <div className="favorite-card-content">
                  <h3 className="favorite-card-title">{property.title}</h3>
                  <p className="favorite-card-location">
                    <MapPin style={{ width: "14px", height: "14px" }} />
                    {property.location}
                  </p>
                  <p className="favorite-card-price">{formatPrice(property.price)}</p>
                  
                  <div className="favorite-card-details">
                    <span className="detail-item">
                      <Bed style={{ width: "14px", height: "14px" }} />
                      {property.bedrooms} {t("beds")}
                    </span>
                    <span className="detail-item">
                      <Bath style={{ width: "14px", height: "14px" }} />
                      {property.bathrooms} {t("baths")}
                    </span>
                    <span className="detail-item">
                      <Square style={{ width: "14px", height: "14px" }} />
                      {property.area} m²
                    </span>
                  </div>
                  
                  <div className="favorite-card-type">
                    <span className={`type-badge ${property.type}`}>
                      {t(property.type)}
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
