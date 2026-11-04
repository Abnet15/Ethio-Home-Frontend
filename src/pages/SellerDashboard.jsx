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
  X,
  Menu
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
import { SERVER_BASE_URL } from '../config/api';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileOpen, setMobileOpen] = useState(false);
  
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

  // WOW UPGRADE: Animated Stat Card with glassmorphism and counter animation
  const StatCard = ({ title, value, icon: Icon, color = 'primary', onClick }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    useEffect(() => {
      // Extract numeric value for animation
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
      primary: 'from-coffee-500/20 to-chocolate-500/20 border-coffee-500/30',
      success: 'from-ethiopian-green/20 to-emerald-500/20 border-ethiopian-green/30',
      warning: 'from-gold-400/20 to-amber-500/20 border-gold-400/30',
      error: 'from-ethiopian-red/20 to-red-500/20 border-ethiopian-red/30',
    };

    return (
      <motion.div
        className={`relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm backdrop-blur-md cursor-pointer group ${
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
            <p className="text-sm text-coffee-300/70 mb-2 font-medium">{title}</p>
            <motion.p
              className="text-3xl font-bold text-gradient-coffee"
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
            <Icon size={24} className="text-coffee-400" />
          </motion.div>
        </div>
        {/* Animated gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-coffee-500/0 to-chocolate-500/0 pointer-events-none"
          animate={{
            background: isHovered
              ? 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(210, 105, 30, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(139, 69, 19, 0) 0%, rgba(210, 105, 30, 0) 100%)',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  };

  

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
      <div className="bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] rounded-2xl overflow-hidden hover:border-[#0B6E4F]/30 transition-all">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">{interest.propertyId?.title}</h3>
              <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE] mt-1">
                <Users size={14} />
                <span className="text-sm">{interest.buyerId?.name || 'Anonymous Buyer'}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              interest.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              interest.status === 'contacted' ? 'bg-[#0B6E4F] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#0D8A62] border border-[#0B6E4F] dark:border-[#0B6E4F]/30' :
              interest.status === 'visited' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              interest.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-[#0B6E4F] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#10B981] border border-[#0B6E4F]/30'
            }`}>
              {getStatusDisplayName(interest.status)}
            </span>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE]">
              <Calendar size={16} />
              <span className="text-sm">
                {interest.visitDate ? new Date(interest.visitDate).toLocaleDateString() : 'No date set'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE]">
              <Mail size={16} />
              <span className="text-sm">{interest.contactInfo?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE]">
              <MessageSquare size={16} />
              <span className="text-sm">{interest.contactInfo?.phone}</span>
            </div>
          </div>
          
          <p className="text-sm text-[#4B5563] dark:text-[#6B7A73] mb-4">
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#F8F4EC] dark:bg-[#0B0F0D] border border-[#E5E0D8] dark:border-[#2A342E] rounded-2xl p-6 w-96 shadow-2xl">
                <h3 className="text-lg font-semibold mb-4 text-[#1A1A1A] dark:text-[#F8F4EC]">Schedule Visit</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-[#4B5563] dark:text-[#A8B5AE]">Visit Date & Time</label>
                  <input
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-3 bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] rounded-xl text-[#1A1A1A] dark:text-[#F8F4EC] focus:border-[#0B6E4F] focus:ring-1 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] outline-none"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    className="px-4 py-2 bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#E5E0D8] dark:hover:bg-[#2A342E] rounded-xl transition-all"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setVisitDate('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-[#0B6E4F] dark:bg-[#0B6E4F] hover:bg-[#0B6E4F] dark:bg-[#0B6E4F] text-[#1A1A1A] dark:text-[#F8F4EC] rounded-xl transition-all"
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
      <div className="bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] rounded-2xl overflow-hidden hover:border-[#0B6E4F]/30 transition-all">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">{appointment.propertyId?.title || appointment.subject || 'Unknown Property'}</h3>
              <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE] mt-1">
                <Users size={14} />
                <span className="text-sm">{appointment.contactInfo?.name || appointment.sender?.name || 'Anonymous Client'}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              appointment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              appointment.status === 'contacted' ? 'bg-[#0B6E4F] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#0D8A62] border border-[#0B6E4F] dark:border-[#0B6E4F]/30' :
              appointment.status === 'visited' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              appointment.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-[#0B6E4F] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#10B981] border border-[#0B6E4F]/30'
            }`}>
              {getStatusDisplayName(appointment.status)}
            </span>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE]">
              <Calendar size={16} />
              <span className="text-sm">
                {appointment.visitDate ? new Date(appointment.visitDate).toLocaleDateString() : 'No date set'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE]">
              <Mail size={16} />
              <span className="text-sm">{appointment.contactInfo?.email || appointment.sender?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE]">
              <Phone size={16} />
              <span className="text-sm">{appointment.contactInfo?.phone || appointment.sender?.phone}</span>
            </div>
          </div>
          
          <p className="text-sm text-[#4B5563] dark:text-[#6B7A73] mb-4">
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#F8F4EC] dark:bg-[#0B0F0D] border border-[#E5E0D8] dark:border-[#2A342E] rounded-2xl p-6 w-96 shadow-2xl">
                <h3 className="text-lg font-semibold mb-4 text-[#1A1A1A] dark:text-[#F8F4EC]">Schedule Visit</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-[#4B5563] dark:text-[#A8B5AE]">Visit Date & Time</label>
                  <input
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-3 bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] rounded-xl text-[#1A1A1A] dark:text-[#F8F4EC] focus:border-[#0B6E4F] focus:ring-1 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] outline-none"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    className="px-4 py-2 bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#E5E0D8] dark:hover:bg-[#2A342E] rounded-xl transition-all"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setVisitDate('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-[#0B6E4F] dark:bg-[#0B6E4F] hover:bg-[#0B6E4F] dark:bg-[#0B6E4F] text-[#1A1A1A] dark:text-[#F8F4EC] rounded-xl transition-all"
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
      <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0B6E4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B7280] dark:text-[#A8B5AE]">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  // WOW UPGRADE: Glassmorphism sidebar with Ethiopian theme
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'properties', label: 'My Properties', icon: Building },
    { id: 'interests', label: 'Buyer Interests', icon: Users },
    { id: 'selling', label: 'Selling Properties', icon: TrendingUp },
    { id: 'sales', label: 'Sales History', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'messages', label: 'Messages', icon: MessageSquare, action: () => navigate('/messages') },
    { id: 'profile', label: 'Profile', icon: User, action: () => navigate('/profile') },
    { id: 'contact', label: 'Contact Support', icon: Mail },
    { id: 'help', label: 'Help Center', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] relative overflow-hidden transition-colors duration-200">
      {/* Dark mode background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)', filter: 'blur(100px)' }} />
      </div>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-20 left-4 z-50 w-12 h-12 rounded-xl bg-[#F8F4EC] dark:bg-[#0B0F0D]/95 backdrop-blur-xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-xl flex items-center justify-center hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] transition-all">
            <Menu className="w-5 h-5 text-[#4B5563] dark:text-[#A8B5AE]" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-white dark:bg-[#141A17] border-r border-[#E5E0D8] dark:border-[#2A342E] p-0">
          <div className="p-6 border-b border-[#E5E0D8] dark:border-[#2A342E]">
            <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-1">Seller Dashboard</h2>
            <p className="text-sm text-[#6B7280] dark:text-[#A8B5AE]">Welcome back, {user?.name}</p>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { if (item.action) item.action(); else setActiveTab(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === item.id ? 'bg-[#0B6E4F] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#10B981] border border-[#0B6E4F]/30' : 'text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Fixed Desktop Sidebar */}
      <motion.aside
        className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-[#F8F4EC] dark:bg-[#0B0F0D]/95 backdrop-blur-2xl border-r border-[#E5E0D8] dark:border-[#2A342E] z-40 overflow-y-auto"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="p-6 mb-8 border-b border-[#E5E0D8] dark:border-[#2A342E]">
          <motion.h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">Seller Dashboard</motion.h2>
          <motion.p className="text-sm text-[#6B7280] dark:text-[#A8B5AE]">Welcome back, {user?.name}</motion.p>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  isActive ? 'bg-[#0B6E4F] dark:bg-[#0B6E4F]/20 text-[#0B6E4F] dark:text-[#10B981] border border-[#0B6E4F]/30 shadow-lg shadow-[#0B6E4F]/10' : 'text-[#6B7280] dark:text-[#A8B5AE] hover:bg-[#F0EDE6]/50 dark:hover:bg-[#1C2420]/50 hover:text-[#F8F4EC] dark:hover:text-[#F8F4EC]'
                }`}
                onClick={() => { if (item.action) item.action(); else setActiveTab(item.id); }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div className="absolute right-0 top-0 bottom-0 w-1 bg-[#0D8A62] dark:bg-[#0D8A62]" layoutId="sellerActiveIndicator" />
                )}
              </motion.button>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* WOW UPGRADE: Animated header */}
          <motion.div
            className="mb-8 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <motion.h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-2"
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'properties' && 'My Properties'}
                {activeTab === 'interests' && 'Buyer Interests'}
                {activeTab === 'appointments' && 'Appointments'}
                {activeTab === 'selling' && 'Selling Properties'}
                {activeTab === 'sales' && 'Sales History'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'contact' && 'Contact Support'}
                {activeTab === 'help' && 'Help Center'}
              </motion.h1>
              <motion.p
                className="text-[#6B7280] dark:text-[#A8B5AE] text-lg"
                key={`${activeTab}-desc`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {activeTab === 'overview' && 'Track your property listings and manage your real estate business'}
                {activeTab === 'properties' && 'Manage your property listings and track their performance'}
                {activeTab === 'interests' && 'Review and respond to buyer inquiries and visit requests'}
                {activeTab === 'appointments' && 'Schedule and manage property viewings and consultations'}
                {activeTab === 'selling' && 'View and manage properties currently for sale'}
                {activeTab === 'sales' && 'Track your sales history and revenue'}
                {activeTab === 'analytics' && 'View detailed analytics and insights'}
                {activeTab === 'contact' && 'Get in touch with our support team'}
                {activeTab === 'help' && 'Find answers to common questions'}
              </motion.p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                className="px-4 py-2 bg-[#F0EDE6]/80 dark:bg-[#1C2420]/80 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#1A1A1A] dark:text-[#F8F4EC] hover:bg-[#E5E0D8] dark:hover:bg-[#2A342E] transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={16} />
                Notifications
              </motion.button>
              <motion.button
                className="px-6 py-2 bg-gradient-to-r from-[#0B6E4F] to-[#D4A017] text-[#1A1A1A] dark:text-[#F8F4EC] rounded-lg shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
                onClick={() => navigate('/properties/new')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} />
                Add Property
              </motion.button>
            </div>
          </motion.div>

        {/* WOW UPGRADE: Overview Tab with animated stats */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* WOW UPGRADE: Animated Stats Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <StatCard
                    title="Total Properties"
                    value={stats.totalProperties}
                    icon={Building}
                    color="primary"
                    onClick={() => setActiveTab('properties')}
                  />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <StatCard
                    title="Active Listings"
                    value={stats.activeListings}
                    icon={CheckCircle}
                    color="success"
                    onClick={() => setActiveTab('properties')}
                  />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={DollarSign}
                    color="warning"
                    onClick={() => setActiveTab('sales')}
                  />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <StatCard
                    title="Pending Interests"
                    value={stats.pendingInterests}
                    icon={Heart}
                    color="error"
                    onClick={() => setActiveTab('interests')}
                  />
                </motion.div>
              </motion.div>

              {/* WOW UPGRADE: Content Sections with glassmorphism */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  className="bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm border-coffee-800/30 rounded-2xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-coffee-200">Recent Properties</h3>
                    <motion.button
                      className="px-4 py-2 glass border border-coffee-800/30 rounded-lg text-coffee-200 hover:text-[#1A1A1A] dark:text-[#F8F4EC] text-sm"
                      onClick={() => setActiveTab('properties')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    {myProperties.slice(0, 3).map((property, index) => (
                      <motion.div
                        key={property._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <PropertyCard property={property} />
                      </motion.div>
                    ))}
                    {myProperties.length === 0 && (
                      <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div
                          className="inline-block p-4 rounded-full bg-coffee-800/30 mb-4"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Building size={48} className="text-coffee-400" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-coffee-200 mb-2">No properties yet</h3>
                        <p className="text-coffee-300/70 mb-4">Start by adding your first property listing</p>
                        <motion.button
                          className="px-6 py-2 bg-gradient-coffee text-[#1A1A1A] dark:text-[#F8F4EC] rounded-lg shadow-lg font-medium flex items-center gap-2 mx-auto"
                          onClick={() => navigate('/properties/new')}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus size={16} />
                          Add Property
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm border-coffee-800/30 rounded-2xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-coffee-200">Recent Appointments</h3>
                    <motion.button
                      className="px-4 py-2 glass border border-coffee-800/30 rounded-lg text-coffee-200 hover:text-[#1A1A1A] dark:text-[#F8F4EC] text-sm"
                      onClick={() => setActiveTab('interests')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All
                    </motion.button>
                  </div>
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((appointment, index) => (
                      <motion.div
                        key={appointment._id}
                        className="glass border border-coffee-800/20 rounded-lg p-4 hover:border-coffee-500/30 transition-all"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-coffee-200 mb-1">
                              {appointment.contactInfo?.name || appointment.sender?.name || 'Anonymous Client'}
                            </div>
                            <div className="text-sm text-coffee-300/70 mb-2">
                              {appointment.propertyId?.title || appointment.subject || 'Unknown Property'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-coffee-400">
                              <Calendar size={14} />
                              {new Date(appointment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            appointment.status === 'pending' ? 'bg-gold-400/20 text-gold-400' :
                            appointment.status === 'contacted' ? 'bg-[#0D8A62] dark:bg-[#0D8A62]/20 text-[#0B6E4F] dark:text-[#0D8A62]' :
                            appointment.status === 'schedule' ? 'bg-ethiopian-green/20 text-ethiopian-green' :
                            'bg-coffee-800/30 text-coffee-300'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {appointments.length === 0 && (
                      <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <motion.div
                          className="inline-block p-4 rounded-full bg-coffee-800/30 mb-4"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Calendar size={48} className="text-coffee-400" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-coffee-200 mb-2">No appointments</h3>
                        <p className="text-coffee-300/70">You have no scheduled appointments</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WOW UPGRADE: Properties Tab with animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'properties' && (
            <motion.div
              key="properties"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {myProperties.map(property => (
                  <div key={property._id} className="flex flex-col space-y-2">
                    <PropertyCard 
                      property={property}
                      onToggleFavorite={() => {}}
                      viewMode={viewMode}
                      onImageManage={null}
                      canManageImages={false}
                    />
                    <div className="flex items-center justify-end gap-1.5 px-1">
                      <button
                        className="p-1.5 rounded-lg bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] hover:border-[#0B6E4F] transition-all cursor-pointer shadow-xs"
                        title="View Details"
                        onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property._id}`); }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#D4A017] hover:border-[#D4A017] transition-all cursor-pointer shadow-xs"
                        title="Edit Property"
                        onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property._id}/edit`); }}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#C45C26] hover:bg-[#C45C26]/10 transition-all cursor-pointer shadow-xs"
                        title="Delete Property"
                        onClick={(e) => { e.stopPropagation(); handleDeleteProperty(property._id); }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                {myProperties.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white dark:bg-[#141A17] rounded-2xl border border-[#E5E0D8] dark:border-[#2A342E] p-8">
                    <Building size={44} className="mx-auto mb-3 text-[#D4A017] opacity-60" />
                    <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-1">No properties listed</h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#A8B5AE] mb-4">Start by adding your first property listing</p>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B6E4F] text-white text-xs font-bold shadow-md hover:bg-[#095C42] transition-all" onClick={() => navigate('/properties/new')}>
                      <Plus size={15} />
                      Add Property
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {myProperties.map(property => (
                  <div key={property._id} className="flex flex-col space-y-2">
                    <PropertyCard 
                      property={property}
                      onToggleFavorite={() => {}}
                      viewMode="list"
                      onImageManage={null}
                      canManageImages={false}
                    />
                    <div className="flex items-center justify-end gap-1.5 px-1">
                      <button
                        className="p-1.5 rounded-lg bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#0B6E4F] hover:border-[#0B6E4F] transition-all cursor-pointer shadow-xs"
                        title="View Details"
                        onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property._id}`); }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#D4A017] hover:border-[#D4A017] transition-all cursor-pointer shadow-xs"
                        title="Edit Property"
                        onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property._id}/edit`); }}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-[#C45C26] hover:bg-[#C45C26]/10 transition-all cursor-pointer shadow-xs"
                        title="Delete Property"
                        onClick={(e) => { e.stopPropagation(); handleDeleteProperty(property._id); }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                {myProperties.length === 0 && (
                  <div className="py-12 text-center bg-white dark:bg-[#141A17] rounded-2xl border border-[#E5E0D8] dark:border-[#2A342E] p-8">
                    <Building size={44} className="mx-auto mb-3 text-[#D4A017] opacity-60" />
                    <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-1">No properties listed</h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#A8B5AE] mb-4">Start by adding your first property listing</p>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B6E4F] text-white text-xs font-bold shadow-md hover:bg-[#095C42] transition-all" onClick={() => navigate('/properties/new')}>
                      <Plus size={15} />
                      Add Property
                    </button>
                  </div>
                )}
              </div>
            )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WOW UPGRADE: Interests Tab with animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'interests' && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                <motion.div
                  className="col-span-full text-center py-16 bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm border-coffee-800/30 rounded-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="inline-block p-6 rounded-full bg-gradient-to-br from-ethiopian-green/20 to-emerald-500/20 mb-6"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Users size={64} className="text-ethiopian-green" />
                  </motion.div>
                  <motion.h3
                    className="text-2xl font-bold text-gradient-coffee mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    No buyer interests yet
                  </motion.h3>
                  <motion.p
                    className="text-coffee-300/70 mb-6 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Buyer interests will appear here when someone shows interest in your properties
                  </motion.p>
                </motion.div>
              )}
            </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WOW UPGRADE: Appointments Tab with animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'appointments' && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* WOW UPGRADE: Selling Properties Tab with animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'selling' && (
            <motion.div
              key="selling"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {myProperties
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
                            <Building size={48} className="text-[#6B7A73] dark:text-[#A8B5AE]" />
                          )}
                        </div>
                        <div className="property-details p-4">
                          <h4 className="font-semibold text-lg text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">
                            {property.title || 'Property Title'}
                          </h4>
                          <p className="text-[#4B5563] dark:text-[#A8B5AE] mb-2 flex items-center">
                            <MapPin size={16} className="mr-2" />
                            {property.location || 'Location'}
                          </p>
                          <div className="property-stats grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center">
                              <Home size={16} className="mr-2 text-[#4B5563] dark:text-[#6B7A73]" />
                              <span className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">{property.features?.bedrooms || 0} beds</span>
                            </div>
                            <div className="flex items-center">
                              <Bath size={16} className="mr-2 text-[#4B5563] dark:text-[#6B7A73]" />
                              <span className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">{property.features?.bathrooms || 0} baths</span>
                            </div>
                          </div>
                          <div className="price-info border-t pt-3 mb-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE]">Price:</span>
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
                <motion.div
                  className="col-span-full text-center py-16 bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm border-coffee-800/30 rounded-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="inline-block p-6 rounded-full bg-gradient-to-br from-gold-400/20 to-amber-500/20 mb-6"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <TrendingUp size={64} className="text-gold-400" />
                  </motion.div>
                  <motion.h3
                    className="text-2xl font-bold text-gradient-coffee mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    No properties currently for sale
                  </motion.h3>
                  <motion.p
                    className="text-coffee-300/70 mb-6 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Properties you list for sale will appear here
                  </motion.p>
                  <motion.button
                    className="px-8 py-3 bg-gradient-coffee text-[#1A1A1A] dark:text-[#F8F4EC] rounded-lg shadow-xl hover:shadow-2xl font-medium flex items-center gap-2 mx-auto"
                    onClick={() => navigate('/properties/new')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Plus size={20} />
                    List New Property
                  </motion.button>
                </motion.div>
              )}
            </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WOW UPGRADE: Contact Tab with animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <UserContactForm />
            </motion.div>
          )}
        </AnimatePresence>

        {/* WOW UPGRADE: Help Center Tab with animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'help' && (
            <motion.div
              key="help"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <FAQViewer userRole="seller" />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

