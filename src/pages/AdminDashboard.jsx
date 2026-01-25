import { 
  Users, 
  Building, 
  MessageSquare, 
  Calendar, 
  Shield, 
  TrendingUp,
  TrendingDown,
  Eye,
  UserPlus,
  Home,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  MapPin,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  MoreVertical,
  Mail,
  Bath,
  Maximize,
  Edit,
  Phone
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ContactManagement from '../components/ContactManagement';
import MessageManagement from '../components/MessageManagement';
import NotificationCenter from '../components/NotificationCenter';
import ReviewManagement from '../components/ReviewManagement';
import SubscriptionManagement from '../components/SubscriptionManagement';
import FAQManagement from '../components/FAQManagement';
import DepartmentManagement from '../components/DepartmentManagement';
import { 
  RevenueChart, 
  PropertyDistributionChart, 
  UserGrowthChart, 
  PropertyViewsChart,
  SoldPropertiesChart 
} from '../components/admin/AdminCharts';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { messageService } from '../services/messageService';
import { propertyService } from '../services/propertyService';
import { sellingService } from '../services/sellingService';
import { userService } from '../services/userService';
import { SERVER_BASE_URL } from '../config/api';

import { Menu, X } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    totalChapaCharge: 0,
    activeListings: 0,
    completedSales: 0,
    averagePrice: 0,
    newUsersThisMonth: 0,
    messagesCount: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [soldProperties, setSoldProperties] = useState([]);


  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    if (!isAdmin || !user) {
      navigate('/unauthorized');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, user, authLoading, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data in parallel
      const [usersResponse, propertiesResponse, sellingResponse, messagesResponse] = await Promise.all([
        userService.getUsers(),
        propertyService.getProperties({isVerified: true, sold: false}),
        sellingService.stats(),
        messageService.getMessageStats()
      ]);
      /* console.log('usersResponse:', usersResponse);
      console.log('propertiesResponse:', propertiesResponse);
      console.log('sellingResponse:', sellingResponse);
      console.log('messagesResponse:', messagesResponse); */
        const result = await propertyService.getProperties({ 
          isVerified: true, 
          sold: true, 
          limit: 50 
        });
        
        if (result.success) {
          const properties = result.data?.data?.data || [];
          setSoldProperties(properties);
        } else {
          console.error('Failed to fetch sold properties:', result.error);
          setSoldProperties([]);
        }
     

      // Process users data
      if (usersResponse.success) {
        //console.log(usersResponse.data);
        const users = usersResponse.data.data.data;
        const currentMonth = new Date().getMonth();
        const newUsersThisMonth = users.filter(user => 
          new Date(user.createdAt).getMonth() === currentMonth
        ).length;
        
        setRecentUsers(users.slice(0, 5));
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          newUsersThisMonth
        }));
      }

      // Process properties data
      if (propertiesResponse.success) {
        const properties = propertiesResponse.data.data.data;
        const activeListings = properties.filter(p => p.status === 'active').length;
        const pendingApprovals = properties.filter(p => p.status === 'pending').length;
        
        setRecentProperties(properties.slice(0, 5));
        setStats(prev => ({
          ...prev,
          totalProperties: properties.length,
          activeListings,
          pendingApprovals
        }));
      }

      // Process selling data
      if (sellingResponse.success) {
        const sellingData = sellingResponse.data.data.stats ;
        //console.log('sellingData:', sellingData);
        setStats(prev => ({
          ...prev,
          totalRevenue: sellingData.totalAmount || 0,
          completedSales: sellingData.totalSales || 0,
          averagePrice: sellingData.avgAmount || 0,
          totalChapaCharge: sellingData.totalChapaCharge || 0
        }));
      }

      // Process messages data
      if (messagesResponse.success) {
        const messagesData = messagesResponse.data || {};
        setStats(prev => ({
          ...prev,
          messagesCount: messagesData.totalMessages || 0
        }));
      }

      // Generate recent activities
      setRecentActivities([
        { id: 1, type: 'user', message: 'New user registered', time: '2 minutes ago', icon: UserPlus },
        { id: 2, type: 'property', message: 'Property approved', time: '5 minutes ago', icon: Building },
        { id: 3, type: 'sale', message: 'Sale completed', time: '10 minutes ago', icon: DollarSign },
        { id: 4, type: 'message', message: 'New message received', time: '15 minutes ago', icon: MessageSquare },
        { id: 5, type: 'review', message: 'New review posted', time: '20 minutes ago', icon: Star }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

   // Fetch sold properties data
   const fetchSoldPropertiesData = async () => {
    
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Animated counter hook for premium stat cards
  const AnimatedCounter = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value;
    
    useEffect(() => {
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(numericValue * easeOutQuart));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [numericValue, duration]);
    
    return count.toLocaleString();
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary', onClick }) => (
    <div 
      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 lg:hover:-translate-y-3"
      onClick={onClick}
    >
      {/* Glassmorphism card - responsive padding */}
      <div className="relative h-full rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-2xl hover:border-gold-400/40 transition-all duration-500">
        
        {/* Animated glow background - hidden on mobile for perf */}
        <div className="hidden sm:block absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-400/0 via-gold-400/5 to-ethiopian-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Floating orb decoration - hidden on mobile */}
        <div className="hidden lg:block absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-gold-400/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10">
          {/* Header with icon - responsive sizes */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
            <h3 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.1em] sm:tracking-[0.15em] font-sans">{title}</h3>
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-gold-400/30 via-gold-500/20 to-gold-600/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-gold-400/20">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gold-500 group-hover:text-gold-400 transition-colors duration-300" />
              </div>
            </div>
          </div>
          
          {/* Animated value - responsive font size */}
          <div className="mb-2 sm:mb-3 lg:mb-4">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 bg-clip-text text-transparent bg-[length:200%_100%] group-hover:animate-shimmer-fast">
              {typeof value === 'string' && value.includes('ETB') ? (
                <span className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl lg:text-2xl font-sans font-medium text-gold-500/80">ETB</span>
                  <AnimatedCounter value={value} />
                </span>
              ) : (
                <AnimatedCounter value={value} />
              )}
            </p>
          </div>
          
          {/* Change indicator - responsive sizing */}
          {change !== undefined && (
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm ${
              change >= 0 
                ? 'bg-ethiopian-green/20 text-green-400 border border-ethiopian-green/30' 
                : 'bg-ethiopian-red/20 text-red-400 border border-ethiopian-red/30'
            }`}>
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${change >= 0 ? 'bg-ethiopian-green/30' : 'bg-ethiopian-red/30'}`}>
                {change >= 0 ? <TrendingUp size={10} className="sm:w-3 sm:h-3" /> : <TrendingDown size={10} className="sm:w-3 sm:h-3" />}
              </div>
              <span className="hidden xs:inline">{Math.abs(change)}% from last month</span>
              <span className="xs:hidden">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gold-400/10 hover:to-transparent cursor-pointer transition-all duration-300 border border-transparent hover:border-gold-400/20">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400/30 to-gold-500/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-gold-400/20 transition-all duration-300">
          <Icon size={22} className="text-gold-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground group-hover:text-gold-400 transition-colors truncate">{activity.message}</p>
          <p className="text-sm text-muted-foreground">{activity.time}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-gold-400/20 transition-all duration-300">
          <ChevronRight size={16} className="text-muted-foreground group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    );
  };

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'primary' }) => (
    <div 
      className="group relative p-4 rounded-xl cursor-pointer bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/40 hover:border-gold-400/40 hover:shadow-xl hover:shadow-gold-400/10 transition-all duration-500 overflow-hidden"
      onClick={onClick}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-400/0 via-gold-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400/20 via-gold-500/15 to-gold-600/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-gold-400/10">
          <Icon size={26} className="text-gold-500 group-hover:text-gold-400 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground group-hover:text-gold-400 transition-colors font-serif tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center group-hover:bg-gold-400/20 group-hover:translate-x-1 transition-all duration-300">
          <ChevronRight size={20} className="text-muted-foreground group-hover:text-gold-400 transition-colors" />
        </div>
      </div>
    </div>
  );

  // Import PremiumLoader for loading state
  const PremiumLoader = React.lazy(() => import('../components/PremiumLoader'));
  
  if (loading) {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <PremiumLoader message="Loading Dashboard..." />
      </React.Suspense>
    );
  }

  return (
    <div className="admin-dashboard-premium min-h-screen min-h-[100dvh] bg-gradient-to-br from-background via-background to-muted/10 relative overflow-x-hidden">
      {/* Premium animated background - hidden on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-0 right-0 w-[600px] lg:w-[900px] h-[600px] lg:h-[900px] rounded-full opacity-20 animate-pulse-slow"
             style={{ background: 'radial-gradient(circle, hsl(48 96% 53% / 0.15) 0%, transparent 60%)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] lg:w-[700px] h-[400px] lg:h-[700px] rounded-full opacity-20 animate-pulse-slow"
             style={{ background: 'radial-gradient(circle, hsl(145 63% 32% / 0.15) 0%, transparent 60%)', filter: 'blur(100px)', animationDelay: '-5s' }} />
      </div>
      
      {/* Mobile sidebar toggle button - FLOATING above all content */}
      <button
        className="lg:hidden fixed top-20 left-4 z-[60] w-12 h-12 rounded-xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-xl flex items-center justify-center hover:bg-card hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-[0_0_20px_hsl(var(--gold-400)/0.3)]"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} className="text-gold-400" /> : <Menu size={20} className="text-foreground" />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex relative z-10 min-h-screen min-h-[100dvh]">
        {/* Premium Glassmorphism Sidebar - Hidden completely on mobile, only shows as overlay */}
        <aside className={`admin-sidebar fixed lg:relative top-0 left-0 z-[56] lg:z-auto flex flex-col w-[85vw] max-w-[300px] lg:w-72 xl:w-80 bg-card/98 lg:bg-card/80 backdrop-blur-2xl border-r border-border/30 min-h-screen h-[100dvh] p-4 sm:p-5 lg:p-6 shadow-2xl lg:shadow-none overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          {/* Sidebar gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 via-transparent to-ethiopian-green/5 pointer-events-none" />
          
          {/* Sidebar header */}
          <div className="relative z-10 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-400/30">
                <Shield className="w-6 h-6 text-background" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-gradient-gold">Admin</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Control Panel</p>
              </div>
            </div>
            <div className="ethiopian-accent-bar w-full mb-6"></div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent border border-border/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ethiopian-green to-ethiopian-green/70 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>

          {/* Premium Navigation */}
          <nav className="relative z-10 flex-1 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3">Navigation</p>
            
            {[
              { id: 'overview', icon: BarChart3, label: 'Overview', onClick: () => setActiveTab('overview') },
              { id: 'users', icon: Users, label: 'Users', onClick: () => navigate('/admin/users') },
              { id: 'properties', icon: Building, label: 'Properties', onClick: () => navigate('/admin/properties') },
              { id: 'messages', icon: MessageSquare, label: 'Messages', onClick: () => navigate('/admin/messages') },
              { id: 'selling', icon: TrendingUp, label: 'All Sales', onClick: () => setActiveTab('selling') },
              { id: 'reviews', icon: Star, label: 'Reviews', onClick: () => setActiveTab('reviews') },
              { id: 'activity', icon: Activity, label: 'Activity', onClick: () => navigate('/admin/activity') },
            ].map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`admin-nav-item group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-gold-400/20 to-gold-400/5 text-gold-400 border border-gold-400/30 shadow-lg shadow-gold-400/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-gold-400/20' 
                    : 'bg-muted/50 group-hover:bg-muted'
                }`}>
                  <item.icon size={18} className={activeTab === item.id ? 'text-gold-400' : ''} />
                </div>
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                )}
              </button>
            ))}
            
            <div className="pt-4 mt-4 border-t border-border/30">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3">Management</p>
              
              {[
                { id: 'subscriptions', icon: Bell, label: 'Subscriptions', onClick: () => setActiveTab('subscriptions') },
                { id: 'contacts', icon: Mail, label: 'Contact Forms', onClick: () => setActiveTab('contacts') },
                { id: 'faqs', icon: MessageSquare, label: 'FAQ Management', onClick: () => setActiveTab('faqs') },
                { id: 'departments', icon: Building, label: 'Departments', onClick: () => setActiveTab('departments') },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`admin-nav-item group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-gradient-to-r from-gold-400/20 to-gold-400/5 text-gold-400 border border-gold-400/30 shadow-lg shadow-gold-400/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-gold-400/20' 
                      : 'bg-muted/50 group-hover:bg-muted'
                  }`}>
                    <item.icon size={18} className={activeTab === item.id ? 'text-gold-400' : ''} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </nav>
          
          {/* Sidebar footer */}
          <div className="relative z-10 pt-6 border-t border-border/30 mt-auto">
            <button 
              onClick={() => navigate('/admin/settings')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
            >
              <Settings size={18} />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </aside>
        {/* Main Content - Takes full width on mobile, no left margin */}
        <div className="dashboard-main flex-1 min-w-0 w-full lg:w-auto p-4 sm:p-5 lg:p-6 xl:p-8 pt-20 lg:pt-6">
        {activeTab === 'overview' && (
          <>
            {/* Header - Mobile Responsive */}
            <div className="dashboard-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="text-center sm:text-left">
                <h1 className="dashboard-title text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">Monitor your platform's performance and manage operations</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button className="btn btn-secondary flex items-center justify-center gap-2 px-3 py-2 text-sm" onClick={fetchDashboardData}>
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
                <button className="btn btn-secondary flex items-center justify-center gap-2 px-3 py-2 text-sm" onClick={() => navigate('/properties/new')}>
                  <Plus size={14} />
                  <span>Create Property</span>
                </button>
              </div>
            </div>

            {/* Stats Grid - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6">
              <StatCard
                title="Total Users"
                value={formatNumber(stats.totalUsers)}
                change={12}
                icon={Users}
                color="primary"
                onClick={() => navigate('/admin/users')}
              />
              <StatCard
                title="Total Properties"
                value={formatNumber(stats.totalProperties)}
                change={8}
                icon={Building}
                color="success"
                onClick={() => navigate('/admin/properties')}
              />
              <StatCard
                title="Pending Approvals"
                value={formatNumber(stats.pendingApprovals)}
                change={-5}
                icon={Calendar}
                color="warning"
                onClick={() => navigate('/admin/properties')}
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                change={15}
                icon={DollarSign}
                color="success"
              />
              <StatCard
                title="Active Listings"
                value={formatNumber(stats.activeListings)}
                change={3}
                icon={Eye}
                color="primary"
              />
              <StatCard
                title="Messages"
                value={formatNumber(stats.messagesCount)}
                change={7}
                icon={MessageSquare}
                color="primary"
                onClick={() => navigate('/admin/messages')}
              />
            </div>

            {/* Analytics Charts Section */}
            {/* Analytics Charts Section - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
              <div className="min-h-[250px] sm:min-h-[300px]">
                <RevenueChart />
              </div>
              <div className="min-h-[250px] sm:min-h-[300px]">
                <PropertyDistributionChart />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
              <div className="min-h-[250px] sm:min-h-[300px]">
                <UserGrowthChart />
              </div>
              <div className="min-h-[250px] sm:min-h-[300px]">
                <PropertyViewsChart />
              </div>
            </div>

            {/* Message Management Section */}
            <div className="card mb-8">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Message Management</h3>
                  <div className="flex items-center gap-4">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => navigate('/admin/messages')}
                    >
                      View All Messages
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <MessageManagement userRole="admin" showStats={true} showActions={true} />
              </div>
            </div>


            {/* Content Grid - Stack on mobile */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                    <button className="btn btn-sm btn-secondary">
                      View All
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  {recentActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <QuickActionCard
                      title="Manage Users"
                      description="Add, edit, or remove user accounts"
                      icon={Users}
                      onClick={() => navigate('/admin/users')}
                      color="primary"
                    />
                    <QuickActionCard
                      title="Property Approvals"
                      description="Review and approve pending properties"
                      icon={Building}
                      onClick={() => navigate('/admin/properties')}
                      color="warning"
                    />
                    <QuickActionCard
                      title="System Messages"
                      description="Send announcements to users"
                      icon={MessageSquare}
                      onClick={() => navigate('/admin/messages')}
                      color="success"
                    />
                    <QuickActionCard
                      title="Contact Forms"
                      description="View and answer contact submissions"
                      icon={Mail}
                      onClick={() => setActiveTab('contacts')}
                      color="primary"
                    />
                    <QuickActionCard
                      title="Role Management"
                      description="Configure user roles and permissions"
                      icon={Shield}
                      onClick={() => navigate('/admin/roles')}
                      color="error"
                    />
                    <QuickActionCard
                      title="Subscription Management"
                      description="Manage subscription plans and user subscriptions"
                      icon={Bell}
                      onClick={() => setActiveTab('subscriptions')}
                      color="success"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Users and Properties */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-6 lg:mt-8">
              {/* Recent Users */}
              <div className="bg-card rounded-xl sm:rounded-2xl border border-border/50 overflow-hidden shadow-lg">
                <div className="p-4 sm:p-6 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Users</h3>
                    <button 
                      className="btn btn-sm btn-secondary text-xs sm:text-sm"
                      onClick={() => navigate('/admin/users')}
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/20">
                      <tr>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-muted-foreground">User</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-muted-foreground">Role</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-muted-foreground">Status</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-muted-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user._id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-medium text-primary">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-xs sm:text-sm">{user.name}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">
                            <span className="inline-flex px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full bg-accent/20 text-accent">{user.role}</span>
                          </td>
                          <td className="p-3 sm:p-4">
                            <span className={`inline-flex px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full ${user.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 text-[10px] sm:text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Properties */}
              <div className="bg-card rounded-xl sm:rounded-2xl border border-border/50 overflow-hidden shadow-lg">
                <div className="p-4 sm:p-6 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Properties</h3>
                    <button 
                      className="btn btn-sm btn-secondary text-xs sm:text-sm"
                      onClick={() => navigate('/admin/properties')}
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/20">
                      <tr>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-muted-foreground">Property</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-muted-foreground">Type</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-muted-foreground">Price</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProperties.map((property) => (
                        <tr key={property._id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                {property.images?.[0] ? (
                                  <img 
                                    src={property.images[0]} 
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Home size={14} className="text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground text-xs sm:text-sm truncate">{property.title}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{property.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">
                            <span className="inline-flex px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full bg-accent/20 text-accent">{property.type}</span>
                          </td>
                          <td className="p-3 sm:p-4 font-medium text-foreground text-xs sm:text-sm">
                            {formatCurrency(property.price)}
                          </td>
                          <td className="p-3 sm:p-4">
                            <span className={`inline-flex px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full ${
                              property.status === 'active' ? 'bg-green-500/20 text-green-500' :
                              property.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                              {property.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

      {activeTab === 'selling' && (
          <div className="space-y-8">
            {/* Modern Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <TrendingUp size={24} className="text-white" />
                      </div>
                <div>
                        <h1 className="text-3xl lg:text-4xl font-bold">All Selling Properties</h1>
                        <p className="text-blue-100 text-lg">Comprehensive analytics and management of sold properties</p>
                </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Live Data</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                        <Building size={16} />
                        <span>{soldProperties.length} Properties Sold</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="btn btn-outline bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white hover:text-white transition-all duration-300">
                      <Filter size={18} className="mr-2" />
                      Filter & Search
                    </button>
                    <button className="btn btn-outline bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white hover:text-white transition-all duration-300">
                      <Download size={18} className="mr-2" />
                      Export Data
                    </button>
                  <button 
                    onClick={fetchSoldPropertiesData}
                      className="btn btn-primary bg-white text-blue-900 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                  >
                      <RefreshCw size={18} className="mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Sold Properties */}
              <div className="group bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border hover:border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm font-medium">Total Sold</p>
                    <p className="text-3xl font-bold text-foreground">{soldProperties.length}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{width: `${Math.min((soldProperties.length / 50) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Properties sold this year</p>
              </div>

              {/* Total Revenue */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <DollarSign size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground">
                      {formatCurrency(soldProperties.reduce((sum, property) => sum + (property.price || 0), 0))}
                    </p>
                  </div>
                  </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000" 
                    style={{width: `${Math.min((soldProperties.reduce((sum, property) => sum + (property.price || 0), 0) / 10000000) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Revenue generated from sales</p>
              </div>

              {/* Average Sale Price */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">Avg Sale Price</p>
                    <p className="text-3xl font-bold text-foreground">
                      {soldProperties.length > 0 ? formatCurrency(Math.round(soldProperties.reduce((sum, property) => sum + (property.price || 0), 0) / soldProperties.length)) : formatCurrency(0)}
                    </p>
                  </div>
                  </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000" 
                    style={{
                      width: `${Math.min(
                        soldProperties.length > 0 
                          ? (soldProperties.reduce((sum, property) => sum + (property.price || 0), 0) / soldProperties.length) / 1000000 * 100
                          : 0, 
                        100
                      )}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Average property value</p>
              </div>

              {/* This Month Sales */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">This Month</p>
                    <p className="text-3xl font-bold text-foreground">{(() => {
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        return soldProperties.filter(property => {
                          const propertyDate = new Date(property.updatedAt || property.createdAt);
                          return propertyDate.getMonth() === currentMonth && 
                                 propertyDate.getFullYear() === currentYear;
                        }).length;
                    })()}</p>
                  </div>
                  </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000" 
                    style={{
                      width: `${(() => {
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        const thisMonthCount = soldProperties.filter(property => {
                          const propertyDate = new Date(property.updatedAt || property.createdAt);
                          return propertyDate.getMonth() === currentMonth && 
                                 propertyDate.getFullYear() === currentYear;
                        }).length;
                        return Math.min(thisMonthCount / 20 * 100, 100);
                      })()}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Sales this month</p>
              </div>
            </div>

            {/* Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Type Distribution */}
              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center">
                    <PieChart size={24} className="mr-3 text-blue-600" />
                    Property Types
                  </h3>
                    <div className="text-sm text-muted-foreground">
                    {soldProperties.length} total properties
                  </div>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const typeCounts = {};
                    soldProperties.forEach(property => {
                      const type = property.propertyType || property.type || 'Other';
                      typeCounts[type] = (typeCounts[type] || 0) + 1;
                    });
                    
                    const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
                    const colors = [
                      { bg: 'bg-blue-500', text: 'text-blue-600' },
                      { bg: 'bg-green-500', text: 'text-green-600' },
                      { bg: 'bg-purple-500', text: 'text-purple-600' },
                      { bg: 'bg-orange-500', text: 'text-orange-600' },
                      { bg: 'bg-red-500', text: 'text-red-600' }
                    ];
                    
                    return Object.entries(typeCounts).map(([type, count], index) => {
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      const color = colors[index % colors.length];
                      
                      return (
                        <div key={type} className="group p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${color.bg} mr-3`}></div>
                              <span className="font-semibold text-foreground">{type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{count}</span>
                              <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${color.bg} transition-all duration-1000 group-hover:shadow-sm`}
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Price Range Analysis */}
              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center">
                    <BarChart3 size={24} className="mr-3 text-green-600" />
                    Price Ranges
                  </h3>
                    <div className="text-sm text-muted-foreground">
                    Distribution by value
                  </div>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const priceRanges = [
                      { label: 'Under 1M ETB', min: 0, max: 1000000, color: { bg: 'bg-green-500', text: 'text-green-600' } },
                      { label: '1M - 5M ETB', min: 1000000, max: 5000000, color: { bg: 'bg-blue-500', text: 'text-blue-600' } },
                      { label: '5M - 10M ETB', min: 5000000, max: 10000000, color: { bg: 'bg-purple-500', text: 'text-purple-600' } },
                      { label: 'Over 10M ETB', min: 10000000, max: Infinity, color: { bg: 'bg-orange-500', text: 'text-orange-600' } }
                    ];
                    
                    const rangeCounts = [];
                    priceRanges.forEach(range => {
                      const count = soldProperties.filter(property => 
                        (property.price || 0) >= range.min && (property.price || 0) < range.max
                      ).length;
                      rangeCounts.push({ ...range, count });
                    });
                    
                    const maxCount = Math.max(...rangeCounts.map(r => r.count));
                    
                    return rangeCounts.map((range, index) => (
                      <div key={range.label} className="group p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">{range.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">{range.count}</span>
                            <span className="text-xs text-muted-foreground">properties</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${range.color.bg} transition-all duration-1000 group-hover:shadow-sm`}
                            style={{width: `${maxCount > 0 ? (range.count / maxCount) * 100 : 0}%`}}
                          ></div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Properties Grid Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Building size={20} className="text-white" />
                    </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Sold Properties</h3>
                    <p className="text-sm text-muted-foreground">Complete list of all sold properties</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {soldProperties.length} Properties
                  </div>
                  <button className="btn btn-outline btn-sm">
                    <Search size={16} className="mr-2" />
                    Search
                  </button>
                </div>
              </div>

              {soldProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {soldProperties.map((property, index) => (
                    <div 
                      key={property._id} 
                      className="group bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-border hover:border-blue-300 overflow-hidden"
                    >
                        {/* Property Image */}
                      <div className="relative h-48 overflow-hidden">
                          {property.images?.[0] ? (
                            <img 
                              src={`${SERVER_BASE_URL}${property.images[0]}`}
                              alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <Building size={48} className="text-gray-400" />
                            </div>
                          )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                            Sold
                          </span>
                        </div>
                        
                        {/* Price Badge */}
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-black/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg">
                            {formatCurrency(property.price || 0)}
                          </span>
                        </div>
                        </div>

                        {/* Property Details */}
                      <div className="p-4">
                        {/* Title and Location */}
                        <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                                {property.title || 'Property Title'}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 flex items-center">
                          <MapPin size={14} className="mr-1 text-blue-500" />
                                {property.location || 'Location not specified'}
                              </p>
                              
                              {/* Property Features */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            <Home size={12} className="mr-1 text-blue-500" />
                            <span>{property.features?.bedrooms || 0} beds</span>
                                </div>
                          <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            <Bath size={12} className="mr-1 text-green-500" />
                            <span>{property.features?.bathrooms || 0} baths</span>
                                </div>
                                {property.features?.area && (
                            <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded col-span-2">
                              <Maximize size={12} className="mr-1 text-purple-500" />
                              <span>{property.features.area} m²</span>
                                  </div>
                                )}
                              </div>

                        {/* Property Type */}
                        <div className="mb-3">
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                            {property.propertyType || property.type || 'Property'}
                          </span>
                                </div>

                        {/* Owner Info */}
                        <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Users size={12} className="mr-1 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">Owner</span>
                                </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {property.owner?.name || 'Owner Name'}
                          </p>
                            </div>

                        {/* Date Sold */}
                        <div className="mb-3 flex items-center text-xs text-muted-foreground">
                          <Calendar size={12} className="mr-1" />
                          <span>Sold: {property.updatedAt ? new Date(property.updatedAt).toLocaleDateString() : 'N/A'}</span>
                              </div>

                        {/* View Button */}
                                <button 
                                  onClick={() => navigate(`/property/${property._id}`)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        >
                          <Eye size={16} className="mr-2" />
                          View Details
                                </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-muted/50 rounded-xl p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Sold Properties</h3>
                  <p className="text-muted-foreground mb-6">There are currently no sold properties to display.</p>
                  <button 
                    onClick={fetchSoldPropertiesData}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center mx-auto"
                  >
                      <RefreshCw size={16} className="mr-2" />
                    Refresh Data
                  </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Review Management</h3>
               {/*  <div className="flex items-center gap-2">
                  <button className="btn btn-sm btn-secondary" onClick={() => navigate('/admin/reviews')}>Open Full Reviews</button>
                </div> */}
              </div>
            </div>
            <div className="card-body">
              <ReviewManagement userRole="admin" showStats={true} showActions={true} />
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Contact Forms</h3>
                <p className="text-sm text-muted-foreground">Answer inquiries and follow up via messages</p>
              </div>
            </div>
            <div className="card-body">
              <ContactManagement userRole="admin" showStats={true} showActions={true} />
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Subscription Management</h3>
                <p className="text-sm text-muted-foreground">Manage platform subscriptions</p>
              </div>
            </div>
            <div className="card-body">
              <SubscriptionManagement userRole="admin" showStats={true} showActions={true} />
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">FAQ Management</h3>
                <p className="text-sm text-muted-foreground">Manage frequently asked questions and answers</p>
              </div>
            </div>
            <div className="card-body">
              <FAQManagement userRole="admin" showStats={true} showActions={true} />
            </div>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Department Management</h3>
                <p className="text-sm text-muted-foreground">Manage contact departments and their information</p>
              </div>
            </div>
            <div className="card-body">
              <DepartmentManagement userRole="admin" showStats={true} showActions={true} />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

