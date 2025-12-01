import { 
  Heart,
  Search,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  Star,
  Filter,
  Grid,
  List,
  Bookmark,
  Clock,
  DollarSign,
  Home,
  Bath,
  Car,
  Maximize,
  Phone,
  Mail,
  ChevronRight,
  Plus,
  TrendingUp,
  Bell,
  Settings,
  User,
  ShoppingBag,
  Download
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { favoritesService } from '../services/favoritesService';
import { interestService } from '../services/interestService';
import { propertyService } from '../services/propertyService';
import { userService } from '../services/userService';
import { SERVER_BASE_URL } from '../config/api';
import { messageService } from '../services/messageService';
import { visitService } from '../services/visitService';
import { sellingService } from '../services/sellingService';
import UserContactForm from '../components/UserContactForm';
import FAQViewer from '../components/FAQViewer';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  
  const [stats, setStats] = useState({
    favoriteProperties: 0,
    scheduledVisits: 0,
    viewedProperties: 0,
    savedSearches: 0,
    purchasedProperties: 0
  });
  
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [scheduledVisits, setScheduledVisits] = useState([]);
  const [purchasedProperties, setPurchasedProperties] = useState([]);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [isEditingVisit, setIsEditingVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({ id: '', propertyId: '', visitDate: '', message: '' });
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [selectableProperties, setSelectableProperties] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    priceRange: [0, 1000000],
    propertyType: '',
    bedrooms: '',
    bathrooms: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh visits when opening the visits tab
  useEffect(() => {
    if (activeTab === 'visits') {
      loadScheduledVisits();
    }
  }, [activeTab]);

  // Normalize various backend response shapes into a flat array
  const extractVisitsList = (responseObj) => {
    const data = responseObj?.data;
    const candidateLists = [
      data?.data?.data,
      data?.data?.interests,
      data?.data,
      data?.interests,
      data,
    ];
    const list = candidateLists.find((c) => Array.isArray(c)) || [];
    return list;
  };

  const loadScheduledVisits = async () => {
    try {
      const res = await visitService.getScheduledVisits();
      if (res.success) {
        const list = extractVisitsList(res);
        setScheduledVisits(list);
        setStats(prev => ({ ...prev, scheduledVisits: list.length }));
      } else {
        console.error('Failed to load visits:', res.error);
      }
    } catch (e) {
      console.error('Error loading scheduled visits:', e);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data in parallel
      const [favoritesResponse, propertiesResponse, visitsResponse, sellingResponse] = await Promise.all([
        favoritesService.getFavorites(),
        propertyService.getProperties(),
        visitService.getScheduledVisits(),
        sellingService.list(),
      ]);
    /* const favoritesResponse= await favoritesService.getFavorites();
    const propertiesResponse= await propertyService.getProperties();
    const interestsResponse= await interestService.getBuyerInterests(); */

      // Process favorites
      if (favoritesResponse.data.status=='success') {
        const favorites = favoritesResponse.data.data.favorites || [];
        console.log("favoritesResponse", favorites);

        setFavoriteProperties(favorites);
        setStats(prev => ({ ...prev, favoriteProperties: favorites.length }));
      }

      // Process properties for recommendations and recently viewed
      if (propertiesResponse.data.status=='success') {
        const properties = propertiesResponse.data.data.data || [];
            console.log("propertiesResponse", properties);

        const activeProperties = properties.filter(p => p.status === 'active');
        
        // Get recommended properties (for demo, just get first 6)
        setRecommendedProperties(activeProperties.slice(0, 6));
        // Properties available to select when scheduling a visit
        setSelectableProperties(activeProperties);
        
        // Get recently viewed (for demo, get random properties)
        setRecentlyViewed(activeProperties.slice(6, 10));
        
        setStats(prev => ({ 
          ...prev, 
          viewedProperties: activeProperties.length,
          savedSearches: 3 // Demo value
        }));
      }

      // Process visits
      if (visitsResponse.success || visitsResponse.data?.status=='success') {
        const list = extractVisitsList(visitsResponse);
        setScheduledVisits(list);
        setStats(prev => ({ ...prev, scheduledVisits: list.length }));
      }

      // Process purchased properties
      if (sellingResponse.success || sellingResponse.data?.status === 'success') {
        console.log('Selling Response:', sellingResponse);
        console.log('Selling Response.data:', sellingResponse.data);
        console.log('Selling Response.data.data:', sellingResponse.data?.data);
        console.log('Selling Response.data.data.data:', sellingResponse.data?.data?.data);
        console.log('Selling Response.data type:', typeof sellingResponse.data);
        console.log('Selling Response.data keys:', sellingResponse.data ? Object.keys(sellingResponse.data) : 'No data');
        
        // Handle different possible response structures
        let allSales = [];
        if (sellingResponse.data?.data?.data && Array.isArray(sellingResponse.data.data.data)) {
          allSales = sellingResponse.data.data.data;
        } else if (sellingResponse.data?.data && Array.isArray(sellingResponse.data.data)) {
          allSales = sellingResponse.data.data;
        } else if (Array.isArray(sellingResponse.data)) {
          allSales = sellingResponse.data;
        } else if (sellingResponse.data && typeof sellingResponse.data === 'object') {
          // Try to find any array in the response
          const possibleArrays = Object.values(sellingResponse.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            allSales = possibleArrays[0]; // Use the first array found
            console.log('Found array in response:', allSales);
          }
          console.log('All possible arrays found:', possibleArrays);
          console.log('All values in response.data:', Object.values(sellingResponse.data));
          console.log('All keys in response.data:', Object.keys(sellingResponse.data));
          console.log('Response.data structure:', JSON.stringify(sellingResponse.data, null, 2));
        } else {
          console.log('No valid data structure found in selling response');
        }
        
        // If we still don't have allSales, try to find it in the response
        if (!Array.isArray(allSales) || allSales.length === 0) {
          console.log('Trying to find sales data in different response structure...');
          if (sellingResponse.data?.selling && Array.isArray(sellingResponse.data.selling)) {
            allSales = sellingResponse.data.selling;
            console.log('Found sales in sellingResponse.data.selling:', allSales);
          } else if (sellingResponse.data?.sales && Array.isArray(sellingResponse.data.sales)) {
            allSales = sellingResponse.data.sales;
            console.log('Found sales in sellingResponse.data.sales:', allSales);
          } else if (sellingResponse.data?.records && Array.isArray(sellingResponse.data.records)) {
            allSales = sellingResponse.data.records;
            console.log('Found sales in sellingResponse.data.records:', allSales);
          } else if (sellingResponse.data?.data && Array.isArray(sellingResponse.data.data)) {
            allSales = sellingResponse.data.data;
            console.log('Found sales in sellingResponse.data.data:', allSales);
          } else {
            console.log('Could not find any sales data in the response');
            console.log('Full response structure:', JSON.stringify(sellingResponse, null, 2));
          }
        }
        
        // Final check - if we still don't have allSales, log the entire response
        if (!Array.isArray(allSales) || allSales.length === 0) {
          console.log('Final check - no sales data found. Full response:', sellingResponse);
        }
        
        console.log('All Sales:', allSales);
        
        if (Array.isArray(allSales)) {
          // Filter sales where this buyer is the purchaser and property is sold
          const buyerPurchases = allSales.filter(sale => {
            // Check if buyer is populated or just an ID
            let buyerId;
            if (typeof sale.buyer === 'object' && sale.buyer !== null) {
              // Buyer is populated
              buyerId = sale.buyer._id;
            } else {
              // Buyer is just an ID
              buyerId = sale.buyer;
            }
            
            const userId = user?._id;
            const isBuyerMatch = buyerId && userId && (buyerId.toString() === userId.toString());
            
            // Check if property is populated or just an ID
            let isPropertySold = false;
            let isPropertyVerified = false;
            
            if (typeof sale.property === 'object' && sale.property !== null) {
              // Property is populated
              isPropertySold = sale.property.sold === true;
              isPropertyVerified = sale.property.isVerified === true;
            } else {
              // Property is just an ID, we can't check these properties
              console.log('Property not populated for sale:', sale);
              return false;
            }
            
            console.log('Sale:', sale);
            console.log('Buyer ID:', buyerId, 'User ID:', userId, 'Match:', isBuyerMatch);
            console.log('Property sold:', isPropertySold, 'Property verified:', isPropertyVerified);
            
            return isBuyerMatch && isPropertySold && isPropertyVerified;
          });
          console.log('Buyer Purchases:', buyerPurchases);
          
          setPurchasedProperties(buyerPurchases);
          setStats(prev => ({ ...prev, purchasedProperties: buyerPurchases.length }));
        } else {
          console.error('Selling data is not an array:', allSales);
          setPurchasedProperties([]);
          setStats(prev => ({ ...prev, purchasedProperties: 0 }));
          
          // Show a helpful message to the user
          console.log('No purchased properties found. This could mean:');
          console.log('1. You haven\'t purchased any properties yet');
          console.log('2. The sales data is not properly populated');
          console.log('3. There\'s an issue with the API response');
        }
              } else {
          console.error('Selling response not successful:', sellingResponse);
          setPurchasedProperties([]);
          setStats(prev => ({ ...prev, purchasedProperties: 0 }));
          
          // Show a helpful message to the user
          console.log('Selling API call failed. This could mean:');
          console.log('1. The API endpoint is not working');
          console.log('2. There\'s an authentication issue');
          console.log('3. The server is down');
        }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateVisit = () => {
    setVisitForm({ id: '', propertyId: '', visitDate: '', message: '' });
    setIsEditingVisit(false);
    setShowVisitForm(true);
  };

  const openEditVisit = (visit) => {
    setVisitForm({
      id: visit._id,
      propertyId: visit.propertyId?._id || visit.propertyId || '',
      visitDate: visit.visitDate ? new Date(visit.visitDate).toISOString().slice(0,16) : '',
      message: visit.message || ''
    });
    setIsEditingVisit(true);
    setShowVisitForm(true);
  };

  const submitVisitForm = async (e) => {
    if (e) e.preventDefault();
    try {
      if (isEditingVisit && visitForm.id) {
        const payload = { visitDate: visitForm.visitDate ? new Date(visitForm.visitDate).toISOString() : undefined, message: visitForm.message };
        const res = await visitService.updateVisit(visitForm.id, payload);
        if (res.success) {
          // Notify seller/agent about reschedule
          try {
            if (visitForm.propertyId) {
              await messageService.createPropertyMessage({
                propertyId: visitForm.propertyId,
                subject: 'Visit rescheduled',
                content: `The buyer has rescheduled a visit to ${new Date(visitForm.visitDate).toLocaleString()}.`,
                messageType: 'property',
                priority: 'medium'
              });
            }
          } catch (notifyErr) {
            console.error('Failed to send reschedule notification:', notifyErr);
          }
          await loadScheduledVisits();
          setShowVisitForm(false);
        }
      } else {
        const payload = { propertyId: visitForm.propertyId, visitDate: visitForm.visitDate ? new Date(visitForm.visitDate).toISOString() : undefined, message: visitForm.message };
        const res = await visitService.scheduleVisit(payload);
        if (res.success) {
          // Notify seller/agent about new schedule
          try {
            if (payload.propertyId) {
              await messageService.createPropertyMessage({
                propertyId: payload.propertyId,
                subject: 'New property visit scheduled',
                content: `A new visit has been scheduled for ${new Date(visitForm.visitDate).toLocaleString()}.`,
                messageType: 'property',
                priority: 'medium'
              });
            }
          } catch (notifyErr) {
            console.error('Failed to send schedule notification:', notifyErr);
          }
          await loadScheduledVisits();
          setShowVisitForm(false);
        }
      }
    } catch (err) {
      console.error('Failed to submit visit form:', err);
    }
  };

  const deleteVisit = async (visitId) => {
    try {
      // Capture propertyId before deletion for notification
      const visit = scheduledVisits.find(v => v._id === visitId);
      const propertyIdForNotify = visit?.propertyId?._id || visit?.propertyId;
      const res = await visitService.cancelVisit(visitId);
      if (res.success) {
        // Notify seller/agent about cancellation
        try {
          if (propertyIdForNotify) {
            await messageService.createPropertyMessage({
              propertyId: propertyIdForNotify,
              subject: 'Scheduled visit canceled',
              content: 'The buyer has canceled a previously scheduled visit.',
              messageType: 'property',
              priority: 'low'
            });
          }
        } catch (notifyErr) {
          console.error('Failed to send cancellation notification:', notifyErr);
        }
        await loadScheduledVisits();
      }
    } catch (err) {
      console.error('Failed to delete visit:', err);
    }
  };

  const handleAddToFavorites = async (propertyId) => {
    try {
      const response = await userService.createFavorites(propertyId);
      if (response.success) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const handleRemoveFromFavorites = async (propertyId) => {
    try {
      const response = await userService.deleteFavorites(propertyId);
      if (response.success) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary', onClick }) => (
    <div className="stat-card cursor-pointer" onClick={onClick}>
      <div className="stat-header">
        <h3 className="stat-title">{title}</h3>
        <Icon className={`stat-icon text-${color}`} />
      </div>
      <p className="stat-value">{value}</p>
    </div>
  );

  const PropertyCard = ({ property, isFavorite = false, showFavoriteButton = true }) => (
    <div className="card">
      <div className="relative">
        <img 
          src={property.imagesUrl?.[0] || property.images?.[0] || '/hero-bg-1.jpg'} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        {showFavoriteButton && (
          <button 
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition ${
              isFavorite 
                ? 'bg-error-500 text-white' 
                : 'bg-white/80 text-neutral-600 hover:bg-white'
            }`}
            onClick={() => isFavorite ? handleRemoveFromFavorites(property._id) : handleAddToFavorites(property._id)}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="badge badge-success">{property.status}</span>
        </div>
      </div>
      <div className="card-body">
        <h3 className="font-semibold text-neutral-900 mb-2">{property.title}</h3>
        <div className="flex items-center gap-2 text-neutral-600 mb-3">
          <MapPin size={16} />
          <span className="text-sm">{property.location}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(property.price)}
          </span>
          <span className="badge badge-info">{property.type}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
          <div className="flex items-center gap-1">
            <Home size={16} />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} />
            <span>{property.bathrooms} baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize size={16} />
            <span>{property.area} m²</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary flex-1"
            onClick={() => navigate(`/properties/${property._id}`)}
          >
            View Details
          </button>
          {/* <button className="btn btn-secondary">
            <MessageSquare size={16} />
          </button> */}
        </div>
      </div>
    </div>
  );

  const VisitCard = ({ visit }) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-neutral-900">{visit.propertyId?.title}</h3>
            <div className="flex items-center gap-2 text-neutral-600 mt-1">
              <MapPin size={14} />
              <span className="text-sm">{visit.propertyId?.location}</span>
            </div>
          </div>
          <span className={`badge ${
            visit.status === 'confirmed' ? 'badge-success' :
            visit.status === 'pending' ? 'badge-warning' : 'badge-error'
          }`}>
            {visit.status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600 mb-3">
          <Calendar size={16} />
          <span className="text-sm">{visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : 'TBD'}</span>
          <Clock size={16} />
          <span className="text-sm">{visit.visitDate ? new Date(visit.visitDate).toLocaleTimeString() : 'TBD'}</span>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-sm btn-secondary flex-1"
            onClick={() => {
              const pid = visit.propertyId?._id || visit.propertyId;
              if (pid) navigate(`/properties/${pid}`);
            }}
          >
            View Property
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => openEditVisit(visit)}>
            Reschedule
          </button>
          <button className="btn btn-sm btn-outline" onClick={() => deleteVisit(visit._id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-main">
          <div className="flex items-center justify-center h-full">
            <div className="loading-spinner"></div>
            <span className="ml-3 text-neutral-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Buyer Dashboard</h2>
          <p className="text-sm text-neutral-600">Welcome back, {user?.name}</p>
        </div>

        <nav className="nav-menu">
          <div className="nav-item">
            <a 
              href="#overview" 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
            >
              <Home size={20} />
              Overview
            </a>
          </div>
          {/* <div className="nav-item">
            <a 
              href="#search" 
              className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}
            >
              <Search size={20} />
              Search Properties
            </a>
          </div> */}
          <div className="nav-item">
            <a 
              href="#favorites" 
              className={`nav-link ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('favorites'); }}
            >
              <Heart size={20} />
              Favorites
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#visits" 
              className={`nav-link ${activeTab === 'visits' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('visits'); }}
            >
              <Calendar size={20} />
              Scheduled Visits
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#purchased" 
              className={`nav-link ${activeTab === 'purchased' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('purchased'); }}
            >
              <ShoppingBag size={20} />
              Purchased Properties
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#messages" 
              className="nav-link"
              onClick={(e) => { e.preventDefault(); navigate('/messages'); }}
            >
              <MessageSquare size={20} />
              Messages
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#profile" 
              className="nav-link"
              onClick={(e) => { e.preventDefault(); navigate('/profile'); }}
            >
              <User size={20} />
              Profile
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#contact" 
              className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('contact'); }}
            >
              <Mail size={20} />
              Contact Support
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#help" 
              className={`nav-link ${activeTab === 'help' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('help'); }}
            >
              <MessageSquare size={20} />
              Help Center
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'search' && 'Search Properties'}
              {activeTab === 'favorites' && 'Favorite Properties'}
              {activeTab === 'visits' && 'Scheduled Visits'}
            </h1>
            <p className="text-neutral-600">
              {activeTab === 'overview' && 'Track your property search progress and manage your interests'}
              {activeTab === 'search' && 'Find your perfect property with advanced search filters'}
              {activeTab === 'favorites' && 'Manage your saved properties and wishlist'}
              {activeTab === 'visits' && 'View and manage your scheduled property visits'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn btn-secondary">
              <Bell size={16} />
              Notifications
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/properties')}>
              <Search size={16} />
              Browse Properties
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard
                title="Favorite Properties"
                value={stats.favoriteProperties}
                icon={Heart}
                color="error"
                onClick={() => setActiveTab('favorites')}
              />
              <StatCard
                title="Scheduled Visits"
                value={stats.scheduledVisits}
                icon={Calendar}
                color="primary"
                onClick={() => setActiveTab('visits')}
              />
              <StatCard
                title="Properties Viewed"
                value={stats.viewedProperties}
                icon={Eye}
                color="success"
              />
              <StatCard
                title="Saved Searches"
                value={stats.savedSearches}
                icon={Bookmark}
                color="warning"
                onClick={() => setActiveTab('search')}
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recently Viewed */}
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Recently Viewed</h3>
                    <button className="btn btn-sm btn-secondary">
                      View All
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {recentlyViewed.slice(0, 3).map((property) => (
                      <div key={property._id} className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-lg transition cursor-pointer"
                           onClick={() => navigate(`/properties/${property._id}`)}>
                        <img 
                          src={property.imagesUrl?.[0] || property.images?.[0] || '/hero-bg-1.jpg'} 
                          alt={property.title}
                          className="w-15 h-15 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{property.title}</h4>
                          <div className="flex items-center gap-2 text-neutral-600 mt-1">
                            <MapPin size={14} />
                            <span className="text-sm">{property.location}</span>
                          </div>
                          <p className="font-semibold text-primary-600 mt-1">
                            {formatCurrency(property.price)}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-neutral-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Properties */}
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Recommended for You</h3>
                    <button className="btn btn-sm btn-secondary">
                      View All
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {recommendedProperties.slice(0, 3).map((property) => (
                      <div key={property._id} className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-lg transition cursor-pointer"
                           onClick={() => navigate(`/properties/${property._id}`)}>
                        <img 
                          src={property.imagesUrl?.[0] || property.images?.[0] || '/hero-bg-1.jpg'} 
                          alt={property.title}
                          className="w-15 h-15 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{property.title}</h4>
                          <div className="flex items-center gap-2 text-neutral-600 mt-1">
                            <MapPin size={14} />
                            <span className="text-sm">{property.location}</span>
                          </div>
                          <p className="font-semibold text-primary-600 mt-1">
                            {formatCurrency(property.price)}
                          </p>
                        </div>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(property._id);
                          }}
                        >
                          <Heart size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Filters */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-neutral-900">Search Filters</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter location"
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Property Type</label>
                    <select 
                      className="form-input"
                      value={searchFilters.propertyType}
                      onChange={(e) => setSearchFilters({...searchFilters, propertyType: e.target.value})}
                    >
                      <option value="">All Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="condo">Condo</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bedrooms</label>
                    <select 
                      className="form-input"
                      value={searchFilters.bedrooms}
                      onChange={(e) => setSearchFilters({...searchFilters, bedrooms: e.target.value})}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bathrooms</label>
                    <select 
                      className="form-input"
                      value={searchFilters.bathrooms}
                      onChange={(e) => setSearchFilters({...searchFilters, bathrooms: e.target.value})}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <button className="btn btn-primary">
                    <Search size={16} />
                    Search Properties
                  </button>
                  <button className="btn btn-secondary">
                    <Filter size={16} />
                    Advanced Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Search Results */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">Search Results</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid size={16} />
                    </button>
                    <button 
                      className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {recommendedProperties.map((property) => (
                    <PropertyCard 
                      key={property._id} 
                      property={property}
                      isFavorite={favoriteProperties.some(fav => fav._id === property._id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Your Favorite Properties ({favoriteProperties.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button 
                      className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid size={16} />
                    </button>
                    <button 
                      className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {favoriteProperties.length > 0 ? (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {favoriteProperties.map((property) => (
                      <PropertyCard 
                        key={property._id} 
                        property={property}
                        isFavorite={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart size={48} className="text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No favorites yet</h3>
                    <p className="text-neutral-600 mb-4">Start browsing properties and add them to your favorites</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/properties')}
                    >
                      Browse Properties
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Visits Tab */}
        {activeTab === 'visits' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Scheduled Visits ({scheduledVisits.length})
                  </h3>

                  {/* <button className="btn btn-primary" onClick={() => openCreateVisit()}>
                    <Plus size={16} />
                    Schedule New Visit
                  </button> */}
                </div>
              </div>
              <div className="card-body">
                {showVisitForm && (
                  <div className="mb-6 p-4 border border-neutral-200 rounded-lg">
                    <h4 className="font-semibold mb-3">{isEditingVisit ? 'Edit Visit' : 'New Visit'}</h4>
                    <form onSubmit={submitVisitForm} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="text-sm text-neutral-600">Property</label>
                        <select 
                          className="form-input"
                          value={visitForm.propertyId}
                          onChange={(e)=>setVisitForm({...visitForm, propertyId: e.target.value})}
                          required={!isEditingVisit}
                          disabled={isEditingVisit}
                        >
                          <option value="">Select a property</option>
                          {selectableProperties.map((p) => (
                            <option key={p._id} value={p._id}>{p.title} - {p.location}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-neutral-600">Visit Date & Time</label>
                        <input type="datetime-local" className="form-input" value={visitForm.visitDate} onChange={(e)=>setVisitForm({...visitForm, visitDate: e.target.value})} required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-neutral-600">Message (optional)</label>
                        <textarea className="form-input" value={visitForm.message} onChange={(e)=>setVisitForm({...visitForm, message: e.target.value})} rows="3" />
                      </div>
                      <div className="flex gap-2 md:col-span-2">
                        <button type="submit" className="btn btn-secondary">{isEditingVisit ? 'Update' : 'Create'}</button>
                        <button type="button" className="btn btn-secondary" onClick={()=>setShowVisitForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
                {scheduledVisits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scheduledVisits.map((visit) => (
                      <VisitCard key={visit._id} visit={visit} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar size={48} className="text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No visits scheduled</h3>
                    <p className="text-neutral-600 mb-4">Schedule visits to properties you're interested in</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/properties')}
                    >
                      Browse Properties
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Purchased Properties Tab */}
        {activeTab === 'purchased' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
                      <ShoppingBag size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">
                        Your Purchased Properties
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {stats.purchasedProperties || 0} properties in your portfolio
                      </p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-300"
                    onClick={() => navigate('/properties')}
                  >
                    <Plus size={16} className="mr-2" />
                    Browse More Properties
                  </button>
                </div>
              </div>
              <div className="card-body p-6">
                {purchasedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchasedProperties.map((purchase) => (
                      <div 
                        key={purchase._id} 
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-neutral-200 hover:border-primary-300 transform hover:-translate-y-2"
                      >
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-700 border border-success-200">
                            <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
                            Active
                          </span>
                        </div>

                        {/* Property Image */}
                        <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden">
                          {purchase.property?.images?.[0] ? (
                            <img 
                              src={`${SERVER_BASE_URL}${purchase.property.images[0]}`}
                              alt={purchase.property.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                              <Home size={64} className="text-primary-400" />
                            </div>
                          )}
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>

                        {/* Property Details */}
                        <div className="p-6 space-y-4">
                          {/* Title and Location */}
                          <div>
                            <h4 className="font-bold text-lg text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
                              {purchase.property?.title || 'Property Title'}
                            </h4>
                            <p className="text-neutral-600 flex items-center text-sm">
                              <MapPin size={16} className="mr-2 text-primary-500" />
                              {purchase.property?.location || 'Location'}
                            </p>
                          </div>

                          {/* Property Stats */}
                          <div className="grid grid-cols-2 gap-4 py-3 bg-neutral-50 rounded-xl">
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                  <Home size={16} className="text-primary-500 mr-1" />
                                  <span className="font-semibold text-neutral-900">
                                    {purchase.property?.features?.bedrooms || 0}
                                  </span>
                                </div>
                                <span className="text-xs text-neutral-600">Bedrooms</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                  <Bath size={16} className="text-primary-500 mr-1" />
                                  <span className="font-semibold text-neutral-900">
                                    {purchase.property?.features?.bathrooms || 0}
                                  </span>
                                </div>
                                <span className="text-xs text-neutral-600">Bathrooms</span>
                              </div>
                            </div>
                          </div>

                          {/* Purchase Information */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg border border-success-200">
                              <span className="text-sm font-medium text-success-700">Purchase Date:</span>
                              <span className="text-sm font-semibold text-success-800">
                                {new Date(purchase.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-warning-50 rounded-lg border border-warning-200">
                              <span className="text-sm font-medium text-warning-700">Price Paid:</span>
                              <span className="text-sm font-bold text-warning-800">
                                ${purchase.amount?.toLocaleString() || 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg border border-primary-200">
                              <span className="text-sm font-medium text-primary-700">Seller:</span>
                              <span className="text-sm font-semibold text-primary-800">
                                {purchase.seller?.name || purchase.property?.owner?.name || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            <button 
                              className="flex-1 btn btn-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                              onClick={() => navigate(`/properties/${purchase.property?._id}`)}
                            >
                              <Eye size={16} className="mr-2" />
                              View Details
                            </button>
                            <button 
                              className="flex-1 btn btn-sm bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                              onClick={() => {
                                // Download documents functionality
                                console.log('Download documents for:', purchase._id);
                              }}
                            >
                              <Download size={16} className="mr-2" />
                              Download Deed
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-6">
                    <div className="max-w-md mx-auto">
                      {/* Illustration */}
                      <div className="relative mb-8">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-4">
                          <ShoppingBag size={48} className="text-primary-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                          <Plus size={16} className="text-success-600" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                        Start Building Your Property Portfolio
                      </h3>
                      <p className="text-neutral-600 mb-6 leading-relaxed">
                        You haven't purchased any properties yet. Browse our amazing selection of properties and find your perfect investment opportunity.
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                          className="btn btn-primary bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-300 px-8 py-3 rounded-xl font-semibold"
                          onClick={() => navigate('/properties')}
                        >
                          <Search size={16} className="mr-2" />
                          Browse Properties
                        </button>
                        <button 
                          className="btn btn-outline border-2 border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 transform hover:scale-105 transition-all duration-300 px-8 py-3 rounded-xl font-semibold"
                          onClick={() => navigate('/favorites')}
                        >
                          <Heart size={16} className="mr-2" />
                          View Favorites
                        </button>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="mt-8 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                        <p className="text-sm text-neutral-600">
                          💡 <strong>Tip:</strong> Save properties to your favorites to keep track of your preferred options!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <UserContactForm />
          </div>
        )}

        {/* Help Center Tab */}
        {activeTab === 'help' && (
          <div className="space-y-6">
            <FAQViewer userRole="buyer" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;

