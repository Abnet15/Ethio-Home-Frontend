import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  User,
  Building,
  Home,
  ArrowLeft,
  Upload,
  Star,
  TrendingUp,
  MoreVertical,
  Download,
  RefreshCw,
  Save,
  Settings,
  Clock,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PropertyCard from "../components/PropertyCard";
import { useAuth } from "../context/AuthContext";
import { propertyService } from "../services/propertyService";
import { userService } from "../services/userService";
import "../styles/admin-dashboard.css";
import "../styles/properties.css";
import "../styles/property-card.css";

const AdminPropertyManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Real data from API
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newProperty, setNewProperty] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    type: "Apartment",
    bedrooms: "",
    bathrooms: "",
    area: "",
    sellerId: "",
    images: [],
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    type: "Apartment",
    bedrooms: "",
    bathrooms: "",
    area: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // Add refresh trigger for forcing re-renders
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch data from API
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch properties and users in parallel
        const [propertiesResult, usersResult] = await Promise.all([
          propertyService.getProperties({isVerified: true, sold: false}),
          userService.getUsers(),
        ]);

        if (propertiesResult.success) {
          const fetchedProperties =
            propertiesResult.data?.data?.data ||
            propertiesResult.data?.data ||
            [];
          setProperties(fetchedProperties);

          // Update stats
          setStats({
            total: fetchedProperties.length,
            approved: fetchedProperties.filter((p) => p.status === "approved")
              .length,
            pending: fetchedProperties.filter((p) => p.status === "pending")
              .length,
            rejected: fetchedProperties.filter((p) => p.status === "rejected")
              .length,
          });
        } else {
          setError(propertiesResult.error);
        }

        if (usersResult.success) {
          const fetchedUsers =
            usersResult.data?.data?.data || usersResult.data?.data || [];
          // Filter only sellers and agents
          const sellersAndAgents = fetchedUsers.filter((user) =>
            ["seller", "agent"].includes(user.role)
          );
          setUsers(sellersAndAgents);
        }
      } catch {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, refreshTrigger]);

  if (!isAdmin) {
    return (
      <div className="modern-property-management">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleAddProperty = async (e) => {
    e.preventDefault();

    try {
      const propertyData = {
        ...newProperty,
        price: parseInt(newProperty.price),
        bedrooms: parseInt(newProperty.bedrooms),
        bathrooms: parseInt(newProperty.bathrooms),
        area: parseInt(newProperty.area),
        owner: newProperty.sellerId,
        status: "pending",
      };

      const result = await propertyService.createProperty(propertyData);

      if (result.success) {
        // Refresh properties list
        const refreshResult = await propertyService.getProperties();
        if (refreshResult.success) {
          const refreshedProperties =
            refreshResult.data?.data?.data || refreshResult.data?.data || [];
          setProperties(refreshedProperties);

          // Update stats
          setStats({
            total: refreshedProperties.length,
            approved: refreshedProperties.filter((p) => p.status === "approved")
              .length,
            pending: refreshedProperties.filter((p) => p.status === "pending")
              .length,
            rejected: refreshedProperties.filter((p) => p.status === "rejected")
              .length,
          });
        }

        setNewProperty({
          title: "",
          description: "",
          price: "",
          location: "",
          type: "Apartment",
          bedrooms: "",
          bathrooms: "",
          area: "",
          sellerId: "",
          images: [],
        });
        setShowAddForm(false);
      } else {
        alert("Failed to create property: " + result.error);
      }
    } catch (error) {
      alert("Failed to create property: " + error.message);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      const result = await propertyService.updateProperty(propertyId, {
        status: newStatus,
      });

      if (result.success) {
        // Update local state
        setProperties(
          properties.map((property) =>
            property._id === propertyId
              ? { ...property, status: newStatus }
              : property
          )
        );

        // Update stats
        setStats((prev) => ({
          ...prev,
          approved: properties.filter(
            (p) =>
              p.status === "approved" ||
              (p._id === propertyId && newStatus === "approved")
          ).length,
          pending: properties.filter(
            (p) =>
              p.status === "pending" ||
              (p._id === propertyId && newStatus === "pending")
          ).length,
          rejected: properties.filter(
            (p) =>
              p.status === "rejected" ||
              (p._id === propertyId && newStatus === "rejected")
          ).length,
          total: properties.length,
        }));
      } else {
        alert("Failed to update property status: " + result.error);
      }
    } catch (error) {
      alert("Failed to update property status: " + error.message);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const result = await propertyService.deleteProperty(propertyId);

        if (result.success) {
          // Remove from local state
          const remaining = properties.filter(
            (property) => property._id !== propertyId
          );
          setProperties(remaining);

          // Update stats
          setStats({
            total: remaining.length,
            approved: remaining.filter((p) => p.status === "approved").length,
            pending: remaining.filter((p) => p.status === "pending").length,
            rejected: remaining.filter((p) => p.status === "rejected").length,
          });
        } else {
          alert("Failed to delete property: " + result.error);
        }
      } catch (error) {
        alert("Failed to delete property: " + error.message);
      }
    }
  };

  const handleEditInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();

    try {
      const result = await propertyService.updateProperty(
        selectedProperty._id,
        editForm
      );

      if (result.success) {
        // Update local state
        setProperties(
          properties.map((property) =>
            property._id === selectedProperty._id
              ? { ...property, ...editForm }
              : property
          )
        );

        // Update selected property
        setSelectedProperty({ ...selectedProperty, ...editForm });

        alert("Property updated successfully!");
        setActiveTab("overview");
      } else {
        alert("Failed to update property: " + result.error);
      }
    } catch (error) {
      alert("Failed to update property: " + error.message);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      console.log('Uploading images for property:', selectedProperty._id);
      console.log('Files to upload:', files.length);
      
      const result = await propertyService.uploadPropertyImages(
        selectedProperty._id,
        files
      );

      console.log('Upload result:', result);

      if (result.success) {
        // Extract images from various possible response formats
        let updatedImages = [];
        if (result.data?.data?.images) {
          updatedImages = result.data.data.images;
        } else if (result.data?.images) {
          updatedImages = result.data.images;
        } else if (result.data?.data) {
          updatedImages = result.data.data;
        } else if (Array.isArray(result.data)) {
          updatedImages = result.data;
        }
        
        console.log('Extracted images:', updatedImages);

        // Update local state with new images
        const updatedProperty = {
          ...selectedProperty,
          images: updatedImages,
        };
        
        // Update properties list
        setProperties(prevProperties => 
          prevProperties.map((property) =>
            property._id === selectedProperty._id ? updatedProperty : property
          )
        );
        
        // Update selected property
        setSelectedProperty(updatedProperty);

        // Clear the file input
        e.target.value = '';

        alert("Images uploaded successfully!");
        
        // Force a re-render by updating a state that triggers useEffect
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.error('Upload failed:', result.error);
        alert("Failed to upload images: " + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert("Failed to upload images: " + error.message);
    }
  };

  const handleRemoveImage = async (imageIndex) => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;

    try {
      console.log('Removing image at index:', imageIndex);
      
      const updatedImages = selectedProperty.images.filter(
        (_, index) => index !== imageIndex
      );
      
      console.log('Updated images array:', updatedImages);
      
      const result = await propertyService.updateProperty(
        selectedProperty._id,
        { images: updatedImages }
      );

      console.log('Remove image result:', result);

      if (result.success) {
        // Update local state
        const updatedProperty = { ...selectedProperty, images: updatedImages };
        
        // Update properties list
        setProperties(prevProperties => 
          prevProperties.map((property) =>
            property._id === selectedProperty._id ? updatedProperty : property
          )
        );
        
        // Update selected property
        setSelectedProperty(updatedProperty);

        alert("Image removed successfully!");
        
        // Force a re-render
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.error('Remove image failed:', result.error);
        alert("Failed to remove image: " + result.error);
      }
    } catch (error) {
      console.error('Remove image error:', error);
      alert("Failed to remove image: " + error.message);
    }
  };

  const openPropertyDetails = (property) => {
    setSelectedProperty(property);
    setEditForm({
      title: property.title || "",
      description: property.description || "",
      price: property.price || "",
      location: property.location || "",
      type: property.type || "Apartment",
      bedrooms: property.bedrooms || "",
      bathrooms: property.bathrooms || "",
      area: property.area || "",
    });
    setActiveTab("overview");
    setShowPropertyDetails(true);
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;
    const matchesType =
      typeFilter === "all" ||
      property.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "apartment":
        return <Building size={16} />;
      case "house":
        return <Home size={16} />;
      case "villa":
        return <Star size={16} />;
      case "commercial":
        return <Building size={16} />;
      default:
        return <Home size={16} />;
    }
  };

  return (
    <div className="modern-property-management">
      <div className="container">
        {/* Header */}
        <div className="property-header">
          <div className="header-left">
            <button
              className="back-btn"
              onClick={() => navigate("/admin-dashboard")}
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1>Property Management</h1>
              <p>Create and manage property listings</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn secondary">
              <Download size={16} />
              Export
            </button>
            <button
              className="action-btn secondary"
              onClick={() => setRefreshTrigger(prev => prev + 1)}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              className="action-btn primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} />
              Add Property
            </button>
          </div>
        </div>

        {/* Admin Instructions */}
        {stats.pending > 0 && (
          <div className="admin-instructions">
            <div className="instruction-header">
              <h3>
                ⚠️ Action Required: {stats.pending} Properties Pending Approval
              </h3>
              <p>
                You have {stats.pending} properties waiting for your review.
                Please approve or reject them to keep the listing process
                moving.
              </p>
            </div>
            <div className="instruction-actions">
              <button
                className="instruction-btn primary"
                onClick={() => setStatusFilter("pending")}
              >
                View Pending Properties
              </button>
              <button
                className="instruction-btn secondary"
                onClick={() => {
                  if (
                    window.confirm(
                      `Approve all ${stats.pending} pending properties?`
                    )
                  ) {
                    filteredProperties
                      .filter((p) => p.status === "pending")
                      .forEach((property) =>
                        handleStatusChange(property._id, "approved")
                      );
                  }
                }}
              >
                Approve All Pending
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="property-stats">
          <button
            type="button"
            className="stat-card total"
            onClick={() => setStatusFilter("all")}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">
              <Building size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Properties</div>
            </div>
          </button>
          <button
            type="button"
            className="stat-card approved"
            onClick={() => setStatusFilter("approved")}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">
              <Check size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.approved}</div>
              <div className="stat-label">Approved</div>
            </div>
          </button>
          <button
            type="button"
            className="stat-card pending"
            onClick={() => setStatusFilter("pending")}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </button>
          <button
            type="button"
            className="stat-card rejected"
            onClick={() => setStatusFilter("rejected")}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">
              <X size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.rejected}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </button>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="property-filters">
          <div className="search-section">
            <div className="search-input">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-section">
            <div className="status-filter-group">
              <label className="filter-label">Status Filter:</label>
              <div className="status-filter-buttons">
                <button
                  className={`status-filter-btn ${
                    statusFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("all")}
                >
                  All ({stats.total})
                </button>
                <button
                  className={`status-filter-btn pending ${
                    statusFilter === "pending" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  className={`status-filter-btn approved ${
                    statusFilter === "approved" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("approved")}
                >
                  Approved ({stats.approved})
                </button>
                <button
                  className={`status-filter-btn rejected ${
                    statusFilter === "rejected" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("rejected")}
                >
                  Rejected ({stats.rejected})
                </button>
              </div>
            </div>
            <div className="type-filter-group">
              <label className="filter-label">Type Filter:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartments</option>
                <option value="house">Houses</option>
                <option value="villa">Villas</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading properties...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={() => setRefreshTrigger(prev => prev + 1)}>Retry</button>
          </div>
        )}

{/* Quick Admin Actions */}
        {!loading && !error && stats.pending > 0 && (
          <div className="quick-admin-actions">
            <button
              className="quick-admin-btn approve-all"
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to approve all ${stats.pending} pending properties?`
                  )
                ) {
                  filteredProperties
                    .filter((p) => p.status === "pending")
                    .forEach((property) =>
                      handleStatusChange(property._id, "approved")
                    );
                }
              }}
            >
              <Check size={16} />
              Approve All Pending ({stats.pending})
            </button>
            <button
              className="quick-admin-btn bulk-actions"
              onClick={() => {
                // TODO: Implement bulk selection and actions
                alert("Bulk selection feature coming soon!");
              }}
            >
              <Settings size={16} />
              Bulk Actions
            </button>
          </div>
        )}

        {/* Properties Grid/List */}
        {!loading && !error && (
          <div className={`properties-container ${viewMode}`}>
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className="admin-card"
                data-status={property.status}
              >
                <PropertyCard
                  property={property}
                  viewMode={viewMode}
                  isAdmin={true}
                  onStatusChange={handleStatusChange}
                />
                <div
                  className="property-card-actions admin-card-actions"
                  style={{ marginTop: "8px" }}
                >
                  <button
                    className="card-action-btn view"
                    title="View Details"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPropertyDetails(property);
                      setActiveTab("overview");
                    }}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="card-action-btn edit"
                    title="Edit Property"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPropertyDetails(property);
                      setActiveTab("edit");
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="card-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProperty(property._id);
                    }}
                    title="Delete Property"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Property Details Modal */}
        {showPropertyDetails && selectedProperty && (
          <div className="modal-overlay">
            <div className="modal-content property-details-modal">
              <div className="modal-header">
                <h2>Property Details - {selectedProperty.title}</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowPropertyDetails(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="property-details-tabs">
                  <button
                    className={`tab ${
                      activeTab === "overview" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    <Eye size={16} />
                    Overview
                  </button>
                  <button
                    className={`tab ${activeTab === "edit" ? "active" : ""}`}
                    onClick={() => setActiveTab("edit")}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    className={`tab ${activeTab === "images" ? "active" : ""}`}
                    onClick={() => setActiveTab("images")}
                  >
                    <Upload size={16} />
                    Images
                  </button>
                  <button
                    className={`tab ${activeTab === "actions" ? "active" : ""}`}
                    onClick={() => setActiveTab("actions")}
                  >
                    <Settings size={16} />
                    Actions
                  </button>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="property-overview">
                    <div className="property-header-info">
                      <div className="property-main-info">
                        <h3>{selectedProperty.title}</h3>
                        <p className="property-description">
                          {selectedProperty.description}
                        </p>
                        <div className="property-price-large">
                          {formatCurrency(selectedProperty.price)}
                        </div>
                      </div>
                      <div className="property-status-section">
                        <span
                          className={`status-badge large ${selectedProperty.status}`}
                          style={{
                            backgroundColor: getStatusColor(
                              selectedProperty.status
                            ),
                          }}
                        >
                          {selectedProperty.status}
                        </span>
                      </div>
                    </div>

                    <div className="property-details-grid">
                      <div className="detail-section">
                        <h4>Basic Information</h4>
                        <div className="detail-row">
                          <span className="detail-label">Type:</span>
                          <span className="detail-value">
                            {selectedProperty.type}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">
                            {selectedProperty.location}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Bedrooms:</span>
                          <span className="detail-value">
                            {selectedProperty.bedrooms}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Bathrooms:</span>
                          <span className="detail-value">
                            {selectedProperty.bathrooms}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Area:</span>
                          <span className="detail-value">
                            {selectedProperty.area} m²
                          </span>
                        </div>
                      </div>

                      <div className="detail-section">
                        <h4>Owner Information</h4>
                        <div className="detail-row">
                          <span className="detail-label">Owner:</span>
                          <span className="detail-value">
                            {selectedProperty.owner?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Owner Email:</span>
                          <span className="detail-value">
                            {selectedProperty.owner?.email || "Not provided"}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Views:</span>
                          <span className="detail-value">
                            {selectedProperty.views || 0}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Created:</span>
                          <span className="detail-value">
                            {new Date(
                              selectedProperty.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Tab */}
                {activeTab === "edit" && (
                  <div className="property-edit-section">
                    <h3>Edit Property</h3>
                    <form onSubmit={handleUpdateProperty} className="edit-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="editTitle">Title</label>
                          <input
                            type="text"
                            id="editTitle"
                            name="title"
                            value={editForm.title}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="editPrice">Price (ETB)</label>
                          <input
                            type="number"
                            id="editPrice"
                            name="price"
                            value={editForm.price}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="editDescription">Description</label>
                        <textarea
                          id="editDescription"
                          name="description"
                          value={editForm.description}
                          onChange={handleEditInputChange}
                          rows="4"
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="editLocation">Location</label>
                          <input
                            type="text"
                            id="editLocation"
                            name="location"
                            value={editForm.location}
                            onChange={handleEditInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="editType">Type</label>
                          <select
                            id="editType"
                            name="type"
                            value={editForm.type}
                            onChange={handleEditInputChange}
                            required
                          >
                            <option value="Apartment">Apartment</option>
                            <option value="House">House</option>
                            <option value="Villa">Villa</option>
                            <option value="Commercial">Commercial</option>
                          </select>
                        </div>
                      </div>

<div className="form-row">
                        <div className="form-group">
                          <label htmlFor="editBedrooms">Bedrooms</label>
                          <input
                            type="number"
                            id="editBedrooms"
                            name="bedrooms"
                            value={editForm.bedrooms}
                            onChange={handleEditInputChange}
                            min="0"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="editBathrooms">Bathrooms</label>
                          <input
                            type="number"
                            id="editBathrooms"
                            name="bathrooms"
                            value={editForm.bathrooms}
                            onChange={handleEditInputChange}
                            min="0"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="editArea">Area (m²)</label>
                          <input
                            type="number"
                            id="editArea"
                            name="area"
                            value={editForm.area}
                            onChange={handleEditInputChange}
                            min="1"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          <Save size={16} />
                          Update Property
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setActiveTab("overview")}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Images Tab */}
                {activeTab === "images" && (
                  <div className="property-images-section">
                    <h3>Property Images</h3>
                    <div className="current-images">
                      <h4>Current Images</h4>
                      {selectedProperty.images &&
                      selectedProperty.images.length > 0 ? (
                        <div className="images-grid">
                          {selectedProperty.images.map((image, index) => (
                            <div key={index} className="image-item">
                              <img src={image} alt={`Property ${index + 1}`} />
                              <button
                                className="remove-image-btn"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No images uploaded yet.</p>
                      )}
                    </div>

                    <div className="upload-images">
                      <h4>Upload New Images</h4>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file-input"
                      />
                      <p className="upload-note">
                        Select multiple images to upload
                      </p>
                    </div>
                  </div>
                )}

{/* Actions Tab */}
                {activeTab === "actions" && (
                  <div className="property-actions-section">
                    <h3>Property Actions</h3>

                    <div className="action-group">
                      <h4>Status Management</h4>
                      <div className="status-actions">
                        {selectedProperty.status === "pending" && (
                          <>
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                handleStatusChange(
                                  selectedProperty._id,
                                  "approved"
                                )
                              }
                            >
                              <Check size={16} />
                              Approve Property
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                handleStatusChange(
                                  selectedProperty._id,
                                  "rejected"
                                )
                              }
                            >
                              <X size={16} />
                              Reject Property
                            </button>
                          </>
                        )}
                        {selectedProperty.status === "approved" && (
                          <button
                            className="btn btn-warning"
                            onClick={() =>
                              handleStatusChange(
                                selectedProperty._id,
                                "pending"
                              )
                            }
                          >
                            <Clock size={16} />
                            Mark as Pending
                          </button>
                        )}
                        {selectedProperty.status === "rejected" && (
                          <button
                            className="btn btn-success"
                            onClick={() =>
                              handleStatusChange(
                                selectedProperty._id,
                                "pending"
                              )
                            }
                          >
                            <Check size={16} />
                            Mark as Pending
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="action-group">
                      <h4>Property Management</h4>
                      <div className="management-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => setActiveTab("edit")}
                        >
                          <Edit size={16} />
                          Edit Property
                        </button>
                        <button
                          className="btn btn-warning"
                          onClick={() => setActiveTab("images")}
                        >
                          <Upload size={16} />
                          Manage Images
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            handleDeleteProperty(selectedProperty._id)
                          }
                        >
                          <Trash2 size={16} />
                          Delete Property
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPropertyDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Property Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add New Property</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddProperty} className="property-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="addTitle">Property Title</label>
                    <input
                      id="addTitle"
                      type="text"
                      value={newProperty.title}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Modern Villa in Bole"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="addPrice">Price (ETB)</label>
                    <input
                      id="addPrice"
                      type="number"
                      value={newProperty.price}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          price: e.target.value,
                        })
                      }
                      placeholder="e.g., 15000000"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="addDescription">Description</label>
                    <textarea
                      id="addDescription"
                      value={newProperty.description}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the property..."
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="addLocation">Location</label>
                    <input
                      id="addLocation"
                      type="text"
                      value={newProperty.location}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          location: e.target.value,
                        })
                      }
                      placeholder="e.g., Bole, Addis Ababa"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="addSeller">Seller</label>
                    <select
                      id="addSeller"
                      value={newProperty.sellerId}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          sellerId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select a seller</option>
                      {users
                        .filter(
                          (user) =>
                            user.role === "seller" || user.role === "agent"
                        )
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <span className="form-label" id="addTypeLabel">
                      Property Type
                    </span>
                    <div className="type-selection">
                      {["Apartment", "House", "Villa", "Commercial"].map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            className={`type-btn ${
                              newProperty.type === type ? "active" : ""
                            }`}
                            onClick={() =>
                              setNewProperty({ ...newProperty, type })
                            }
                            aria-labelledby="addTypeLabel"
                          >
                            {getTypeIcon(type)}
                            {type}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="addBedrooms">Bedrooms</label>
                    <input
                      id="addBedrooms"
                      type="number"
                      value={newProperty.bedrooms}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          bedrooms: e.target.value,
                        })
                      }
                      placeholder="Number of bedrooms"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="addBathrooms">Bathrooms</label>
                    <input
                      id="addBathrooms"
                      type="number"
                      value={newProperty.bathrooms}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          bathrooms: e.target.value,
                        })
                      }
                      placeholder="Number of bathrooms"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="addArea">Area (m²)</label>
                    <input
                      id="addArea"
                      type="number"
                      value={newProperty.area}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, area: e.target.value })
                      }
                      placeholder="Area in square meters"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="addImages">Property Images</label>
                    <div className="image-upload">
                      <Upload size={24} />
                      <p>Upload Images</p>
                      <span>Drag and drop or click to browse</span>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertyManagement;