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
  Download,
  Menu
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
import PropertyCardEnhanced from '../components/PropertyCardEnhanced';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileOpen, setMobileOpen] = useState(false);

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
      if (favoritesResponse.data.status == 'success') {
        const favorites = favoritesResponse.data.data.favorites || [];
        console.log("favoritesResponse", favorites);

        setFavoriteProperties(favorites);
        setStats(prev => ({ ...prev, favoriteProperties: favorites.length }));
      }

      // Process properties for recommendations and recently viewed
      if (propertiesResponse.data.status == 'success') {
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
      if (visitsResponse.success || visitsResponse.data?.status == 'success') {
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
      visitDate: visit.visitDate ? new Date(visit.visitDate).toISOString().slice(0, 16) : '',
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
    <div 
      className="group relative bg-card/95 backdrop-blur-sm border border-[#E5E0D8] dark:border-[#2A342E]/60 rounded-2xl p-6 cursor-pointer hover:shadow-luxury hover:border-gold-400/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
      onClick={onClick}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/0 to-gold-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#4B5563] dark:text-[#A8B5AE] uppercase tracking-wider">{title}</h3>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-glow-gold transition-all duration-500">
            <Icon className="w-6 h-6 text-gold-500" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gradient-gold">{value}</p>
      </div>
    </div>
  );

  const PropertyCard = ({ property, isFavorite = false, showFavoriteButton = true }) => (
    <PropertyCardEnhanced
      property={property}
      isFavorite={isFavorite}
      onToggleFavorite={() => isFavorite ? handleRemoveFromFavorites(property._id || property.id) : handleAddToFavorites(property._id || property.id)}
    />
  );

  const VisitCard = ({ visit }) => (
    <div className="group relative bg-card/95 backdrop-blur-xl border border-[#E5E0D8] dark:border-[#2A342E]/40 rounded-2xl overflow-hidden hover:border-gold-400/40 hover:shadow-xl hover:shadow-gold-400/10 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/0 to-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-foreground group-hover:text-gold-400 transition-colors">{visit.propertyId?.title}</h3>
            <div className="flex items-center gap-2 text-[#4B5563] dark:text-[#A8B5AE] mt-1">
              <MapPin size={14} className="text-gold-500" />
              <span className="text-sm">{visit.propertyId?.location}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${visit.status === 'confirmed' ? 'bg-ethiopian-green/20 text-green-400 border border-ethiopian-green/30' :
              visit.status === 'pending' ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30' : 'bg-ethiopian-red/20 text-red-400 border border-ethiopian-red/30'
            }`}>
            {visit.status}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-[#4B5563] dark:text-[#A8B5AE] mb-5 p-3 rounded-xl bg-[#F0EDE6]/30 dark:bg-[#1C2420]/30 border border-[#E5E0D8]/30 dark:border-[#2A342E]/30">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gold-500" />
            <span className="text-sm">{visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gold-500" />
            <span className="text-sm">{visit.visitDate ? new Date(visit.visitDate).toLocaleTimeString() : 'TBD'}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-400/10 to-gold-500/5 border border-gold-400/30 text-gold-500 font-semibold text-sm hover:from-gold-400/20 hover:to-gold-500/10 transition-all duration-300"
            onClick={() => {
              const pid = visit.propertyId?._id || visit.propertyId;
              if (pid) navigate(`/properties/${pid}`);
            }}
          >
            View Property
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 border border-[#E5E0D8] dark:border-[#2A342E]/40 text-[#4B5563] dark:text-[#A8B5AE] font-semibold text-sm hover:bg-[#F0EDE6] dark:bg-[#1C2420] hover:text-foreground transition-all duration-300" onClick={() => openEditVisit(visit)}>
            Reschedule
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-ethiopian-red/10 border border-ethiopian-red/30 text-red-400 font-semibold text-sm hover:bg-ethiopian-red/20 transition-all duration-300" onClick={() => deleteVisit(visit._id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0B6E4F] dark:border-[#0B6E4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B7280] dark:text-[#A8B5AE]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] relative overflow-hidden transition-colors duration-200">
      {/* Dark mode animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)', filter: 'blur(100px)', animation: 'pulse 4s infinite' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 60%)', filter: 'blur(80px)', animation: 'pulse 4s infinite', animationDelay: '-2s' }} />
      </div>
      
      <div className="flex relative z-10">
        {/* Mobile Drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden fixed top-20 left-4 z-50 w-12 h-12 rounded-xl bg-[#F8F4EC] dark:bg-[#0B0F0D]/95 backdrop-blur-xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-xl flex items-center justify-center hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] transition-all">
              <Menu className="w-5 h-5 text-[#4B5563] dark:text-[#A8B5AE]" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-white dark:bg-[#141A17] border-r border-[#E5E0D8] dark:border-[#2A342E] p-0">
            <div className="p-6 border-b border-[#E5E0D8] dark:border-[#2A342E]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#0B6E4F] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1A1A1A] dark:text-[#F8F4EC]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">Buyer</h2>
                  <p className="text-xs text-[#6B7280] dark:text-[#A8B5AE]">Dashboard</p>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {[
                { id: 'overview', icon: Home, label: 'Overview' },
                { id: 'favorites', icon: Heart, label: 'Favorites' },
                { id: 'visits', icon: Calendar, label: 'Scheduled Visits' },
                { id: 'purchased', icon: ShoppingBag, label: 'Purchased' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-[#0B6E4F] text-[#1A1A1A] dark:text-[#F8F4EC] font-bold shadow-md'
                      : 'text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <div className="pt-4 border-t border-[#E5E0D8] dark:border-[#2A342E] mt-4 space-y-1">
                <button onClick={() => { navigate('/messages'); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC] transition-all">
                  <MessageSquare size={18} />
                  Messages
                </button>
                <button onClick={() => { navigate('/profile'); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC] transition-all">
                  <User size={18} />
                  Profile
                </button>
                <button onClick={() => { setActiveTab('contact'); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC] transition-all">
                  <Mail size={18} />
                  Contact Support
                </button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Dark Glassmorphism Sidebar */}
        <div className="hidden lg:block w-72 bg-white dark:bg-[#141A17] border-r border-[#E5E0D8] dark:border-[#2A342E] min-h-screen sticky top-0 shadow-sm transition-colors duration-200">
          <div className="p-6 border-b border-[#E5E0D8] dark:border-[#2A342E]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0B6E4F] flex items-center justify-center shadow-lg shadow-[#0B6E4F]/20">
                <User className="w-6 h-6 text-[#1A1A1A] dark:text-[#F8F4EC]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">Buyer</h2>
                <p className="text-xs text-[#6B7280] dark:text-[#A8B5AE] uppercase tracking-wider">Dashboard</p>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-[#0B6E4F] via-[#D4A017] to-[#0B6E4F] rounded-full mb-4"></div>
            <p className="text-sm text-[#6B7280] dark:text-[#A8B5AE]">Welcome back, <span className="text-[#0B6E4F] dark:text-[#10B981] font-semibold">{user?.name}</span></p>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', icon: Home, label: 'Overview' },
              { id: 'favorites', icon: Heart, label: 'Favorites' },
              { id: 'visits', icon: Calendar, label: 'Scheduled Visits' },
              { id: 'purchased', icon: ShoppingBag, label: 'Purchased' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-[#0B6E4F] text-[#1A1A1A] dark:text-[#F8F4EC] font-bold shadow-md shadow-lg shadow-[#0B6E4F]/10'
                    : 'text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === item.id ? 'bg-[#0B6E4F] dark:bg-[#0B6E4F]/20' : 'bg-[#F0EDE6] dark:bg-[#1C2420]'
                }`}>
                  <item.icon size={16} />
                </div>
                {item.label}
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0D8A62] dark:bg-[#0D8A62] animate-pulse" />
                )}
              </button>
            ))}
            
            <div className="pt-4 border-t border-[#E5E0D8] dark:border-[#2A342E] mt-4 space-y-2">
              <button
                onClick={() => navigate('/messages')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F0EDE6] dark:bg-[#1C2420] flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                Messages
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F0EDE6] dark:bg-[#1C2420] flex items-center justify-center">
                  <User size={16} />
                </div>
                Profile
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'contact'
                    ? 'bg-[#0B6E4F] text-[#1A1A1A] dark:text-[#F8F4EC] font-bold shadow-md'
                    : 'text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'contact' ? 'bg-white/20 text-[#1A1A1A] dark:text-[#F8F4EC]' : 'text-[#6B7280] dark:text-[#A8B5AE]'
                }`}>
                  <Mail size={16} />
                </div>
                Contact Support
              </button>
              <button
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'help'
                    ? 'bg-[#0B6E4F] text-[#1A1A1A] dark:text-[#F8F4EC] font-bold shadow-md'
                    : 'text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'help' ? 'bg-white/20 text-[#1A1A1A] dark:text-[#F8F4EC]' : 'text-[#6B7280] dark:text-[#A8B5AE]'
                }`}>
                  <MessageSquare size={16} />
                </div>
                Help Center
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'search' && 'Search Properties'}
                  {activeTab === 'favorites' && 'Favorite Properties'}
                  {activeTab === 'visits' && 'Scheduled Visits'}
                  {activeTab === 'purchased' && 'Purchased Properties'}
                  {activeTab === 'contact' && 'Contact Support'}
                  {activeTab === 'help' && 'Help Center'}
                </h1>
                <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#A8B5AE]">
                  {activeTab === 'overview' && 'Track your property search progress and manage your interests'}
                  {activeTab === 'search' && 'Find your perfect property with advanced search filters'}
                  {activeTab === 'favorites' && 'Manage your saved properties and wishlist'}
                  {activeTab === 'visits' && 'View and manage your scheduled property visits'}
                  {activeTab === 'purchased' && 'View your purchased properties'}
                  {activeTab === 'contact' && 'Get in touch with our support team'}
                  {activeTab === 'help' && 'Find answers to common questions'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-xl hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] transition-colors flex items-center gap-2 font-medium text-[#4B5563] dark:text-[#A8B5AE]">
                  <Bell size={18} />
                  <span className="hidden sm:inline">Notifications</span>
                </button>
                <button
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#0B6E4F] to-[#D4A017] text-[#1A1A1A] dark:text-[#F8F4EC] rounded-xl hover:from-[#0B6E4F] hover:to-[#D4A017] transition-all flex items-center gap-2 font-medium shadow-lg shadow-[#0B6E4F]/20"
                  onClick={() => navigate('/properties')}
                >
                  <Search size={18} />
                  <span className="hidden sm:inline">Browse Properties</span>
                </button>
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                <div
                  onClick={() => setActiveTab('favorites')}
                  className="bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm p-5 cursor-pointer hover:border-[#0B6E4F] hover:shadow-[#0B6E4F]/10 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-1">{stats.favoriteProperties}</div>
                  <div className="text-xs font-medium text-[#6B7280] dark:text-[#A8B5AE] uppercase tracking-wide">Favorite Properties</div>
                </div>
                <div
                  onClick={() => setActiveTab('visits')}
                  className="bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm p-5 cursor-pointer hover:border-[#0B6E4F] hover:shadow-[#0B6E4F]/10 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0B6E4F] dark:bg-[#0B6E4F]/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-[#0B6E4F] dark:text-[#0D8A62]" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-1">{stats.scheduledVisits}</div>
                  <div className="text-xs font-medium text-[#6B7280] dark:text-[#A8B5AE] uppercase tracking-wide">Scheduled Visits</div>
                </div>
                <div className="bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm p-5 hover:border-[#0B6E4F] hover:shadow-[#0B6E4F]/10 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-1">{stats.viewedProperties}</div>
                  <div className="text-xs font-medium text-[#6B7280] dark:text-[#A8B5AE] uppercase tracking-wide">Properties Viewed</div>
                </div>
                <div
                  onClick={() => setActiveTab('search')}
                  className="bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm p-5 cursor-pointer hover:border-[#0B6E4F] hover:shadow-[#0B6E4F]/10 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0B6E4F] dark:bg-[#0B6E4F]/20 flex items-center justify-center">
                      <Bookmark className="h-6 w-6 text-[#0B6E4F] dark:text-[#10B981]" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-1">{stats.savedSearches}</div>
                  <div className="text-xs font-medium text-[#6B7280] dark:text-[#A8B5AE] uppercase tracking-wide">Saved Searches</div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recently Viewed */}
                <div className="bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">Recently Viewed</h3>
                    <button className="text-sm font-medium text-[#0B6E4F] dark:text-[#10B981] hover:text-[#0B6E4F] dark:text-[#10B981] transition-colors">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentlyViewed.slice(0, 3).map((property) => (
                      <div
                        key={property._id}
                        className="flex items-center gap-4 p-3 hover:bg-[#F0EDE6]/70 dark:hover:bg-[#1C2420]/70 rounded-xl transition cursor-pointer border border-transparent hover:border-[#0B6E4F]/50"
                        onClick={() => navigate(`/properties/${property._id}`)}
                      >
                        <img
                          src={property.imagesUrl?.[0] || property.images?.[0] || '/hero-bg-1.jpg'}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-1 truncate">{property.title}</h4>
                          <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE] mb-1">
                            <MapPin size={12} />
                            <span className="text-xs truncate">{property.location}</span>
                          </div>
                          <p className="font-semibold text-[#0B6E4F] dark:text-[#10B981] text-sm">
                            {formatCurrency(property.price)}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-[#4B5563] dark:text-[#6B7A73] flex-shrink-0" />
                      </div>
                    ))}
                    {recentlyViewed.length === 0 && (
                      <div className="text-center py-8 text-[#4B5563] dark:text-[#6B7A73]">
                        <Eye size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recently viewed properties</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Properties */}
                <div className="bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">Recommended for You</h3>
                    <button className="text-sm font-medium text-[#0B6E4F] dark:text-[#10B981] hover:text-[#0B6E4F] dark:text-[#10B981] transition-colors">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recommendedProperties.slice(0, 3).map((property) => (
                      <div
                        key={property._id}
                        className="flex items-center gap-4 p-3 hover:bg-[#F0EDE6]/70 dark:hover:bg-[#1C2420]/70 rounded-xl transition cursor-pointer border border-transparent hover:border-[#0B6E4F]/50"
                        onClick={() => navigate(`/properties/${property._id}`)}
                      >
                        <img
                          src={property.imagesUrl?.[0] || property.images?.[0] || '/hero-bg-1.jpg'}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-1 truncate">{property.title}</h4>
                          <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#A8B5AE] mb-1">
                            <MapPin size={12} />
                            <span className="text-xs truncate">{property.location}</span>
                          </div>
                          <p className="font-semibold text-[#0B6E4F] dark:text-[#10B981] text-sm">
                            {formatCurrency(property.price)}
                          </p>
                        </div>
                        <button
                          className="p-2 hover:bg-[#E5E0D8] dark:hover:bg-[#2A342E] rounded-lg transition-colors flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(property._id);
                          }}
                        >
                          <Heart size={16} className="text-[#0B6E4F] dark:text-[#10B981]" />
                        </button>
                      </div>
                    ))}
                    {recommendedProperties.length === 0 && (
                      <div className="text-center py-8 text-[#4B5563] dark:text-[#6B7A73]">
                        <Star size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recommendations yet</p>
                      </div>
                    )}
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
                  <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">Search Filters</h3>
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
                        onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Property Type</label>
                      <select
                        className="form-input"
                        value={searchFilters.propertyType}
                        onChange={(e) => setSearchFilters({ ...searchFilters, propertyType: e.target.value })}
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
                        onChange={(e) => setSearchFilters({ ...searchFilters, bedrooms: e.target.value })}
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
                        onChange={(e) => setSearchFilters({ ...searchFilters, bathrooms: e.target.value })}
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
                    <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">Search Results</h3>
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
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5' : 'space-y-4'}>
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
                    <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">
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
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5' : 'space-y-4'}>
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
                      <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">No favorites yet</h3>
                      <p className="text-[#4B5563] dark:text-[#A8B5AE] mb-4">Start browsing properties and add them to your favorites</p>
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
                    <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">
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
                    <div className="mb-6 p-4 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg">
                      <h4 className="font-semibold mb-3">{isEditingVisit ? 'Edit Visit' : 'New Visit'}</h4>
                      <form onSubmit={submitVisitForm} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">Property</label>
                          <select
                            className="form-input"
                            value={visitForm.propertyId}
                            onChange={(e) => setVisitForm({ ...visitForm, propertyId: e.target.value })}
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
                          <label className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">Visit Date & Time</label>
                          <input type="datetime-local" className="form-input" value={visitForm.visitDate} onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })} required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">Message (optional)</label>
                          <textarea className="form-input" value={visitForm.message} onChange={(e) => setVisitForm({ ...visitForm, message: e.target.value })} rows="3" />
                        </div>
                        <div className="flex gap-2 md:col-span-2">
                          <button type="submit" className="btn btn-secondary">{isEditingVisit ? 'Update' : 'Create'}</button>
                          <button type="button" className="btn btn-secondary" onClick={() => setShowVisitForm(false)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}
                  {scheduledVisits.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {scheduledVisits.map((visit) => (
                        <VisitCard key={visit._id} visit={visit} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar size={48} className="text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">No visits scheduled</h3>
                      <p className="text-[#4B5563] dark:text-[#A8B5AE] mb-4">Schedule visits to properties you're interested in</p>
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
                        <ShoppingBag size={24} className="text-[#1A1A1A] dark:text-[#F8F4EC]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">
                          Your Purchased Properties
                        </h3>
                        <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {purchasedProperties.map((purchase) => (
                        <div
                          key={purchase._id}
                          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-[#E5E0D8] dark:border-[#2A342E] hover:border-primary-300 transform hover:-translate-y-2"
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
                              <h4 className="font-bold text-lg text-[#1A1A1A] dark:text-[#F8F4EC] mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
                                {purchase.property?.title || 'Property Title'}
                              </h4>
                              <p className="text-[#4B5563] dark:text-[#A8B5AE] flex items-center text-sm">
                                <MapPin size={16} className="mr-2 text-primary-500" />
                                {purchase.property?.location || 'Location'}
                              </p>
                            </div>

                            {/* Property Stats */}
                            <div className="grid grid-cols-2 gap-4 py-3 bg-[#F8F4EC] dark:bg-[#141A17] rounded-xl">
                              <div className="flex items-center justify-center">
                                <div className="text-center">
                                  <div className="flex items-center justify-center mb-1">
                                    <Home size={16} className="text-primary-500 mr-1" />
                                    <span className="font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">
                                      {purchase.property?.features?.bedrooms || 0}
                                    </span>
                                  </div>
                                  <span className="text-xs text-[#4B5563] dark:text-[#A8B5AE]">Bedrooms</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="text-center">
                                  <div className="flex items-center justify-center mb-1">
                                    <Bath size={16} className="text-primary-500 mr-1" />
                                    <span className="font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">
                                      {purchase.property?.features?.bathrooms || 0}
                                    </span>
                                  </div>
                                  <span className="text-xs text-[#4B5563] dark:text-[#A8B5AE]">Bathrooms</span>
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
                                className="flex-1 btn btn-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-[#1A1A1A] dark:text-[#F8F4EC] font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                                onClick={() => navigate(`/properties/${purchase.property?._id}`)}
                              >
                                <Eye size={16} className="mr-2" />
                                View Details
                              </button>
                              <button
                                className="flex-1 btn btn-sm bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-[#1A1A1A] dark:text-[#F8F4EC] font-semibold py-3 px-4 rounded-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
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
                        <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-3">
                          Start Building Your Property Portfolio
                        </h3>
                        <p className="text-[#4B5563] dark:text-[#A8B5AE] mb-6 leading-relaxed">
                          You haven't purchased any properties yet. Browse our amazing selection of properties and find your perfect investment opportunity.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <button
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-400 to-gold-500 text-[#1A1A1A] dark:text-[#F8F4EC] hover:from-gold-300 hover:to-gold-400 transform hover:scale-105 transition-all duration-300 px-8 py-3 rounded-xl font-semibold shadow-lg shadow-gold-400/30 w-auto"
                            onClick={() => navigate('/properties')}
                          >
                            <Search size={16} />
                            Browse Properties
                          </button>
                          <button
                            className="inline-flex items-center gap-2 border-2 border-gold-400/50 text-gold-500 hover:bg-gold-400/10 hover:border-gold-400 transform hover:scale-105 transition-all duration-300 px-8 py-3 rounded-xl font-semibold w-auto"
                            onClick={() => navigate('/favorites')}
                          >
                            <Heart size={16} />
                            View Favorites
                          </button>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 p-4 bg-[#F8F4EC] dark:bg-[#141A17] rounded-xl border border-[#E5E0D8] dark:border-[#2A342E]">
                          <p className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">
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
            <div className="bg-card rounded-xl border shadow-lg p-6">
              <UserContactForm />
            </div>
          )}

          {/* Help Center Tab */}
          {activeTab === 'help' && (
            <div className="bg-card rounded-xl border shadow-lg p-6">
              <FAQViewer userRole="buyer" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;

