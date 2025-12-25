import { 
  Home,
  Plus,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  MessageSquare,
  Star,
  Users,
  MapPin,
  Bath,
  Maximize,
  Camera,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Bell,
  Filter,
  Search,
  Grid,
  List,
  ChevronRight,
  MoreVertical,
  Building,
  UserCheck,
  Phone,
  Mail,
  Target,
  Award,
  Briefcase,
  Heart,
  Bookmark,
  User,
  X
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import PropertyCard from '../components/PropertyCard';
import UserContactForm from '../components/UserContactForm';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { interestService } from '../services/interestService';
import { messageService } from '../services/messageService';
import { propertyService } from '../services/propertyService';
import { userService } from '../services/userService';
import { SERVER_BASE_URL } from '../config/api';

import '../styles/buyer-dashboard.css';

const AgentDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldProperties: 0,
    totalCommission: 0,
    pendingInterests: 0,
    totalViews: 0,
    averagePrice: 0,
    monthlyCommission: 0
  });
  
  const [myListings, setMyListings] = useState([]);
  const [recentInterests, setRecentInterests] = useState([]);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState({
    viewsThisMonth: 0,
    inquiriesThisMonth: 0,
    conversionRate: 0
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [propertyActiveTab, setPropertyActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data in parallel
      const [propertiesResponse, interestsResponse, usersResponse, messagesResponse] = await Promise.all([
        propertyService.getPropertiesBySeller(user?._id),
        interestService.getSellerInterests(user?._id),
        userService.getUsers(),
        messageService.getMyMessages()
      ]);
      console.log('propertiesResponse',propertiesResponse); 
      console.log('interestsResponse',interestsResponse);
      console.log('usersResponse',usersResponse);
      console.log('messagesResponse',messagesResponse);

      // Process properties (listings)
      if (propertiesResponse.success) {
        const properties = propertiesResponse.data?.data?.data || propertiesResponse.data?.data || [];
        const activeProperties = properties.filter(p => p.status === 'approved');
        const soldProperties = properties.filter(p => p.status === 'sold');
        
        setMyListings(properties);
        setStats(prev => ({ 
          ...prev, 
          totalListings: properties.length,
          activeListings: activeProperties.length,
          soldProperties: soldProperties.length,
          totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0),
          averagePrice: properties.length > 0 ? properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length : 0
        }));
      }

      // Process interests (appointments)
      if (interestsResponse.success) {
        const interests = interestsResponse.data?.data?.data || interestsResponse.data?.data || [];
        console.log('interests ',interests);
        setRecentInterests(interests.slice(0, 5));
        setAppointments(interests);
        setStats(prev => ({ ...prev, pendingInterests: interests.filter(i => i.status === 'pending').length }));
      }

      // Process users (clients)
      if (usersResponse.success) {
        const users = usersResponse.data?.data?.data || usersResponse.data?.data || [];
        const buyerUsers = users.filter(u => u.role === 'buyer');
        setClients(buyerUsers.slice(0, 10));
      }

      // Process messages (leads)
      if (messagesResponse.success) {
        const messages = messagesResponse.data?.data?.messages || messagesResponse.data?.messages || [];
        setLeads(Array.isArray(messages) ? messages.slice(0, 10) : []);
      }

      // Generate mock appointments and commissions for demo
      generateMockData();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /* const generateMockData = () => {
    // Only set mock appointments if none were fetched
    if (!appointments || appointments.length === 0) {
      const mockAppointments = [
        { _id: 'mock-1', client: 'John Buyer', property: 'Modern Villa in Bole', date: '2024-02-01', time: '10:00 AM', type: 'viewing', status: 'scheduled' },
        { _id: 'mock-2', client: 'Alice Johnson', property: 'Apartment in Kazanchis', date: '2024-02-01', time: '2:00 PM', type: 'consultation', status: 'scheduled' },
        { _id: 'mock-3', client: 'Sarah Davis', property: 'House in CMC', date: '2024-02-02', time: '11:00 AM', type: 'viewing', status: 'pending' }
      ];
      setAppointments(mockAppointments);
    }

    // Mock commissions
    const mockCommissions = [
      { id: 1, property: 'Apartment in Kazanchis', client: 'Alice Johnson', salePrice: '8,500,000', commission: '255,000', status: 'paid', date: '2024-01-25' },
      { id: 2, property: 'Villa in Bole Medhanialem', client: 'John Smith', salePrice: '18,000,000', commission: '540,000', status: 'pending', date: '2024-01-20' }
    ];
    setCommissions(mockCommissions);

    // Calculate commission stats
    const totalCommission = mockCommissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + parseInt(c.commission.replace(',', '')), 0);
    
    setStats(prev => ({ 
      ...prev, 
      totalCommission,
      monthlyCommission: totalCommission * 0.3 // Mock monthly calculation
    }));
  }; */

  const handleListingAction = (listingId, action) => {
    setMyListings(prev => prev.map(listing => 
      listing._id === listingId 
        ? { ...listing, status: action }
        : listing
    ));
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await propertyService.deleteProperty(propertyId);
        if (response.success) {
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Failed to delete property:', error);
      }
    }
  };

  const handleDeleteInterest = async (interestId) => {
    if (window.confirm('Are you sure you want to delete this buyer interest?')) {
      try {
        const response = await interestService.deleteBuyerInterest(interestId);
        if (response.success) {
          fetchDashboardData(); // Refresh data
        } else {
          alert(`Failed to delete interest: ${response.error}`);
        }
      } catch (error) {
        console.error('Error deleting interest:', error);
        alert('Failed to delete interest. Please try again.');
      }
    }
  };

  const handleLeadAction = (leadId, action) => {
    setLeads(prev => prev.map(lead => 
      lead._id === leadId 
        ? { ...lead, status: action }
        : lead
    ));
  };

  const openPropertyDetails = (property) => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color = 'primary', onClick }) => (
    <div 
      className={`stat-card stat-${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
      </div>
    </div>
  );

  // Appointment Card Component
  const AppointmentCard = ({ appointment, onStatusUpdate, onDelete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [visitDate, setVisitDate] = useState('');

    const handleStatusUpdate = async (newStatus, additionalData = {}) => {
      setIsProcessing(true);
      try {
        // Skip network for mock items and update locally
        if (!appointment._id || String(appointment._id).startsWith('mock-')) {
          onStatusUpdate && onStatusUpdate(appointment._id || appointment.id, newStatus, additionalData);
          setIsProcessing(false);
          setShowScheduleModal(false);
          setVisitDate('');
          return;
        }
        let result;
        if (newStatus === 'schedule') {
          result = await interestService.scheduleVisit(appointment._id || appointment.id, visitDate);
        } else if (newStatus === 'contacted') {
          result = await interestService.markAsContacted(appointment._id || appointment.id);
        } else if (newStatus === 'rejected') {
          result = await interestService.rejectInterest(appointment._id || appointment.id);
        } else if (newStatus === 'visited') {
          result = await interestService.markVisitCompleted(appointment._id || appointment.id);
        } else {
          result = await interestService.updateInterestStatus(appointment._id || appointment.id, newStatus, additionalData);
        }

        if (result.success) {
          // Update local state
          onStatusUpdate(appointment._id, newStatus, additionalData);
          setShowScheduleModal(false);
          setVisitDate('');
        } else {
          alert(`Failed to update status: ${result.error}`);
        }
      } catch (error) {
        console.error('Error updating appointment status:', error);
        alert('Failed to update status. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'pending': return 'badge-warning';
        case 'contacted': return 'badge-info';
        case 'schedule': return 'badge-primary';
        case 'visited': return 'badge-success';
        case 'rejected': return 'badge-error';
        default: return 'badge-secondary';
      }
    };

    const getStatusDisplayName = (status) => {
      switch (status) {
        case 'pending': return 'Pending';
        case 'contacted': return 'Contacted';
        case 'schedule': return 'Scheduled';
        case 'visited': return 'Visited';
        case 'rejected': return 'Rejected';
        default: return status;
      }
    };

    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-neutral-900">{appointment.propertyId?.title}</h3>
              <div className="flex items-center gap-2 text-neutral-600 mt-1">
                <Users size={14} />
                <span className="text-sm">{appointment.contactInfo?.name || 'Anonymous Client'}</span>
              </div>
            </div>
            <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
              {getStatusDisplayName(appointment.status)}
            </span>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-neutral-600">
              <Calendar size={16} />
              <span className="text-sm">
                {appointment.visitDate ? new Date(appointment.visitDate).toLocaleDateString() : 'No date set'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Mail size={16} />
              <span className="text-sm">{appointment.contactInfo?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Phone size={16} />
              <span className="text-sm">{appointment.contactInfo?.phone}</span>
            </div>
          </div>
          
          <p className="text-sm text-neutral-600 mb-4">
            {appointment.message || 'No message provided'}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {appointment.status === 'pending' && (
              <>
                <button 
                  className="btn btn-sm btn-info"
                  onClick={() => handleStatusUpdate('contacted')}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Contact'}
                </button>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowScheduleModal(true)}
                  disabled={isProcessing}
                >
                  Schedule Visit
                </button>
                <button 
                  className="btn btn-sm btn-error"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isProcessing}
                >
                  Reject
                </button>
              </>
            )}
            
            {appointment.status === 'contacted' && (
              <>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowScheduleModal(true)}
                  disabled={isProcessing}
                >
                  Schedule Visit
                </button>
                <button 
                  className="btn btn-sm btn-error"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isProcessing}
                >
                  Reject
                </button>
              </>
            )}
            
            {appointment.status === 'schedule' && (
              <>
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => handleStatusUpdate('visited')}
                  disabled={isProcessing}
                >
                  Mark Visited
                </button>
                <button 
                  className="btn btn-sm btn-error"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isProcessing}
                >
                  Reject
                </button>
              </>
            )}
            
            {appointment.status === 'visited' && (
              <button 
                className="btn btn-sm btn-secondary"
                disabled
              >
                Visit Completed
              </button>
            )}
            
            {appointment.status === 'rejected' && (
              <button 
                className="btn btn-sm btn-secondary"
                disabled
              >
                Rejected
              </button>
            )}
            
            {/* Delete button for all statuses */}
            <button 
              className="btn btn-sm btn-error"
              onClick={() => onDelete && onDelete(appointment._id || appointment.id)}
              disabled={isProcessing}
            >
              Delete
            </button>
          </div>
          
          {/* Schedule Visit Modal */}
          {showScheduleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">Schedule Visit</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Visit Date & Time</label>
                  <input
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setVisitDate('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStatusUpdate('schedule')}
                    disabled={!visitDate || isProcessing}
                  >
                    {isProcessing ? 'Scheduling...' : 'Schedule'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r shadow-lg min-h-screen p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-foreground mb-2 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/80 bg-clip-text text-transparent">Agent Dashboard</h2>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
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
          <div className="nav-item">
            <a 
              href="#listings" 
              className={`nav-link ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('listings'); }}
            >
              <Building size={20} />
              My Listings
            </a>
          </div>
          {/* <div className="nav-item">
            <a 
              href="#clients" 
              className={`nav-link ${activeTab === 'clients' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('clients'); }}
            >
              <Users size={20} />
              Clients
            </a>
          </div> */}
          <div className="nav-item">
            <a 
              href="#appointments" 
              className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('appointments'); }}
            >
              <Calendar size={20} />
              Appointments
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#selling" 
              className={`nav-link ${activeTab === 'selling' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('selling'); }}
            >
              <TrendingUp size={20} />
              Selling Properties
            </a>
          </div>
          {/* <div className="nav-item">
            <a 
              href="#commissions" 
              className={`nav-link ${activeTab === 'commissions' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('commissions'); }}
            >
              <DollarSign size={20} />
              Commissions
            </a>
          </div> */}
          {/* <div className="nav-item">
            <a 
              href="#leads" 
              className={`nav-link ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('leads'); }}
            >
              <Target size={20} />
              Leads
            </a>
          </div> */}
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
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'listings' && 'My Listings'}
              {/* {activeTab === 'clients' && 'Client Management'} */}
              {activeTab === 'appointments' && 'Appointments'}
              {/* {activeTab === 'commissions' && 'Commission Tracking'} */}
              {/* {activeTab === 'leads' && 'Lead Management'} */}
            </h1>
            <p className="text-neutral-600">
              {activeTab === 'overview' && 'Track your listings performance and manage your real estate business'}
              {activeTab === 'listings' && 'Manage your property listings and track their performance'}
              {/* {activeTab === 'clients' && 'Manage your client relationships and communications'} */}
              {activeTab === 'appointments' && 'Schedule and manage property viewings and consultations'}
              {/* {activeTab === 'commissions' && 'Track your earnings and commission history'} */}
              {/* {activeTab === 'leads' && 'Manage potential clients and inquiries'} */}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn btn-secondary">
              <Bell size={16} />
              Notifications
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/properties/new')}>
              <Plus size={16} />
              Add Property
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard
                title="Total Listings"
                value={stats.totalListings}
                icon={Building}
                color="primary"
                onClick={() => setActiveTab('listings')}
              />
              <StatCard
                title="Active Listings"
                value={stats.activeListings}
                icon={CheckCircle}
                color="success"
                onClick={() => setActiveTab('listings')}
              />
              <StatCard
                title="Total Commission"
                value={`ETB ${stats.totalCommission.toLocaleString()}`}
                icon={DollarSign}
                color="warning"
                onClick={() => setActiveTab('commissions')}
              />
              <StatCard
                title="Pending Interests"
                value={stats.pendingInterests}
                icon={Heart}
                color="error"
                onClick={() => setActiveTab('appointments')}
              />
            </div>

            {/* Content Sections */}
            <div className="content-sections">
              <div className="content-section">
                <div className="section-header">
                  <h3>Recent Listings</h3>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('listings')}>
                    View All
                  </button>
                </div>
                <div className="properties-grid">
                  {myListings.slice(0, 3).map(property => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                  {myListings.length === 0 && (
                    <div className="empty-state">
                      <Building size={48} />
                      <h3>No listings yet</h3>
                      <p>Start by adding your first property listing</p>
                      <button className="btn btn-primary" onClick={() => navigate('/properties/add')}>
                        <Plus size={16} />
                        Add Property
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="content-section">
                <div className="section-header">
                  <h3>Recent Appointments</h3>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('appointments')}>
                    View All
                  </button>
                </div>
                <div className="appointments-list">
                  {appointments.slice(0, 5).map(appointment => (
                    <div key={appointment._id || appointment.id} className="appointment-item">
                      <div className="appointment-info">
                        <div className="appointment-client">{appointment.client}</div>
                        <div className="appointment-property">{appointment.property}</div>
                        <div className="appointment-time">
                          <Calendar size={14} />
                          {appointment.date} at {appointment.time}
                        </div>
                      </div>
                      <div className="appointment-status">
                        <span className={`status-badge ${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <div className="empty-state">
                      <Calendar size={48} />
                      <h3>No appointments</h3>
                      <p>You have no scheduled appointments</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="content-section">
            <div className="section-header">
              <h3>My Property Listings</h3>
              <div className="view-controls">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="properties-grid">
                {myListings.map(property => (
                  <div key={property._id} className="admin-card" data-status={property.status}>
                    <PropertyCard 
                      property={property}
                      onToggleFavorite={() => {}}
                      viewMode={viewMode}
                      onImageManage={null}
                      canManageImages={false}
                    />
                    <div className="property-card-actions admin-card-actions" style={{ marginTop: '8px' }}>
                      <button
                        className="card-action-btn view"
                        title="View Details"
                        onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property._id}`); }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="card-action-btn edit"
                        title="Edit Property"
                        onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property._id}/edit`); }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="card-action-btn delete"
                        title="Delete Property"
                        onClick={(e) => { e.stopPropagation(); handleDeleteProperty(property._id); }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="properties-list">
                {myListings.map(property => (
                  <div key={property._id} className="admin-card" data-status={property.status}>
                    <PropertyCard 
                      property={property}
                      onToggleFavorite={() => {}}
                      viewMode="list"
                      onImageManage={null}
                      canManageImages={false}
                    />
                    <div className="property-card-actions admin-card-actions" style={{ marginTop: '8px' }}>
                      <button
                        className="card-action-btn view"
                        title="View Details"
                        onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property._id}`); }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="card-action-btn edit"
                        title="Edit Property"
                        onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property._id}/edit`); }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="card-action-btn delete"
                        title="Delete Property"
                        onClick={(e) => { e.stopPropagation(); handleDeleteProperty(property._id); }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clients Tab */}
        {/* {activeTab === 'clients' && (
          <div className="content-section">
            <div className="section-header">
              <h3>Client Management</h3>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add Client
              </button>
            </div>
            
            <div className="clients-grid">
              {clients.map(client => (
                <div key={client._id} className="client-card">
                  <div className="client-avatar">
                    {client.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="client-info">
                    <h4>{client.name}</h4>
                    <p>{client.email}</p>
                    <p>{client.phone}</p>
                  </div>
                  <div className="client-actions">
                    <button className="btn btn-sm btn-primary">Contact</button>
                    <button className="btn btn-sm btn-secondary">View Profile</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="content-section">
            <div className="section-header">
              <h3>Appointments & Viewings ({appointments.length})</h3>
              <div className="flex items-center gap-2">
                <button className="btn btn-secondary">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="btn btn-secondary">
                  <Search size={16} />
                  Search
                </button>
              </div>
            </div>
            
            <div className="appointments-grid">
              {appointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment._id || appointment.id} 
                      appointment={appointment} 
                      onStatusUpdate={(appointmentId, newStatus, additionalData) => {
                        setAppointments(prev => 
                          prev.map(appointment => 
                            appointment._id === appointmentId 
                              ? { ...appointment, status: newStatus, ...additionalData }
                              : appointment
                          )
                        );
                        
                        // Update stats
                        if (newStatus === 'pending') {
                          setStats(prev => ({ ...prev, pendingInterests: prev.pendingInterests + 1 }));
                        } else if (appointment.status === 'pending' && newStatus !== 'pending') {
                          setStats(prev => ({ ...prev, pendingInterests: prev.pendingInterests - 1 }));
                        }
                      }}
                      onDelete={handleDeleteInterest}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar size={48} className="text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">No appointments yet</h3>
                  <p className="text-neutral-600 mb-4">Appointments will appear here when clients show interest in your properties</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Commissions Tab */}
        {/* {activeTab === 'commissions' && (
          <div className="content-section">
            <div className="section-header">
              <h3>Commission Tracking</h3>
              <div className="commission-summary">
                <span>Total Earned: ETB {stats.totalCommission.toLocaleString()}</span>
                <span>This Month: ETB {stats.monthlyCommission.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="commissions-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Client</th>
                    <th>Sale Price</th>
                    <th>Commission</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(commission => (
                    <tr key={commission.id}>
                      <td>{commission.property}</td>
                      <td>{commission.client}</td>
                      <td>ETB {commission.salePrice}</td>
                      <td>ETB {commission.commission}</td>
                      <td>
                        <span className={`status-badge ${commission.status}`}>
                          {commission.status}
                        </span>
                      </td>
                      <td>{commission.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}

        {/* Leads Tab */}
        {/* {activeTab === 'leads' && (
          <div className="content-section">
            <div className="section-header">
              <h3>Lead Management</h3>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add Lead
              </button>
            </div>
            
            <div className="leads-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Interest</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead._id}>
                      <td>{lead.sender?.name || 'Unknown'}</td>
                      <td>{lead.sender?.email || 'No email'}</td>
                      <td>{lead.sender?.phone || 'No phone'}</td>
                      <td>{lead.subject || 'General inquiry'}</td>
                      <td>
                        <span className={`status-badge ${lead.status || 'new'}`}>
                          {lead.status || 'new'}
                        </span>
                      </td>
                      <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-primary">View</button>
                          <button className="btn btn-sm btn-success">Contact</button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleLeadAction(lead._id, 'contacted')}
                          >
                            Mark Contacted
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}

        {/* Selling Properties Tab */}
        {activeTab === 'selling' && (
          <div className="content-section">
            <div className="section-header">
              <h3>Selling Properties ({myListings.filter(p => p.sold === false && p.isVerified === true).length})</h3>
              <div className="flex items-center gap-2">
                <button className="btn btn-secondary">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="btn btn-secondary">
                  <Search size={16} />
                  Search
                </button>
              </div>
            </div>
            <div className="properties-grid">
              {myListings.filter(p => p.sold === false && p.isVerified === true).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings
                    .filter(p => p.sold === false && p.isVerified === true)
                    .map((property) => (
                      <div key={property._id} className="property-card bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="property-image h-48 bg-neutral-200 flex items-center justify-center">
                          {property.images?.[0] ? (
                            <img 
                              src={`${SERVER_BASE_URL}${property.images[0]}`}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building size={48} className="text-neutral-400" />
                          )}
                        </div>
                        <div className="property-details p-4">
                          <h4 className="font-semibold text-lg text-neutral-900 mb-2">
                            {property.title || 'Property Title'}
                          </h4>
                          <p className="text-neutral-600 mb-2 flex items-center">
                            <MapPin size={16} className="mr-2" />
                            {property.location || 'Location'}
                          </p>
                          <div className="property-stats grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center">
                              <Home size={16} className="mr-2 text-neutral-500" />
                              <span className="text-sm text-neutral-600">{property.features?.bedrooms || 0} beds</span>
                            </div>
                            <div className="flex items-center">
                              <Bath size={16} className="mr-2 text-neutral-600" />
                              <span className="text-sm text-neutral-600">{property.features?.bathrooms || 0} baths</span>
                            </div>
                          </div>
                          <div className="price-info border-t pt-3 mb-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-neutral-700">Price:</span>
                              <span className="text-lg font-semibold text-green-600">
                                ${property.price?.toLocaleString() || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-sm btn-primary flex-1"
                              onClick={() => openPropertyDetails(property)}
                            >
                              <Eye size={16} className="mr-2" />
                              View Details
                            </button>
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => navigate(`/properties/${property._id}/edit`)}
                            >
                              <Edit size={16} className="mr-2" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp size={48} className="text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">No properties currently for sale</h3>
                  <p className="text-neutral-600 mb-4">Properties you manage for sale will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <UserContactForm />
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {showPropertyDetails && selectedProperty && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedProperty.title}</h2>
              <button className="close-btn" onClick={() => setShowPropertyDetails(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="property-details-grid">
                <div className="detail-section">
                  <h3>Overview</h3>
                  <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value">{selectedProperty.status}</span></div>
                  <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value">{selectedProperty.type}</span></div>
                  <div className="detail-row"><span className="detail-label">Price</span><span className="detail-value">ETB {selectedProperty.price?.toLocaleString()}</span></div>
                  <div className="detail-row"><span className="detail-label">Created</span><span className="detail-value">{selectedProperty.createdAt ? new Date(selectedProperty.createdAt).toLocaleDateString() : '-'}</span></div>
                  <div className="detail-row"><span className="detail-label">Views</span><span className="detail-value">{selectedProperty.views || 0}</span></div>
                </div>
                <div className="detail-section">
                  <h3>Details</h3>
                  <div className="detail-row"><span className="detail-label">Location</span><span className="detail-value">{selectedProperty.location}</span></div>
                  <div className="detail-row"><span className="detail-label">Bedrooms</span><span className="detail-value">{selectedProperty.bedrooms}</span></div>
                  <div className="detail-row"><span className="detail-label">Bathrooms</span><span className="detail-value">{selectedProperty.bathrooms}</span></div>
                  <div className="detail-row"><span className="detail-label">Area</span><span className="detail-value">{selectedProperty.area} m²</span></div>
                </div>
                <div className="detail-section">
                  <h3>Owner</h3>
                  <div className="detail-row"><span className="detail-label">Name</span><span className="detail-value">{selectedProperty.owner?.name || user?.name || 'Unknown'}</span></div>
                  <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selectedProperty.owner?.email || '-'}</span></div>
                </div>
              </div>
              <p className="mt-3 text-neutral-700">{selectedProperty.description}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => navigate(`/properties/${selectedProperty._id}`)}>Open Full Page</button>
              <button className="btn btn-primary" onClick={() => setShowPropertyDetails(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;

