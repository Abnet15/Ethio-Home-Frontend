import {
  Search,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
  Image as ImageIcon,
  Upload,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PropertyCard from "../components/PropertyCard";
import PropertyImageManager from "../components/PropertyImageManager";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { favoritesService } from "../services/favoritesService";
import { propertyService } from "../services/propertyService";


const Properties = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Image management state
  const [showImageManager, setShowImageManager] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const result = await propertyService.getProperties({isVerified: true, sold: false});
        if (result.success) {
          // Backend returns: { status: 'success', data: { data: [...] } }
          const fetchedProperties = result.data?.data?.data || [];
          // Show only verified properties
          const verifiedProperties = fetchedProperties.filter(p => p.isVerified === true);
          setProperties(verifiedProperties);
          setFilteredProperties(verifiedProperties);
        } else {
          console.error("Error fetching properties:", result.error);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Load favorites from API
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    }
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    try {
      const result = await favoritesService.getFavorites();
      if (result.success) {
        const favoritesList = result.data.data.favorites || [];
        const favoritesSet = new Set(favoritesList.map(fav => fav._id));
        setFavorites(favoritesSet);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  };

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get("search");
    const typeParam = urlParams.get("type");

    if (searchParam) setSearchQuery(searchParam);
    if (typeParam) setFilters((prev) => ({ ...prev, type: typeParam }));
  }, [location.search]);

  // Filter state
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    minArea: "",
    maxArea: "",
  });

  // Apply filters and search
  useEffect(() => {
    let filtered = [...properties];

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(
        (property) => property.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (property) => property.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.location) {
      filtered = filtered.filter((property) =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (property) => property.price >= parseInt(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (property) => property.price <= parseInt(filters.maxPrice)
      );
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(
        (property) => (property.features?.bedrooms || property.bedrooms || 0) >= parseInt(filters.bedrooms)
      );
    }

    if (filters.bathrooms) {
      filtered = filtered.filter(
        (property) => (property.features?.bathrooms || property.bathrooms || 0) >= parseInt(filters.bathrooms)
      );
    }

    if (filters.minArea) {
      filtered = filtered.filter(
        (property) => (property.features?.area || property.area || 0) >= parseInt(filters.minArea)
      );
    }

    if (filters.maxArea) {
      filtered = filtered.filter(
        (property) => (property.features?.area || property.area || 0) <= parseInt(filters.maxArea)
      );
    }

    setFilteredProperties(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [properties, searchQuery, filters]);

  // Pagination settings
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      location: "",
      bedrooms: "",
      bathrooms: "",
      minArea: "",
      maxArea: "",
    });
    setSearchQuery("");
    navigate(location.pathname);
  };

  const toggleFavorite = async (propertyId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const result = await favoritesService.toggleFavorite(propertyId);
      if (result.success) {
        // Reload favorites to get the updated state
        await loadFavorites();
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          <ChevronLeft style={{ width: "16px", height: "16px" }} />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="pagination-number"
            >
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`pagination-number ${
              currentPage === page ? "active" : ""
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="pagination-number"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          <ChevronRight style={{ width: "16px", height: "16px" }} />
        </button>
      </div>
    );
  };

  // Handle property update after image changes
  const handlePropertyUpdate = (updatedProperty) => {
    setProperties(prevProperties => 
      prevProperties.map(prop => 
        prop._id === updatedProperty._id ? updatedProperty : prop
      )
    );
    setFilteredProperties(prevFiltered => 
      prevFiltered.map(prop => 
        prop._id === updatedProperty._id ? updatedProperty : prop
      )
    );
  };

  // Open image manager for a specific property
  const openImageManager = (property) => {
    setSelectedProperty(property);
    setShowImageManager(true);
  };

  // Close image manager
  const closeImageManager = () => {
    setShowImageManager(false);
    setSelectedProperty(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-secondary)",
        paddingTop: "32px",
        paddingBottom: "64px",
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="properties-header">
          <div>
            <h1 className="properties-title">{t("Properties")}</h1>
            <p className="properties-subtitle">
              {t("Discover your perfect property from our extensive collection")}
            </p>
          </div>
          
          {/* Image Management Button for Property Owners */}
          {/* {isAuthenticated && (
            <div className="header-actions">
              <button
                onClick={() => setShowImageManager(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ImageIcon size={16} />
                Manage Images
              </button>
            </div>
          )} */}
        </div>

        {/* Search and Filters */}
        <div className="search-filter-section">
          <form onSubmit={handleSearch} className="search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder={t("Search properties...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-button">
              {t("Search")}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="filter-button"
            >
              <Filter style={{ width: "16px", height: "16px" }} />
              {t("Filter")}
            </button>
          </form>

          {/* View Mode Toggle */}
          <div className="view-controls">
            <div className="view-mode-toggle">
              <button
                onClick={() => setViewMode("grid")}
                className={`view-mode-btn ${
                  viewMode === "grid" ? "active" : ""
                }`}
              >
                <Grid style={{ width: "16px", height: "16px" }} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`view-mode-btn ${
                  viewMode === "list" ? "active" : ""
                }`}
              >
                <List style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-header">
              <h3>{t("Filter Properties")}</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="close-filters"
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div className="filter-grid">
              <div className="filter-group">
                <label>{t("Property Type")}</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="filter-select"
                >
                  <option value="">{t("All Types")}</option>
                  <option value="house">{t("House")}</option>
                  <option value="apartment">{t("Apartment")}</option>
                  <option value="villa">{t("Villa")}</option>
                  <option value="commercial">{t("Commercial")}</option>
                  <option value="land">{t("Land")}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t("Status")}</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="filter-select"
                >
                  <option value="">{t("All Status")}</option>
                  <option value="for-sale">{t("For Sale")}</option>
                  <option value="for-rent">{t("For Rent")}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t("Location")}</label>
                <input
                  type="text"
                  placeholder={t("Enter location")}
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>{t("Min Price (ETB)")}</label>
                <input
                  type="number"
                  placeholder={t("Min price")}
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>{t("Max Price (ETB)")}</label>
                <input
                  type="number"
                  placeholder={t("Max price")}
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>{t("Bedrooms")}</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) =>
                    handleFilterChange("bedrooms", e.target.value)
                  }
                  className="filter-select"
                >
                  <option value="">{t("Any")}</option>
                  <option value="1">{t("1+")}</option>
                  <option value="2">{t("2+")}</option>
                  <option value="3">{t("3+")}</option>
                  <option value="4">{t("4+")}</option>
                  <option value="5">{t("5+")}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t("Bathrooms")}</label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) =>
                    handleFilterChange("bathrooms", e.target.value)
                  }
                  className="filter-select"
                >
                  <option value="">{t("Any")}</option>
                  <option value="1">{t("1+")}</option>
                  <option value="2">{t("2+")}</option>
                  <option value="3">{t("3+")}</option>
                  <option value="4">{t("4+")}</option>
                </select>
              </div>

              <div className="filter-group">
                <label>{t("Min Area (m²)")}</label>
                <input
                  type="number"
                  placeholder={t("Min area")}
                  value={filters.minArea}
                  onChange={(e) =>
                    handleFilterChange("minArea", e.target.value)
                  }
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>{t("Max Area (m²)")}</label>
                <input
                  type="number"
                  placeholder={t("Max area")}
                  value={filters.maxArea}
                  onChange={(e) =>
                    handleFilterChange("maxArea", e.target.value)
                  }
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="clear-filters-btn">
                {t("Clear All")}
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="results-summary">
          <p>
            {t("Showing")} {startIndex + 1}-
            {Math.min(endIndex, filteredProperties.length)} {t("of")}{" "}
            {filteredProperties.length} {t("properties")}
          </p>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/favorites")}
              className="favorites-link"
            >
              <Heart style={{ width: "16px", height: "16px" }} />
              {t("My Favorites")} ({favorites.size})
            </button>
          )}
        </div>

        {/* Properties Grid/List */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t("Loading properties...")}</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <>
            <div className={`properties-container ${viewMode}`}>
              {currentProperties.map((property) => (
                <PropertyCard
                  key={property._id} // Use _id from API response
                  property={property}
                  isFavorite={favorites.has(property._id)}
                  onToggleFavorite={() => toggleFavorite(property._id)}
                  viewMode={viewMode}
                  onImageManage={() => openImageManager(property)}
                  canManageImages={isAuthenticated && (
                    user?.role === 'admin' || 
                    user?.role === 'employee' || 
                    (user?._id === property?.owner?._id || user?._id === property?.owner)
                  )}
                />
              ))}
            </div>
            {renderPagination()}
          </>
        ) : (
          <div className="no-results">
            <div className="no-results-content">
              <Search
                style={{
                  width: "64px",
                  height: "64px",
                  color: "var(--text-tertiary)",
                }}
              />
              <h3>{t("No properties found")}</h3>
              <p>{t("Try adjusting your search criteria or filters")}</p>
              <button onClick={clearFilters} className="btn btn-primary">
                {t("Clear Filters")}
              </button>
            </div>
          </div>
        )}

        {/* Image Manager Modal */}
        {showImageManager && (
          <div className="image-manager-modal">
            <div className="image-manager-content">
              <div className="image-manager-header">
                <h2>
                  <ImageIcon size={24} />
                  Property Image Management
                </h2>
                <button
                  onClick={closeImageManager}
                  className="close-btn"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              {selectedProperty ? (
                <div className="selected-property-info">
                  <h3>{selectedProperty.title}</h3>
                  <p>{selectedProperty.location}</p>
                  <p>Price: ETB {selectedProperty.price?.toLocaleString()}</p>
                </div>
              ) : (
                <div className="property-selector">
                  <h3>Select a Property to Manage Images</h3>
                  <div className="property-list">
                    {properties
                      .filter(property => 
                        user?.role === 'admin' || 
                        user?.role === 'employee' || 
                        (user?._id === property?.owner?._id || user?._id === property?.owner)
                      )
                      .map(property => (
                        <div
                          key={property._id}
                          className={`property-option ${selectedProperty?._id === property._id ? 'selected' : ''}`}
                          onClick={() => setSelectedProperty(property)}
                        >
                          <div className="property-option-image">
                            {property.imagesUrl?.[0] || property.images?.[0] ? (
                              <img 
                                src={property.imagesUrl?.[0] || property.images?.[0]} 
                                alt={property.title}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : (
                              <div className="no-image-placeholder">
                                <ImageIcon size={24} />
                              </div>
                            )}
                            <div className="image-error" style={{ display: 'none' }}>
                              <ImageIcon size={24} />
                            </div>
                          </div>
                          <div className="property-option-details">
                            <h4>{property.title}</h4>
                            <p>{property.location}</p>
                            <p className="image-count">
                              {property.imagesUrl?.length || property.images?.length || 0} images
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {selectedProperty && (
                <PropertyImageManager
                  property={selectedProperty}
                  onPropertyUpdate={handlePropertyUpdate}
                  isEditable={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;