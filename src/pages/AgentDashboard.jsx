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

import { motion, AnimatePresence } from 'framer-motion';

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

  // WOW UPGRADE: Animated Stat Card with glassmorphism
  const StatCard = ({ title, value, icon: Icon, color = 'primary', onClick }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    useEffect(() => {
      const numValue = typeof value === 'string' 
        ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0
        : value || 0;
      
      if (!isNaN(numValue) && numValue > 0) {
        const duration = 1500;
        const steps = 60;
        const increment = numValue / steps;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= numValue) {
            setDisplayValue(numValue);
            clearInterval(timer);
          } else {
            setDisplayValue(Math.floor(current));
          }
        }, duration / steps);
        
        return () => clearInterval(timer);
      } else {
        setDisplayValue(value);
      }
    }, [value]);

    const formatDisplayValue = () => {
      if (typeof value === 'string') {
        if (value.includes('%')) return `${displayValue}%`;
        if (value.includes('ETB') || value.includes('$')) {
          return value.replace(/[\d,]+/, displayValue.toLocaleString());
        }
        return value;
      }
      return displayValue.toLocaleString();
    };

    const colorClasses = {
      primary: 'from-ethiopian-green/20 to-emerald-500/20 border-ethiopian-green/30',
      success: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      warning: 'from-gold-400/20 to-amber-500/20 border-gold-400/30',
      error: 'from-ethiopian-red/20 to-red-500/20 border-ethiopian-red/30',
    };

    return (
      <motion.div
        className={`relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm backdrop-blur-md cursor-pointer group bg-gradient-to-br ${
          colorClasses[color] || colorClasses.primary
        } ${onClick ? 'hover:scale-105' : ''}`}
        onClick={onClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE] mb-2 font-medium">{title}</p>
            <motion.p
              className="text-3xl font-bold text-foreground"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              {formatDisplayValue()}
            </motion.p>
          </div>
          <motion.div
            className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color] || colorClasses.primary} border`}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Icon size={24} className="text-foreground" />
          </motion.div>
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gold-400/0 to-ethiopian-green/0 pointer-events-none"
          animate={{
            background: isHovered
              ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(4, 120, 87, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(212, 175, 55, 0) 0%, rgba(4, 120, 87, 0) 100%)',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  };

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
              <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">{appointment.propertyId?.title}</h3>
              <div className="flex items-center gap-2 text-[#4B5563] dark:text-[#A8B5AE] mt-1">
                <Users size={14} />
                <span className="text-sm">{appointment.contactInfo?.name || 'Anonymous Client'}</span>
              </div>
            </div>
            <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
              {getStatusDisplayName(appointment.status)}
            </span>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-[#4B5563] dark:text-[#A8B5AE]">
              <Calendar size={16} />
              <span className="text-sm">
                {appointment.visitDate ? new Date(appointment.visitDate).toLocaleDateString() : 'No date set'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#4B5563] dark:text-[#A8B5AE]">
              <Mail size={16} />
              <span className="text-sm">{appointment.contactInfo?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[#4B5563] dark:text-[#A8B5AE]">
              <Phone size={16} />
              <span className="text-sm">{appointment.contactInfo?.phone}</span>
            </div>
          </div>
          
          <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE] mb-4">
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
                    className="w-full p-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-md"
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


  // WOW UPGRADE: Navigation items for glassmorphism sidebar
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'listings', label: 'My Listings', icon: Building },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'selling', label: 'Selling Properties', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageSquare, action: () => navigate('/messages') },
    { id: 'profile', label: 'Profile', icon: User, action: () => navigate('/profile') },
    { id: 'contact', label: 'Contact Support', icon: Mail },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#4B5563] dark:text-[#A8B5AE]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] transition-colors duration-200">
      {/* WOW UPGRADE: Glassmorphism sidebar */}
      <motion.aside
        className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#141A17] border-r border-[#E5E0D8] dark:border-[#2A342E] z-40 overflow-y-auto transition-colors duration-200"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="p-6 mb-8 border-b border-[#E5E0D8] dark:border-[#2A342E]">
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-ethiopian-green to-gold-400 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Agent Dashboard
          </motion.h2>
          <motion.p
            className="text-sm text-[#4B5563] dark:text-[#A8B5AE]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome back, {user?.name}
          </motion.p>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? 'bg-[#0B6E4F] text-white font-bold shadow-md'
                    : 'text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute right-0 top-0 bottom-0 w-1 bg-gold-400"
                    layoutId="agentActiveIndicator"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.a>
            );
          })}
        </nav>
      </motion.aside>

      {/* WOW UPGRADE: Main content with proper spacing */}
      <div className="ml-64 min-h-screen">
        <div className="p-8">
          {/* WOW UPGRADE: Animated header */}
          <motion.div
            className="mb-8 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-ethiopian-green to-gold-400 bg-clip-text text-transparent mb-2"
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'listings' && 'My Listings'}
                {activeTab === 'appointments' && 'Appointments'}
                {activeTab === 'selling' && 'Selling Properties'}
                {activeTab === 'contact' && 'Contact Support'}
              </motion.h1>
              <motion.p
                className="text-[#4B5563] dark:text-[#A8B5AE] text-lg"
                key={`${activeTab}-desc`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {activeTab === 'overview' && 'Track your listings performance and manage your real estate business'}
                {activeTab === 'listings' && 'Manage your property listings and track their performance'}
                {activeTab === 'appointments' && 'Schedule and manage property viewings and consultations'}
                {activeTab === 'selling' && 'View and manage properties currently for sale'}
                {activeTab === 'contact' && 'Get in touch with our support team'}
              </motion.p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                className="px-4 py-2 bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm border-[#E5E0D8]/30 dark:border-[#2A342E]/30 rounded-lg text-[#4B5563] dark:text-[#A8B5AE] hover:text-foreground hover:bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={16} />
                Notifications
              </motion.button>
              <motion.button
                className="px-6 py-2 bg-[#0B6E4F] hover:bg-[#095C42] text-white rounded-xl shadow-md hover:shadow-[0_0_15px_rgba(212,160,23,0.3)] cursor-pointer flex items-center gap-2 font-medium"
                onClick={() => navigate('/properties/new')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} />
                Add Property
              </motion.button>
            </div>
          </motion.div>

          {/* Overview Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 },
                    },
                  }}
                >
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <StatCard
                      title="Total Listings"
                      value={stats.totalListings}
                      icon={Building}
                      color="primary"
                      onClick={() => setActiveTab('listings')}
                    />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <StatCard
                      title="Active Listings"
                      value={stats.activeListings}
                      icon={CheckCircle}
                      color="success"
                      onClick={() => setActiveTab('listings')}
                    />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <StatCard
                      title="Total Commission"
                      value={`ETB ${stats.totalCommission.toLocaleString()}`}
                      icon={DollarSign}
                      color="warning"
                    />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <StatCard
                      title="Pending Interests"
                      value={stats.pendingInterests}
                      icon={Heart}
                      color="error"
                      onClick={() => setActiveTab('appointments')}
                    />
                  </motion.div>
                </motion.div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Listings */}
                  <motion.div
                    className="glass-card rounded-2xl p-6 border border-[#E5E0D8]/30 dark:border-[#2A342E]/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-foreground">Recent Listings</h3>
                      <motion.button
                        className="px-4 py-2 text-sm bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 text-[#4B5563] dark:text-[#A8B5AE] hover:text-foreground rounded-lg transition-all"
                        onClick={() => setActiveTab('listings')}
                        whileHover={{ scale: 1.05 }}
                      >
                        View All
                      </motion.button>
                    </div>
                    <div className="space-y-4">
                      {Array.isArray(myListings) && myListings.slice(0, 3).map((listing, index) => (
                        <motion.div
                          key={listing._id}
                          className="flex items-center gap-4 p-4 bg-[#F0EDE6]/30 dark:bg-[#1C2420]/30 rounded-xl hover:bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 transition-all cursor-pointer"
                          onClick={() => openPropertyDetails(listing)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ x: 4 }}
                        >
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-ethiopian-green/20 to-gold-400/20 flex items-center justify-center overflow-hidden">
                            {listing.images?.[0] ? (
                              <img 
                                src={`${SERVER_BASE_URL}${listing.images[0]}`} 
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building size={24} className="text-ethiopian-green" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{listing.title}</h4>
                            <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">ETB {listing.price?.toLocaleString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            listing.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            listing.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-[#F0EDE6] dark:bg-[#1C2420] text-[#4B5563] dark:text-[#A8B5AE]'
                          }`}>
                            {listing.status}
                          </span>
                        </motion.div>
                      ))}
                      {(!myListings || myListings.length === 0) && (
                        <p className="text-center text-[#4B5563] dark:text-[#A8B5AE] py-8">No listings yet</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Recent Appointments */}
                  <motion.div
                    className="glass-card rounded-2xl p-6 border border-[#E5E0D8]/30 dark:border-[#2A342E]/30"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-foreground">Recent Appointments</h3>
                      <motion.button
                        className="px-4 py-2 text-sm bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 text-[#4B5563] dark:text-[#A8B5AE] hover:text-foreground rounded-lg transition-all"
                        onClick={() => setActiveTab('appointments')}
                        whileHover={{ scale: 1.05 }}
                      >
                        View All
                      </motion.button>
                    </div>
                    <div className="space-y-4">
                      {Array.isArray(recentInterests) && recentInterests.slice(0, 3).map((interest, index) => (
                        <motion.div
                          key={interest._id}
                          className="flex items-center gap-4 p-4 bg-[#F0EDE6]/30 dark:bg-[#1C2420]/30 rounded-xl"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400/20 to-ethiopian-green/20 flex items-center justify-center">
                            <Users size={20} className="text-gold-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{interest.contactInfo?.name || 'Anonymous'}</h4>
                            <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE] truncate">{interest.propertyId?.title || 'Property'}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            interest.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            interest.status === 'contacted' ? 'bg-[#0B6E4F] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#0D8A62]' :
                            interest.status === 'schedule' ? 'bg-green-500/20 text-green-400' :
                            'bg-[#F0EDE6] dark:bg-[#1C2420] text-[#4B5563] dark:text-[#A8B5AE]'
                          }`}>
                            {interest.status}
                          </span>
                        </motion.div>
                      ))}
                      {(!recentInterests || recentInterests.length === 0) && (
                        <p className="text-center text-[#4B5563] dark:text-[#A8B5AE] py-8">No appointments yet</p>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Listings Tab */}
            {activeTab === 'listings' && (
              <motion.div
                key="listings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.button
                      className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-ethiopian-green text-white' : 'bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 text-[#4B5563] dark:text-[#A8B5AE]'}`}
                      onClick={() => setViewMode('grid')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Grid size={20} />
                    </motion.button>
                    <motion.button
                      className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-ethiopian-green text-white' : 'bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 text-[#4B5563] dark:text-[#A8B5AE]'}`}
                      onClick={() => setViewMode('list')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <List size={20} />
                    </motion.button>
                  </div>
                </div>
                
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5' : 'space-y-4'}>
                  {Array.isArray(myListings) && myListings.map((listing, index) => (
                    <motion.div
                      key={listing._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <PropertyCard property={listing} />
                    </motion.div>
                  ))}
                  {(!myListings || myListings.length === 0) && (
                    <div className="col-span-full text-center py-12 glass-card rounded-2xl">
                      <Building size={48} className="mx-auto mb-4 text-[#4B5563] dark:text-[#A8B5AE]" />
                      <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                      <p className="text-[#4B5563] dark:text-[#A8B5AE] mb-4">Start by adding your first property listing</p>
                      <motion.button
                        className="px-6 py-2 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/80 text-white rounded-lg"
                        onClick={() => navigate('/properties/new')}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Plus size={16} className="inline mr-2" />
                        Add Property
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {Array.isArray(appointments) && appointments.map((appointment, index) => (
                    <motion.div
                      key={appointment._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <AppointmentCard 
                        appointment={appointment}
                        onStatusUpdate={(id, status) => {
                          setAppointments(prev => prev.map(a => 
                            a._id === id ? { ...a, status } : a
                          ));
                        }}
                        onDelete={handleDeleteInterest}
                      />
                    </motion.div>
                  ))}
                  {(!appointments || appointments.length === 0) && (
                    <div className="col-span-full text-center py-12 glass-card rounded-2xl">
                      <Calendar size={48} className="mx-auto mb-4 text-[#4B5563] dark:text-[#A8B5AE]" />
                      <h3 className="text-xl font-semibold mb-2">No appointments</h3>
                      <p className="text-[#4B5563] dark:text-[#A8B5AE]">Appointments will appear here when buyers express interest</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Selling Tab */}
            {activeTab === 'selling' && (
              <motion.div
                key="selling"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {Array.isArray(myListings) && myListings.filter(l => l.status === 'approved').map((listing, index) => (
                    <motion.div
                      key={listing._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <PropertyCard property={listing} />
                    </motion.div>
                  ))}
                  {(!myListings || myListings.filter(l => l.status === 'approved').length === 0) && (
                    <div className="col-span-full text-center py-12 glass-card rounded-2xl">
                      <TrendingUp size={48} className="mx-auto mb-4 text-[#4B5563] dark:text-[#A8B5AE]" />
                      <h3 className="text-xl font-semibold mb-2">No active listings</h3>
                      <p className="text-[#4B5563] dark:text-[#A8B5AE]">Your approved properties for sale will appear here</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="glass-card rounded-2xl p-8 border border-[#E5E0D8]/30 dark:border-[#2A342E]/30">
                  <h3 className="text-2xl font-bold mb-6 text-foreground">Contact Support</h3>
                  <UserContactForm />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Property Details Modal */}
      {showPropertyDetails && selectedProperty && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#E5E0D8]/30 dark:border-[#2A342E]/30">
              <h2 className="text-xl font-bold text-foreground">{selectedProperty.title}</h2>
              <button 
                className="p-2 hover:bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 rounded-lg transition-colors"
                onClick={() => setShowPropertyDetails(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">Status</p>
                  <p className="font-semibold">{selectedProperty.status}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">Price</p>
                  <p className="font-semibold">ETB {selectedProperty.price?.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">Location</p>
                  <p className="font-semibold">{selectedProperty.location}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">Type</p>
                  <p className="font-semibold">{selectedProperty.type}</p>
                </div>
              </div>
              <p className="text-[#4B5563] dark:text-[#A8B5AE]">{selectedProperty.description}</p>
            </div>
            <div className="flex gap-4 p-6 border-t border-[#E5E0D8]/30 dark:border-[#2A342E]/30">
              <button 
                className="flex-1 py-2 bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 text-foreground rounded-lg hover:bg-[#F0EDE6] dark:bg-[#1C2420] transition-colors"
                onClick={() => navigate(`/properties/${selectedProperty._id}`)}
              >
                View Full Page
              </button>
              <button 
                className="flex-1 py-2 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-green/90 transition-colors"
                onClick={() => setShowPropertyDetails(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;

