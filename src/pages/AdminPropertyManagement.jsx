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
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import PropertyCard from "../components/PropertyCard";
import { useAuth } from "../context/AuthContext";
import { usePropertiesQuery, useCreateProperty, useUpdateProperty, useDeleteProperty } from "../hooks/usePropertiesQuery";
import { useUsersQuery } from "../hooks/useUsersQuery";
import { propertyService } from "../services/propertyService";
import "../styles/admin-dashboard.css";
import "../styles/properties.css";
import "../styles/property-card.css";

const AdminPropertyManagement = () => {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

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

  // React Query hooks for data fetching
  const { data: propertiesData, isLoading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = usePropertiesQuery(
    { isVerified: true, sold: false },
    { enabled: !authLoading && isAdmin && !!user }
  );
  const properties = propertiesData?.properties || [];

  const { data: usersData, isLoading: usersLoading } = useUsersQuery(
    {},
    { enabled: !authLoading && isAdmin && !!user }
  );
  const allUsers = usersData?.users || [];
  const users = useMemo(() => 
    allUsers.filter((user) => ["seller", "agent"].includes(user.role)),
    [allUsers]
  );

  // Mutations
  const createPropertyMutation = useCreateProperty();
  const updatePropertyMutation = useUpdateProperty();
  const deletePropertyMutation = useDeleteProperty();

  // Calculate stats from properties
  const stats = useMemo(() => ({
    total: properties.length,
    approved: properties.filter((p) => p.status === "approved").length,
    pending: properties.filter((p) => p.status === "pending").length,
    rejected: properties.filter((p) => p.status === "rejected").length,
  }), [properties]);

  const loading = propertiesLoading || usersLoading;
  const error = propertiesError?.message || null;

  // Wait for auth to finish loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-slate-400 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !user) {
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

      await createPropertyMutation.mutateAsync(propertyData);
      
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
    } catch (error) {
      alert("Failed to create property: " + error.message);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await updatePropertyMutation.mutateAsync({
        id: propertyId,
        propertyData: { status: newStatus },
      });
    } catch (error) {
      alert("Failed to update property status: " + error.message);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await deletePropertyMutation.mutateAsync(propertyId);
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
        // Update selected property for immediate UI feedback
        setSelectedProperty({ ...selectedProperty, ...editForm });

        // Refetch properties to update the list
        refetchProperties();

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
        
        // Update selected property for immediate UI feedback
        setSelectedProperty(updatedProperty);

        // Clear the file input
        e.target.value = '';

        alert("Images uploaded successfully!");
        
        // Refetch properties to update the list
        refetchProperties();
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
      
      const result = await propertyService.removePropertyImage(
        selectedProperty._id,
        imageIndex
      );

      console.log('Remove image result:', result);

      if (result.success) {
        // Extract updated images from response
        let updatedImages = [];
        if (result.data?.data?.images) {
          updatedImages = result.data.data.images;
        } else if (result.data?.images) {
          updatedImages = result.data.images;
        } else if (result.data?.data?.property?.images) {
          updatedImages = result.data.data.property.images;
        } else {
          // Fallback: remove from local state
          updatedImages = selectedProperty.images.filter(
            (_, index) => index !== imageIndex
          );
        }
        
        // Update local state
        const updatedProperty = { ...selectedProperty, images: updatedImages };
        
        // Update selected property for immediate UI feedback
        setSelectedProperty(updatedProperty);

        alert("Image removed successfully!");
        
        // Refetch properties to update the list
        refetchProperties();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, hsl(145 63% 32% / 0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, hsl(48 96% 53% / 0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-emerald-900/90 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl shadow-emerald-900/30">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
        
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                className="group p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-gold-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gold-400/20"
                onClick={() => navigate("/admin-dashboard")}
              >
                <ArrowLeft size={20} className="text-white group-hover:text-gold-400 transition-colors" />
              </button>
              <div>
                <h1 className="text-4xl font-black mb-2 font-serif tracking-tight bg-gradient-to-r from-white via-gold-200 to-white bg-clip-text text-transparent">
                  Property Management
                </h1>
                <p className="text-emerald-100/80 font-medium">Create and manage property listings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="group px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-gold-400/40 transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-gold-400/10">
                <Download size={16} className="group-hover:text-gold-400 transition-colors" />
                <span className="group-hover:text-gold-400 transition-colors">Export</span>
              </button>
              <button
                className="group px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-gold-400/40 transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-gold-400/10"
                onClick={() => refetchProperties()}
              >
                <RefreshCw size={16} className="group-hover:text-gold-400 group-hover:rotate-180 transition-all duration-500" />
                <span className="group-hover:text-gold-400 transition-colors">Refresh</span>
              </button>
              <button
                className="group px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-slate-900 rounded-xl font-bold hover:from-gold-300 hover:to-gold-400 transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-gold-400/30 hover:shadow-xl hover:shadow-gold-400/40 hover:scale-105"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                Add Property
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative container mx-auto px-6 py-10">

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

        {/* Premium Stats Cards - Always 4 columns on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <button
            type="button"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-gold-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold-400/10 text-left"
            onClick={() => setStatusFilter("all")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400/0 to-gold-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400/30 to-gold-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-gold-400/20">
                <Building size={26} className="text-gold-400" />
              </div>
              <div>
                <div className="text-3xl font-bold font-serif bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">{stats.total}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Properties</div>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-400/10 text-left"
            onClick={() => setStatusFilter("approved")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-400/20">
                <Check size={26} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-3xl font-bold font-serif bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">{stats.approved}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved</div>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-amber-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-400/10 text-left"
            onClick={() => setStatusFilter("pending")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400/30 to-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-400/20">
                <Calendar size={26} className="text-amber-400" />
              </div>
              <div>
                <div className="text-3xl font-bold font-serif bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">{stats.pending}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</div>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-red-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-400/10 text-left"
            onClick={() => setStatusFilter("rejected")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/0 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-400/30 to-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-400/20">
                <X size={26} className="text-red-400" />
              </div>
              <div>
                <div className="text-3xl font-bold font-serif bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">{stats.rejected}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected</div>
              </div>
            </div>
          </button>
        </div>

        {/* Premium Filters and Search */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search properties by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-gold-400/50 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300"
                />
              </div>
            </div>
            
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  statusFilter === "all" 
                    ? "bg-gold-400/20 text-gold-400 border border-gold-400/40" 
                    : "bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:border-gold-400/30"
                }`}
                onClick={() => setStatusFilter("all")}
              >
                All ({stats.total})
              </button>
              <button
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  statusFilter === "pending" 
                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/40" 
                    : "bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:border-amber-400/30"
                }`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending ({stats.pending})
              </button>
              <button
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  statusFilter === "approved" 
                    ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/40" 
                    : "bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:border-emerald-400/30"
                }`}
                onClick={() => setStatusFilter("approved")}
              >
                Approved ({stats.approved})
              </button>
              <button
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  statusFilter === "rejected" 
                    ? "bg-red-400/20 text-red-400 border border-red-400/40" 
                    : "bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:border-red-400/30"
                }`}
                onClick={() => setStatusFilter("rejected")}
              >
                Rejected ({stats.rejected})
              </button>
            </div>
            
            {/* Type Filter & View Toggle */}
            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-gold-400/50 transition-all duration-300"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartments</option>
                <option value="house">Houses</option>
                <option value="villa">Villas</option>
                <option value="commercial">Commercial</option>
              </select>
              
              <div className="flex rounded-xl overflow-hidden border border-slate-700/50">
                <button
                  className={`px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    viewMode === "grid" 
                      ? "bg-gold-400/20 text-gold-400" 
                      : "bg-slate-800/50 text-slate-400 hover:text-gold-400"
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </button>
                <button
                  className={`px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    viewMode === "list" 
                      ? "bg-gold-400/20 text-gold-400" 
                      : "bg-slate-800/50 text-slate-400 hover:text-gold-400"
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 border-4 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-medium">Loading properties...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 bg-red-400/10 border border-red-400/30 rounded-2xl">
            <p className="text-red-400 font-medium mb-4">Error: {error}</p>
            <button 
              onClick={() => refetchProperties()}
              className="px-6 py-2.5 bg-red-400/20 text-red-400 border border-red-400/30 rounded-xl font-semibold hover:bg-red-400/30 transition-all duration-300"
            >
              Retry
            </button>
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
          <div className={`${viewMode === 'grid' ? 'admin-properties-grid' : 'properties-container list'}`}>
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