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
  const { user, isAdmin } = useAuth();
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
    if (!isAdmin) return;
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
  }, [isAdmin]);

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

  if (!isAdmin) {
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
    <div className="modern-admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/admin-dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Activity Log</h1>
            <p>Detailed view of system activities and user actions</p>
          </div>
        </div>
        <div className="header-right">
          <div className="search-container">
            <Search size={16} />
            <input type="text" placeholder="Search activities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            <option value="user">User Activities</option>
            <option value="property">Property Activities</option>
            <option value="sale">Sales Activities</option>
            <option value="approval">Admin Actions</option>
          </select>
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="filter-select">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Clickable Stats as Filters */}
      <div className="activity-stats">
        <button className="stat-card user" onClick={() => setFilterType('user')}>
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-content">
            <div className="stat-number">{activities.filter(a => a.type === 'user').length}</div>
            <div className="stat-label">User Activities</div>
          </div>
        </button>
        <button className="stat-card property" onClick={() => setFilterType('property')}>
          <div className="stat-icon"><Building size={20} /></div>
          <div className="stat-content">
            <div className="stat-number">{activities.filter(a => a.type === 'property').length}</div>
            <div className="stat-label">Property Activities</div>
          </div>
        </button>
        <button className="stat-card sale" onClick={() => setFilterType('sale')}>
          <div className="stat-icon"><DollarSign size={20} /></div>
          <div className="stat-content">
            <div className="stat-number">{activities.filter(a => a.type === 'sale').length}</div>
            <div className="stat-label">Sales Activities</div>
          </div>
        </button>
        <button className="stat-card approval" onClick={() => setFilterType('approval')}>
          <div className="stat-icon"><Shield size={20} /></div>
          <div className="stat-content">
            <div className="stat-number">{activities.filter(a => a.type === 'approval').length}</div>
            <div className="stat-label">Admin Actions</div>
          </div>
        </button>
      </div>

      {loading && (
        <div className="loading-state"><div className="loading-spinner"></div><p>Loading activities...</p></div>
      )}
      {error && (
        <div className="error-state"><p>Error: {error}</p><button onClick={() => window.location.reload()}>Retry</button></div>
      )}

      {!loading && !error && (
        <div className="activity-list-container">
          <div className="list-header"><h2>Recent Activities ({filteredActivities.length})</h2></div>
          <div className="detailed-activity-list">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="detailed-activity-item">
                <div className="activity-icon" style={{ backgroundColor: getStatusColor(activity.status) }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-main">
                  <div className="activity-header">
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-time"><Clock size={12} />{activity.time}</div>
                  </div>
                  <div className="activity-details">
                    <div className="activity-user">by {activity.user}</div>
                    <div className="activity-description">{activity.details}</div>
                  </div>
                  <div className="activity-timestamp">{activity.timestamp}</div>
                </div>
                <div className="activity-status">
                  <span className={`status-badge ${activity.status}`} style={{ backgroundColor: getStatusColor(activity.status) }}>{activity.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivity;

