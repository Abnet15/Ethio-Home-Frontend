import { 
  ArrowLeft,
  Activity,
  Users, 
  Building,
  DollarSign,
  Shield,
  UserPlus,
  Home,
  Search,
  Filter,
  Calendar,
  Clock,
  MessageSquare,
  LifeBuoy,
  AlertCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import { propertyService } from '../services/propertyService';
import { userService } from '../services/userService';

import '../styles/admin-dashboard.css';

const AdminActivity = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real activity data from API
  const [activities, setActivities] = useState([]);
  const [messageStats, setMessageStats] = useState({ totalMessages: 0, support: 0, unread: 0, propertyInquiries: 0 });

  // Fetch activity data from API
  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    if (!isAdmin || !user) return;
    const fetchActivityData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersResult, propertiesResult, messagesResult] = await Promise.all([
          userService.getUsers(),
          propertyService.getProperties(),
          messageService.getMessageStats()
        ]);
        const activityLog = [];
        if (usersResult.success) {
          const users = usersResult.data?.data?.data || usersResult.data?.data || [];
          users.forEach(user => {
            if (user.createdAt) {
              const timeAgo = getTimeAgo(new Date(user.createdAt));
              activityLog.push({ id: `user-${user._id}`, type: 'user', action: 'New user registered', user: user.name, details: `Registered as ${user.role}`, time: timeAgo, timestamp: new Date(user.createdAt).toLocaleString(), status: 'success' });
            }
          });
        }
        if (propertiesResult.success) {
          const properties = propertiesResult.data?.data?.data || propertiesResult.data?.data || [];
          properties.forEach(property => {
            if (property.createdAt) {
              const timeAgo = getTimeAgo(new Date(property.createdAt));
              activityLog.push({ id: `property-${property._id}`, type: 'property', action: 'Property listed', user: property.owner?.name || 'Unknown', details: `${property.title} - ETB ${property.price?.toLocaleString()}`, time: timeAgo, timestamp: new Date(property.createdAt).toLocaleString(), status: property.status === 'approved' ? 'success' : property.status === 'pending' ? 'warning' : 'info' });
            }
          });
        }
        // Message stats row
        if (messagesResult?.success) {
          const stats = messagesResult.data || messagesResult;
          setMessageStats({
            totalMessages: stats.totalMessages || stats.total || 0,
            support: stats.supportMessages || stats.support || 0,
            unread: stats.unread || 0,
            propertyInquiries: stats.propertyInquiries || stats.inquiries || 0,
          });
        }
        activityLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivities(activityLog.slice(0, 50));
      } catch (err) {
        setError('Failed to fetch activity data');
        setActivities([{ id: 1, type: 'user', action: 'Sample Activity', user: 'System', details: 'Activity log loaded', time: 'Just now', timestamp: new Date().toLocaleString(), status: 'info' }]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivityData();
  }, [isAdmin, user, authLoading]);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  // Wait for auth to finish loading
  if (authLoading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !user) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return <UserPlus size={16} />;
      case 'property': return <Home size={16} />;
      case 'sale': return <DollarSign size={16} />;
      case 'approval': return <Shield size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) || activity.user.toLowerCase().includes(searchTerm.toLowerCase()) || activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesDate = filterDate === 'all' || (filterDate === 'today' && (activity.time.includes('minutes ago') || activity.time.includes('hours ago'))) || (filterDate === 'yesterday' && activity.time.includes('1 day ago')) || (filterDate === 'week' && (activity.time.includes('day ago') || activity.time.includes('hours ago') || activity.time.includes('minutes ago')));
    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                className="p-2 rounded-lg hover:bg-white/20 transition-colors" 
                onClick={() => navigate('/admin-dashboard')}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-4xl font-black mb-2">Activity Log</h1>
                <p className="text-white/90">Detailed view of system activities and user actions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80" />
                <input 
                  type="text" 
                  placeholder="Search activities..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50" 
                />
              </div>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)} 
                className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all" className="text-gray-900">All Types</option>
                <option value="user" className="text-gray-900">User Activities</option>
                <option value="property" className="text-gray-900">Property Activities</option>
                <option value="sale" className="text-gray-900">Sales Activities</option>
                <option value="approval" className="text-gray-900">Admin Actions</option>
              </select>
              <select 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)} 
                className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all" className="text-gray-900">All Time</option>
                <option value="today" className="text-gray-900">Today</option>
                <option value="yesterday" className="text-gray-900">Yesterday</option>
                <option value="week" className="text-gray-900">This Week</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

        {/* Clickable Stats as Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button 
            className="bg-card rounded-xl border shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 text-left" 
            onClick={() => setFilterType('user')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-foreground">{activities.filter(a => a.type === 'user').length}</div>
                <div className="text-sm text-muted-foreground font-semibold">User Activities</div>
              </div>
            </div>
          </button>
          <button 
            className="bg-card rounded-xl border shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 text-left" 
            onClick={() => setFilterType('property')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-foreground">{activities.filter(a => a.type === 'property').length}</div>
                <div className="text-sm text-muted-foreground font-semibold">Property Activities</div>
              </div>
            </div>
          </button>
          <button 
            className="bg-card rounded-xl border shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 text-left" 
            onClick={() => setFilterType('sale')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-foreground">{activities.filter(a => a.type === 'sale').length}</div>
                <div className="text-sm text-muted-foreground font-semibold">Sales Activities</div>
              </div>
            </div>
          </button>
          <button 
            className="bg-card rounded-xl border shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 text-left" 
            onClick={() => setFilterType('approval')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-foreground">{activities.filter(a => a.type === 'approval').length}</div>
                <div className="text-sm text-muted-foreground font-semibold">Admin Actions</div>
              </div>
            </div>
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading activities...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-semibold mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
            <div className="p-6 border-b bg-muted/50">
              <h2 className="text-2xl font-black text-foreground">Recent Activities ({filteredActivities.length})</h2>
            </div>
            <div className="divide-y">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-muted/50 transition-colors flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: getStatusColor(activity.status) }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-foreground">{activity.action}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={14} />
                        {activity.time}
                      </div>
                    </div>
                    <div className="text-muted-foreground mb-2">
                      <span className="font-semibold">by {activity.user}</span> - {activity.details}
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: getStatusColor(activity.status) }}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivity;

