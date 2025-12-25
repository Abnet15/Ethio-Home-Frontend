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
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-muted transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              currentPage === page 
                ? "bg-ethiopian-yellow text-white border-ethiopian-yellow" 
                : "border-gray-300 hover:bg-muted"
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-muted transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
            {t("Properties")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("Discover your perfect property from our extensive collection")}
          </p>
          
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
        <div className="bg-card rounded-xl border shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 w-full flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("Search properties...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow focus:border-transparent"
                />
              </div>
              <button 
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                {t("Search")}
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 border-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  showFilters 
                    ? "bg-ethiopian-yellow/20 border-ethiopian-yellow text-ethiopian-yellow" 
                    : "border-gray-300 hover:border-ethiopian-yellow"
                }`}
              >
                <Filter className="h-5 w-5" />
                {t("Filter")}
              </button>
            </form>

            {/* View Mode Toggle */}
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid" 
                    ? "bg-ethiopian-yellow text-white" 
                    : "hover:bg-muted"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list" 
                    ? "bg-ethiopian-yellow text-white" 
                    : "hover:bg-muted"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-card rounded-xl border shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{t("Filter Properties")}</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("Property Type")}</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-yellow focus:border-transparent"
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
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {t("Showing")} <span className="font-semibold text-foreground">{startIndex + 1}-{Math.min(endIndex, filteredProperties.length)}</span> {t("of")}{" "}
            <span className="font-semibold text-foreground">{filteredProperties.length}</span> {t("properties")}
          </p>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/favorites")}
              className="flex items-center gap-2 px-4 py-2 border border-ethiopian-yellow/50 rounded-lg hover:bg-ethiopian-yellow/10 transition-colors"
            >
              <Heart className="h-4 w-4 text-ethiopian-yellow" />
              <span className="font-semibold">{t("My Favorites")} ({favorites.size})</span>
            </button>
          )}
        </div>

        {/* Properties Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">{t("Loading properties...")}</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <>
            <div className={`grid ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "grid-cols-1 gap-6"
            }`}>
              {currentProperties.map((property) => (
                <PropertyCard
                  key={property._id}
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
            <div className="mt-8">
              {renderPagination()}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">{t("No properties found")}</h3>
            <p className="text-muted-foreground mb-6">{t("Try adjusting your search criteria or filters")}</p>
            <button 
              onClick={clearFilters} 
              className="px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {t("Clear Filters")}
            </button>
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