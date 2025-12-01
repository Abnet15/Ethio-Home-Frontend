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
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { messageService } from '../services/messageService';
import { propertyService } from '../services/propertyService';
import { sellingService } from '../services/sellingService';
import { userService } from '../services/userService';
import { SERVER_BASE_URL } from '../config/api';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
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
    if (!isAdmin) {
      navigate('/unauthorized');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

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

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary', onClick }) => (
    <div className="stat-card cursor-pointer" onClick={onClick}>
      <div className="stat-header">
        <h3 className="stat-title">{title}</h3>
        <Icon className={`stat-icon text-${color}`} />
      </div>
      <p className="stat-value">{value}</p>
      {change !== undefined && (
        <div className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(change)}% from last month</span>
        </div>
      )}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className="flex items-center gap-4 p-4 hover:bg-neutral-50 rounded-lg transition">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon size={20} className="text-primary-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-neutral-900">{activity.message}</p>
          <p className="text-sm text-neutral-500">{activity.time}</p>
        </div>
        <ChevronRight size={16} className="text-neutral-400" />
      </div>
    );
  };

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'primary' }) => (
    <div className="card cursor-pointer" onClick={onClick}>
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
            <Icon size={24} className={`text-${color}-600`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">{title}</h3>
            <p className="text-sm text-neutral-600">{description}</p>
          </div>
          <ChevronRight size={20} className="text-neutral-400" />
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
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Admin Panel</h2>
          <p className="text-sm text-neutral-600">Welcome back, {user?.name}</p>
        </div>

        <nav className="nav-menu">
          <div className="nav-item">
            <a 
              href="#overview" 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
            >
              <BarChart3 size={20} />
              Overview
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#users" 
              className="nav-link"
              onClick={(e) => { e.preventDefault(); navigate('/admin/users'); }}
            >
              <Users size={20} />
              Users
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#properties" 
              className="nav-link"
              onClick={(e) => { e.preventDefault(); navigate('/admin/properties'); }}
            >
              <Building size={20} />
              Properties
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#messages" 
              className="nav-link"
              onClick={(e) => { e.preventDefault(); navigate('/admin/messages'); }}
            >
              <MessageSquare size={20} />
              Messages
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#selling" 
              className={`nav-link ${activeTab === 'selling' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('selling'); }}
            >
              <TrendingUp size={20} />
              All Selling Properties
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#reviews" 
              className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('reviews'); }}
            >
              <Star size={20} />
              Reviews
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#activity" 
              className="nav-link"
              onClick={(e) => { e.preventDefault(); navigate('/admin/activity'); }}
            >
              <Activity size={20} />
              Activity
            </a>
          </div>
          {/* <div className="nav-item">
            <a 
              href="#roles" 
              className="nav-link"
              onClick={(e) => { e.preventDefault(); navigate('/admin/roles'); }}
            >
              <Shield size={20} />
              Roles
            </a>
          </div> */}
          {<div className="nav-item">
            <a 
              href="#subscriptions" 
              className={`nav-link ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('subscriptions'); }}
            >
              <Bell size={20} />
              Subscriptions
            </a>
          </div>}
          <div className="nav-item">
            <a 
              href="#contacts" 
              className={`nav-link ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('contacts'); }}
            >
              <Mail size={20} />
              Contact Forms
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#faqs" 
              className={`nav-link ${activeTab === 'faqs' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('faqs'); }}
            >
              <MessageSquare size={20} />
              FAQ Management
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#departments" 
              className={`nav-link ${activeTab === 'departments' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('departments'); }}
            >
              <Building size={20} />
              Department Management
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {activeTab === 'overview' && (
          <>
            {/* Header */}
            <div className="dashboard-header">
              <div>
                <h1 className="dashboard-title">Dashboard Overview</h1>
                <p className="text-neutral-600">Monitor your platform's performance and manage operations</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="btn btn-secondary" onClick={fetchDashboardData}>
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/properties/new')}>
                  <Download size={16} />
                  Create Property
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
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

            {/* Message Management Section */}
            <div className="card mb-8">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">Message Management</h3>
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



            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
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
                  <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Recent Users */}
              <div className="table-container">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Recent Users</h3>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => navigate('/admin/users')}
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-700">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-neutral-900">{user.name}</p>
                                <p className="text-sm text-neutral-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-info">{user.role}</span>
                          </td>
                          <td>
                            <span className={`badge ${user.active ? 'badge-success' : 'badge-error'}`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="text-sm text-neutral-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Properties */}
              <div className="table-container">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Recent Properties</h3>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => navigate('/admin/properties')}
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProperties.map((property) => (
                        <tr key={property._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden">
                                {property.images?.[0] ? (
                                  <img 
                                    src={property.images[0]} 
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Home size={16} className="text-neutral-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-neutral-900">{property.title}</p>
                                <p className="text-sm text-neutral-500">{property.location}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-info">{property.type}</span>
                          </td>
                          <td className="font-medium text-neutral-900">
                            {formatCurrency(property.price)}
                          </td>
                          <td>
                            <span className={`badge ${
                              property.status === 'active' ? 'badge-success' :
                              property.status === 'pending' ? 'badge-warning' : 'badge-error'
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
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">Total Sold</p>
                    <p className="text-3xl font-bold text-gray-900">{soldProperties.length}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{width: `${Math.min((soldProperties.length / 50) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Properties sold this year</p>
              </div>

              {/* Total Revenue */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <DollarSign size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
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
                <p className="text-xs text-gray-500 mt-2">Revenue generated from sales</p>
              </div>

              {/* Average Sale Price */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">Avg Sale Price</p>
                    <p className="text-3xl font-bold text-gray-900">
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
                <p className="text-xs text-gray-500 mt-2">Average property value</p>
              </div>

              {/* This Month Sales */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">This Month</p>
                    <p className="text-3xl font-bold text-gray-900">{(() => {
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
                <p className="text-xs text-gray-500 mt-2">Sales this month</p>
              </div>
            </div>

            {/* Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Type Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <PieChart size={24} className="mr-3 text-blue-600" />
                    Property Types
                  </h3>
                  <div className="text-sm text-gray-500">
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
                        <div key={type} className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${color.bg} mr-3`}></div>
                              <span className="font-semibold text-gray-900">{type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">{count}</span>
                              <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
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
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <BarChart3 size={24} className="mr-3 text-green-600" />
                    Price Ranges
                  </h3>
                  <div className="text-sm text-gray-500">
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
                      <div key={range.label} className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{range.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{range.count}</span>
                            <span className="text-xs text-gray-500">properties</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
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
                    <h3 className="text-xl font-bold text-gray-900">Sold Properties</h3>
                    <p className="text-sm text-gray-600">Complete list of all sold properties</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {soldProperties.map((property, index) => (
                    <div 
                      key={property._id} 
                      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden"
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
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
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
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                                {property.title || 'Property Title'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 flex items-center">
                          <MapPin size={14} className="mr-1 text-blue-500" />
                                {property.location || 'Location not specified'}
                              </p>
                              
                              {/* Property Features */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            <Home size={12} className="mr-1 text-blue-500" />
                            <span>{property.features?.bedrooms || 0} beds</span>
                                </div>
                          <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
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
                        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Users size={12} className="mr-1 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">Owner</span>
                                </div>
                          <p className="text-xs text-gray-600 truncate">
                            {property.owner?.name || 'Owner Name'}
                          </p>
                            </div>

                        {/* Date Sold */}
                        <div className="mb-3 flex items-center text-xs text-gray-500">
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
                  <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sold Properties</h3>
                  <p className="text-gray-600 mb-6">There are currently no sold properties to display.</p>
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
                <h3 className="text-lg font-semibold text-neutral-900">Review Management</h3>
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
                <h3 className="text-lg font-semibold text-neutral-900">Contact Forms</h3>
                <p className="text-sm text-neutral-600">Answer inquiries and follow up via messages</p>
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
                <h3 className="text-lg font-semibold text-neutral-900">Subscription Management</h3>
                <p className="text-sm text-neutral-600">Manage platform subscriptions</p>
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
                <h3 className="text-lg font-semibold text-neutral-900">FAQ Management</h3>
                <p className="text-sm text-neutral-600">Manage frequently asked questions and answers</p>
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
                <h3 className="text-lg font-semibold text-neutral-900">Department Management</h3>
                <p className="text-sm text-neutral-600">Manage contact departments and their information</p>
              </div>
            </div>
            <div className="card-body">
              <DepartmentManagement userRole="admin" showStats={true} showActions={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

