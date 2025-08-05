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
  Mail,
  Phone,
  Building,
  UserCheck,
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
import FAQViewer from '../components/FAQViewer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { interestService } from '../services/interestService';
import { messageService } from '../services/messageService';
import { propertyService } from '../services/propertyService';
import { sellingService } from '../services/sellingService';
import { userService } from '../services/userService';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    totalRevenue: 0,
    pendingInterests: 0,
    totalViews: 0,
    averagePrice: 0,
    monthlyRevenue: 0
  });
  
  const [myProperties, setMyProperties] = useState([]);
  const [recentInterests, setRecentInterests] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  
  // Ensure state variables are always arrays
  useEffect(() => {
    if (!Array.isArray(myProperties)) {
      setMyProperties([]);
    }
    if (!Array.isArray(recentInterests)) {
      setRecentInterests([]);
    }
    if (!Array.isArray(salesHistory)) {
      setSalesHistory([]);
    }
    if (!Array.isArray(appointments)) {
      setAppointments([]);
    }
  }, [myProperties, recentInterests, salesHistory, appointments]);

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
    if (!user?._id) {
      console.error('No user ID available');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Fetch all dashboard data in parallel
      console.log("user?._id", user?._id);
      const [propertiesResponse, sellingResponse, interestsResponse, usersResponse, messagesResponse] = await Promise.all([
        propertyService.getPropertiesBySeller(user._id),
        sellingService.list(),
        interestService.getSellerInterests(user._id),
        userService.getUsers(),
        messageService.getMyMessages()
      ]);
      console.log('Interests Response:', interestsResponse);
      console.log('Properties Response:', propertiesResponse);
      console.log('Selling Response:', sellingResponse);
      
      // Debug the actual data structure
      console.log('Properties Response.data:', propertiesResponse.data);
      console.log('Properties Response.data.data:', propertiesResponse.data?.data);
      console.log('Interests Response.data:', interestsResponse.data);
      console.log('Interests Response.data.data:', interestsResponse.data?.data);

      // Process properties data (align with AgentDashboard)
      if (propertiesResponse.success) {
        const properties = propertiesResponse.data?.data?.data || propertiesResponse.data?.data || [];
        const activeProperties = properties.filter(p => p.status === 'approved' || (p.isVerified && !p.sold));
        const soldProps = properties.filter(p => p.status === 'sold' || p.sold);

        setMyProperties(properties);
        setStats(prev => ({ 
          ...prev, 
          totalProperties: properties.length,
          activeListings: activeProperties.length,
          soldProperties: soldProps.length,
          totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0),
          averagePrice: properties.length > 0 ? properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length : 0
        }));
      } else {
        console.error('Failed to fetch properties:', propertiesResponse.error);
        // Set empty arrays as fallback
        setMyProperties([]);
        setStats(prev => ({
          ...prev,
          totalProperties: 0,
          activeListings: 0,
          soldProperties: 0,
          totalViews: 0,
          averagePrice: 0
        }));
      }

      // Process selling data
      if (sellingResponse.success) {
        const allSales = sellingResponse.data?.data || [];
        console.log(allSales);
        const userSales = allSales.filter(sale => sale.seller === user?._id || sale.property?.owner === user?._id);
        
        setSalesHistory(userSales);
        
        const totalRevenue = userSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
        const currentMonth = new Date().getMonth();
        const monthlyRevenue = userSales
          .filter(sale => new Date(sale.createdAt).getMonth() === currentMonth)
          .reduce((sum, sale) => sum + (sale.amount || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalRevenue,
          monthlyRevenue
        }));
      }

      // Process interests data
      if (interestsResponse.success && interestsResponse.data) {
        // Ensure interests is always an array
        const interests = Array.isArray(interestsResponse.data?.data.data)
          ? interestsResponse.data.data.data 
          : Array.isArray(interestsResponse.data) 
            ? interestsResponse.data 
            : [];
        console.log('interests', interests);
        const userInterests = interests.filter(interest => 
          Array.isArray(myProperties) && myProperties.some(prop => prop._id === interest.propertyId?._id)
        );
        
        setRecentInterests(interests.slice(0, 5));
        setAppointments(interests);
        
        const pendingInterests = Array.isArray(userInterests) ? userInterests.filter(i => i.status === 'pending').length : 0;
        
        setStats(prev => ({
          ...prev,
          pendingInterests
        }));
        
        // Calculate analytics
        const currentMonth = new Date().getMonth();
        const inquiriesThisMonth = Array.isArray(userInterests) ? userInterests.filter(i => 
          new Date(i.createdAt).getMonth() === currentMonth
        ).length : 0;
        
        setAnalytics({
          viewsThisMonth: stats.totalViews, // Simplified for demo
          inquiriesThisMonth,
          conversionRate: Array.isArray(userInterests) && userInterests.length > 0 ? (stats.soldProperties / userInterests.length * 100) : 0
        });
      } else {
        console.error('Failed to fetch interests:', interestsResponse.error);
        // Set empty arrays as fallback
        setRecentInterests([]);
        setAppointments([]);
        setStats(prev => ({
          ...prev,
          pendingInterests: 0
        }));
        setAnalytics({
          viewsThisMonth: 0,
          inquiriesThisMonth: 0,
          conversionRate: 0
        });
      }

      // Process users (clients)
      if (usersResponse.success) {
        const users = usersResponse.data?.data?.data || usersResponse.data?.data || [];
        const buyerUsers = users.filter(u => u.role === 'buyer');
        setClients(buyerUsers.slice(0, 10));
      }

      // Process messages (leads)
      if (messagesResponse.success) {
        console.log('Messages Response:', messagesResponse.data.data);
        const messages = messagesResponse.data.data.messages || messagesResponse.data?.data || [];
        setLeads(messages.slice(0, 10));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListingAction = (listingId, action) => {
    setMyProperties(prev => prev.map(listing => 
      listing._id === listingId 
        ? { ...listing, status: action }
        : listing
    ));
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

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await propertyService.deleteProperty(propertyId);
        if (response.success) {
          fetchDashboardData(); // Refresh data
        }
      } catch (error) {
        console.error('Error deleting property:', error);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
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

  

  const InterestCard = ({ interest, onStatusUpdate, onDelete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [visitDate, setVisitDate] = useState('');

    const handleStatusUpdate = async (newStatus, additionalData = {}) => {
      setIsProcessing(true);
      try {
        let result;
        if (newStatus === 'schedule') {
          result = await interestService.scheduleVisit(interest._id, visitDate);
        } else if (newStatus === 'contacted') {
          result = await interestService.markAsContacted(interest._id);
        } else if (newStatus === 'rejected') {
          result = await interestService.rejectInterest(interest._id);
        } else if (newStatus === 'visited') {
          result = await interestService.markVisitCompleted(interest._id);
        } else {
          result = await interestService.updateInterestStatus(interest._id, newStatus, additionalData);
        }

        if (result.success) {
          // Update local state
          onStatusUpdate(interest._id, newStatus, additionalData);
          setShowScheduleModal(false);
          setVisitDate('');
        } else {
          alert(`Failed to update status: ${result.error}`);
        }
      } catch (error) {
        console.error('Error updating interest status:', error);
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
              <h3 className="font-semibold text-neutral-900">{interest.propertyId?.title}</h3>
              <div className="flex items-center gap-2 text-neutral-600 mt-1">
                <Users size={14} />
                <span className="text-sm">{interest.buyerId?.name || 'Anonymous Buyer'}</span>
              </div>
            </div>
            <span className={`badge ${getStatusBadgeClass(interest.status)}`}>
              {getStatusDisplayName(interest.status)}
            </span>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-neutral-600">
              <Calendar size={16} />
              <span className="text-sm">
                {interest.visitDate ? new Date(interest.visitDate).toLocaleDateString() : 'No date set'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Mail size={16} />
              <span className="text-sm">{interest.contactInfo?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <MessageSquare size={16} />
              <span className="text-sm">{interest.contactInfo?.phone}</span>
            </div>
          </div>
          
          <p className="text-sm text-neutral-600 mb-4">
            {interest.message || 'No message provided'}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {interest.status === 'pending' && (
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
            
            {interest.status === 'contacted' && (
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
            
            {interest.status === 'schedule' && (
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
            
            {interest.status === 'visited' && (
              <button 
                className="btn btn-sm btn-secondary"
                disabled
              >
                Visit Completed
              </button>
            )}
            
            {interest.status === 'rejected' && (
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
              onClick={() => onDelete && onDelete(interest._id)}
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

  // Appointment Card Component
  const AppointmentCard = ({ appointment, onStatusUpdate }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [visitDate, setVisitDate] = useState('');

    const handleStatusUpdate = async (newStatus, additionalData = {}) => {
      setIsProcessing(true);
      try {
        let result;
        if (newStatus === 'schedule') {
          result = await interestService.scheduleVisit(appointment._id, visitDate);
        } else if (newStatus === 'contacted') {
          result = await interestService.markAsContacted(appointment._id);
        } else if (newStatus === 'rejected') {
          result = await interestService.rejectInterest(appointment._id);
        } else if (newStatus === 'visited') {
          result = await interestService.markVisitCompleted(appointment._id);
        } else {
          result = await interestService.updateInterestStatus(appointment._id, newStatus, additionalData);
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
              <h3 className="font-semibold text-neutral-900">{appointment.propertyId?.title || appointment.subject || 'Unknown Property'}</h3>
              <div className="flex items-center gap-2 text-neutral-600 mt-1">
                <Users size={14} />
                <span className="text-sm">{appointment.contactInfo?.name || appointment.sender?.name || 'Anonymous Client'}</span>
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
              <span className="text-sm">{appointment.contactInfo?.email || appointment.sender?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Phone size={16} />
              <span className="text-sm">{appointment.contactInfo?.phone || appointment.sender?.phone}</span>
            </div>
          </div>
          
          <p className="text-sm text-neutral-600 mb-4">
            {appointment.message || appointment.content || 'No message provided'}
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
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Seller Dashboard</h2>
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
          <div className="nav-item">
            <a 
              href="#properties" 
              className={`nav-link ${activeTab === 'properties' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('properties'); }}
            >
              <Building size={20} />
              My Properties
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#interests" 
              className={`nav-link ${activeTab === 'interests' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('interests'); }}
            >
              <Users size={20} />
              Buyer Interests
            </a>
          </div>
          {/* <div className="nav-item">
            <a 
              href="#appointments" 
              className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('appointments'); }}
            >
              <Calendar size={20} />
              Appointments
            </a>
          </div> */}
          {<div className="nav-item">
            <a 
              href="#selling" 
              className={`nav-link ${activeTab === 'selling' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('selling'); }}
            >
              <TrendingUp size={20} />
              Selling Properties
            </a>
          </div>}{
          <div className="nav-item">
            <a 
              href="#sales" 
              className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('sales'); }}
            >
              <DollarSign size={20} />
              Sales History
            </a>
          </div>}
          {<div className="nav-item">
            <a 
              href="#analytics" 
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }}
            >
              <PieChart size={20} />
              Analytics
            </a>
          </div>}
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
              {activeTab === 'properties' && 'My Properties'}
              {activeTab === 'interests' && 'Buyer Interests'}
              {activeTab === 'appointments' && 'Appointments'}
            </h1>
            <p className="text-neutral-600">
              {activeTab === 'overview' && 'Track your property listings and manage your real estate business'}
              {activeTab === 'properties' && 'Manage your property listings and track their performance'}
              {activeTab === 'interests' && 'Review and respond to buyer inquiries and visit requests'}
              {activeTab === 'appointments' && 'Schedule and manage property viewings and consultations'}
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
                title="Total Properties"
                value={stats.totalProperties}
                icon={Building}
                color="primary"
                onClick={() => setActiveTab('properties')}
              />
              <StatCard
                title="Active Listings"
                value={stats.activeListings}
                icon={CheckCircle}
                color="success"
                onClick={() => setActiveTab('properties')}
              />
              {<StatCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                icon={DollarSign}
                color="warning"
                onClick={() => setActiveTab('sales')}
              />}
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
                  <h3>Recent Properties</h3>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('properties')}>
                    View All
                  </button>
                </div>
                <div className="properties-grid">
                  {myProperties.slice(0, 3).map(property => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                  {myProperties.length === 0 && (
                    <div className="empty-state">
                      <Building size={48} />
                      <h3>No properties yet</h3>
                      <p>Start by adding your first property listing</p>
                      <button className="btn btn-primary" onClick={() => navigate('/properties/new')}>
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
                    <div key={appointment._id} className="appointment-item">
                      <div className="appointment-info">
                        <div className="appointment-client">{appointment.contactInfo?.name || appointment.sender?.name || 'Anonymous Client'}</div>
                        <div className="appointment-property">{appointment.propertyId?.title || appointment.subject || 'Unknown Property'}</div>
                        <div className="appointment-time">
                          <Calendar size={14} />
                          {new Date(appointment.createdAt).toLocaleDateString()}
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

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="content-section">
            <div className="section-header">
              <h3>My Properties</h3>
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
                {myProperties.map(property => (
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
                {myProperties.length === 0 && (
                  <div className="empty-state">
                    <Building size={48} />
                    <h3>No properties listed</h3>
                    <p>Start by adding your first property listing</p>
                    <button className="btn btn-primary" onClick={() => navigate('/properties/new')}>
                      <Plus size={16} />
                      Add Property
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="properties-list">
                {myProperties.map(property => (
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
                {myProperties.length === 0 && (
                  <div className="empty-state">
                    <Building size={48} />
                    <h3>No properties listed</h3>
                    <p>Start by adding your first property listing</p>
                    <button className="btn btn-primary" onClick={() => navigate('/properties/new')}>
                      <Plus size={16} />
                      Add Property
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Interests Tab */}
        {activeTab === 'interests' && (
          <div className="content-section">
            <div className="section-header">
              <h3>Buyer Interests ({recentInterests.length})</h3>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm btn-secondary">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="btn btn-sm btn-secondary">
                  <Search size={16} />
                  Search
                </button>
              </div>
            </div>
            <div className="interests-grid">
              {recentInterests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentInterests.map((interest) => (
                    <InterestCard 
                      key={interest._id} 
                      interest={interest} 
                      onStatusUpdate={(interestId, newStatus, additionalData) => {
                        setRecentInterests(prev => 
                          prev.map(interest => 
                            interest._id === interestId 
                              ? { ...interest, status: newStatus, ...additionalData }
                              : interest
                          )
                        );
                        
                                                // Update stats
                        if (newStatus === 'pending') {
                          setStats(prev => ({ ...prev, pendingInterests: prev.pendingInterests + 1 }));
                        } else if (interest.status === 'pending' && newStatus !== 'pending') {
                          setStats(prev => ({ ...prev, pendingInterests: prev.pendingInterests - 1 }));
                        }
                      }}
                      onDelete={handleDeleteInterest}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Users size={48} />
                  <h3>No buyer interests yet</h3>
                  <p>Buyer interests will appear here when someone shows interest in your properties</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="content-section">
            <div className="section-header">
              <h3>Appointments & Viewings ({appointments.length})</h3>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm btn-secondary">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="btn btn-sm btn-secondary">
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
                      key={appointment._id} 
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
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Calendar size={48} />
                  <h3>No appointments yet</h3>
                  <p>Appointments will appear here when clients show interest in your properties</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selling Properties Tab */}
        {activeTab === 'selling' && (
          <div className="content-section">
            <div className="section-header">
              <h3>Selling Properties ({myProperties.filter(p => p.sold === false && p.isVerified === true).length})</h3>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm btn-secondary">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="btn btn-sm btn-secondary">
                  <Search size={16} />
                  Search
                </button>
              </div>
            </div>
            <div className="properties-grid">
              {myProperties.filter(p => p.sold === false && p.isVerified === true).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myProperties
                    .filter(p => p.sold === false && p.isVerified === true)
                    .map((property) => (
                      <div key={property._id} className="property-card bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="property-image h-48 bg-neutral-200 flex items-center justify-center">
                          {property.images?.[0] ? (
                            <img 
                              src={`http://127.0.0.1:5000${property.images[0]}`}
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
                              <Bath size={16} className="mr-2 text-neutral-500" />
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
                <div className="empty-state">
                  <TrendingUp size={48} />
                  <h3>No properties currently for sale</h3>
                  <p>Properties you list for sale will appear here</p>
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={() => navigate('/property-form')}
                  >
                    <Plus size={16} className="mr-2" />
                    List New Property
                  </button>
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

        {/* Help Center Tab */}
        {activeTab === 'help' && (
          <div className="space-y-6">
            <FAQViewer userRole="seller" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;

