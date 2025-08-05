import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Crown,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Download,
  MoreVertical,
  Star,
  Clock,
  Zap,
  Shield,
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  UserCheck,
  UserX,
  CalendarDays,
  Coins,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  Building,
  Image,
  TrendingDown
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/subscriptionService';
//import { userService } from '../services/userService';

import '../styles/subscription-management.css';

const emptyPredefined = { 
  name: '', 
  interval: 'monthly', 
  amount: 0, 
  frequency: 1, 
  currency: 'ETB', 
  description: '', 
  isActive: true,
  features: [],
  maxProperties: 10,
  maxImages: 20,
  priority: 'standard'
};

const emptyUserSubscription = { 
  userId: '', 
  interval: 'monthly', 
  amount: 0, 
  currency: 'ETB', 
  frequency: 1,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  maxProperties: 10,
  status: 'active'
};

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('overview'); // overview, plans, users, analytics

  // User subscriptions
  const [userIdQuery, setUserIdQuery] = useState('');
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userSearching, setUserSearching] = useState(false);

  // Modals/simple forms
  const [showCreatePredefined, setShowCreatePredefined] = useState(false);
  const [predefinedForm, setPredefinedForm] = useState(emptyPredefined);
  const [showEditPredefined, setShowEditPredefined] = useState(false);
  const [editPredefinedForm, setEditPredefinedForm] = useState(emptyPredefined);
  const [editPlanId, setEditPlanId] = useState(null);

  const [showCreateUserSub, setShowCreateUserSub] = useState(false);
  const [userSubForm, setUserSubForm] = useState(emptyUserSubscription);

  // Filters and sorting
  const [filters, setFilters] = useState({
    status: 'all',
    interval: 'all',
    priceRange: 'all'
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    popularPlans: [],
    revenueByPlan: []
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => { 
    fetchPlans();
    fetchAnalytics();
  }, []);

  // Live user search (seller/agent) by name/email/phone
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      //if (!userSearch || userSearch.trim().length < 2) { setUserResults([]); return; }
      setUserSearching(true);
      try {
        /* const [sellers, agents] = await Promise.all([
          subscriptionService.listAdminPlans({ role: 'seller', search: userSearch, limit: 10, signal: controller.signal }),
          subscriptionService.listAdminPlans({ role: 'agent', search: userSearch, limit: 10, signal: controller.signal })
        ]); */
        const results= await subscriptionService.listAdminPlans({signal: controller.signal,search: userSearch });
        const s = results.success ? results.data.data : [];
        setUserResults(s );
      } catch (error) {
        setUserResults([]);
      } finally { setUserSearching(false); }
    };
    const id = setTimeout(run, 300);
    return () => { clearTimeout(id); controller.abort(); };
  }, [userSearch]);
  

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const results= await subscriptionService.listAdminPlans();
      const s = results.success ? results.data.data : [];
      console.log(s);
      setUserResults(s);
      const result = await subscriptionService.getPredefinedPlans();
      if (result.success) {
        setPlans(result.data.data || result.data || []);
      } else {
        setError('Failed to load subscription plans');
      }
    } catch (err) {
      setError('Failed to load subscription plans',err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      // Fetch real analytics data
      const [plansResult, subscriptionsResult] = await Promise.all([
        subscriptionService.getPredefinedPlans(),
        subscriptionService.listPlans()
      ]);

      let totalSubscriptions = 0;
      let activeSubscriptions = 0;
      let totalRevenue = 0;
      let popularPlans = [];
      let revenueByPlan = [];

      // Calculate from predefined plans
      if (plansResult.success) {
        const activePlans = plansResult.data.data || plansResult.data || [];
        const activePlansCount = activePlans.filter(plan => plan.isActive).length;
        
        // Calculate revenue from active plans (this is a simplified calculation)
        // In a real scenario, you'd want to calculate actual revenue from completed payments
        const estimatedRevenue = activePlans.reduce((sum, plan) => sum + (plan.amount || 0), 0);
        
        // Create popular plans data
        popularPlans = activePlans.slice(0, 3).map(plan => ({
          name: plan.name,
          count: Math.floor(Math.random() * 50) + 10, // Mock subscriber count for now
          revenue: Math.floor(Math.random() * 100000) + 50000 // Mock revenue for now
        }));

        // Create monthly revenue trend (mock data for now)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        revenueByPlan = months.map(month => ({
          month,
          revenue: Math.floor(Math.random() * 50000) + 30000
        }));

        setAnalytics({
          totalSubscriptions: activePlansCount * 25, // Estimate based on active plans
          activeSubscriptions: activePlansCount * 20, // Estimate based on active plans
          totalRevenue: estimatedRevenue * 12, // Annual estimate
          monthlyGrowth: Math.floor(Math.random() * 30) + 10,
          popularPlans,
          revenueByPlan
        });
      }

      // If we have real subscription data, use it
      if (subscriptionsResult.success) {
        const subscriptions = subscriptionsResult.data.data || subscriptionsResult.data || [];
        totalSubscriptions = subscriptions.length;
        activeSubscriptions = subscriptions.filter(sub => sub.active).length;
        
        // Calculate actual revenue from subscriptions
        totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
        
      setAnalytics(prev => ({
        ...prev,
        totalSubscriptions,
        activeSubscriptions,
        totalRevenue
      }));
    }
  } catch (err) {
    console.error('Error fetching analytics:', err);
    // Fallback to mock data if API fails
    setAnalytics({
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
      monthlyGrowth: 0,
      popularPlans: [],
      revenueByPlan: []
    });
  } finally {
    setAnalyticsLoading(false);
  }
};

  if (user?.role !== 'admin') {
    return (
      <div className="subscription-management">
        <div className="unauthorized-message">
          <AlertCircle size={64} />
          <h2>Access Denied</h2>
          <p>You don't have permission to access subscription management.</p>
        </div>
      </div>
    );
  }

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && plan.isActive) ||
                         (filters.status === 'inactive' && !plan.isActive);
    const matchesInterval = filters.interval === 'all' || plan.interval === filters.interval;
    
    return matchesSearch && matchesStatus && matchesInterval;
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'amount') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const fetchUserSubscriptions = async () => {
    if (!userIdQuery) return;
    try {
      setLoading(true);
      console.log('Fetching user subscriptions... 😁😁😁😀 👩🏾‍🤝‍👩🏼👩🏾‍🤝‍👩🏼👩🏾‍🤝‍👩🏼👩🏾‍🤝‍👩🏻👨‍👦‍👦👨‍👦‍👦');
      const result = await subscriptionService.listPlans({ userId: userIdQuery });
      console.log('User subscriptions result:', result);

      if (result.success) {
        const all = result.data?.data || result.data;
        const subs = all.subscriptions || all.data || [];
        setUserSubscriptions(subs);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePredefined = async (e) => {
    e.preventDefault();
    const res = await subscriptionService.createPredefinedPlan?.(predefinedForm);
    if (res?.success) { 
      setShowCreatePredefined(false); 
      setPredefinedForm(emptyPredefined); 
      fetchPlans();
      fetchAnalytics();
    } else { 
      alert(res?.error || 'Failed to create predefined plan'); 
    }
  };

  const handleUpdatePredefined = async (plan) => {
    setEditPlanId(plan._id);
    setEditPredefinedForm({
      name: plan.name || '',
      interval: plan.interval || 'monthly',
      amount: plan.amount || 0,
      frequency: plan.frequency || 1,
      currency: plan.currency || 'ETB',
      description: plan.description || '',
      isActive: Boolean(plan.isActive),
      features: plan.features || [],
      maxProperties: plan.maxProperties || 10,
      maxImages: plan.maxImages || 20,
      priority: plan.priority || 'standard'
    });
    setShowEditPredefined(true);
  };

  const handleDeletePredefined = async (plan) => {
    if (!window.confirm('Are you sure you want to delete this predefined plan? This action cannot be undone.')) return;
    const res = await subscriptionService.deletePredefinedPlan?.(plan._id);
    if (res?.success) {
      fetchPlans();
      fetchAnalytics();
    } else {
      alert(res?.error || 'Failed to delete plan');
    }
  };

  const handleCreateUserSubscription = async (e) => {
    e.preventDefault();
    const res = await subscriptionService.createPlan?.({ 
      userId: userSubForm.userId, 
      interval: userSubForm.interval, 
      amount: userSubForm.amount, 
      currency: userSubForm.currency, 
      frequency: userSubForm.frequency 
    });
    if (res?.success) { 
      setShowCreateUserSub(false); 
      setUserSubForm(emptyUserSubscription); 
      fetchUserSubscriptions();
      fetchAnalytics();
    } else { 
      alert(res?.error || 'Failed to create user subscription'); 
    }
  };

  const handleEditPredefinedSubmit = async (e) => {
    e.preventDefault();
    if (!editPlanId) return;
    const res = await subscriptionService.updatePredefinedPlan?.(editPlanId, editPredefinedForm);
    if (res?.success) { 
      setShowEditPredefined(false); 
      setEditPlanId(null); 
      fetchPlans();
      fetchAnalytics();
    } else { 
      alert(res?.error || 'Failed to update predefined plan'); 
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

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary', onClick }) => (
    <div className={`stat-card stat-${color} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="stat-icon-wrapper">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        {change !== undefined && (
          <div className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(change)}% from last month</span>
          </div>
        )}
      </div>
    </div>
  );

  const PlanCard = ({ plan }) => (
    <div className={`plan-card ${!plan.isActive ? 'inactive' : ''}`}>
      <div className="plan-header">
        <div className="plan-title-section">
          <h3 className="plan-name">{plan.name}</h3>
          <div className="plan-badges">
            <span className={`status-badge ${plan.isActive ? 'active' : 'inactive'}`}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="priority-badge priority-{plan.priority}">
              {plan.priority}
            </span>
          </div>
        </div>
        <div className="plan-price">
          <span className="currency">{plan.currency}</span>
          <span className="amount">{formatNumber(plan.amount)}</span>
          <span className="interval">/{plan.interval}</span>
        </div>
      </div>

      <div className="plan-description">
        <p>{plan.description || 'No description available'}</p>
      </div>

      <div className="plan-features">
        <div className="feature-item">
          <Building size={16} />
          <span>Max Properties: {plan.maxProperties || 'Unlimited'}</span>
        </div>
        <div className="feature-item">
          <Image size={16} />
          <span>Max Images: {plan.maxImages || 'Unlimited'}</span>
        </div>
        <div className="feature-item">
          <Zap size={16} />
          <span>Priority: {plan.priority}</span>
        </div>
      </div>

      <div className="plan-actions">
        <button 
          className="btn btn-icon btn-primary" 
          title="Edit Plan" 
          onClick={() => handleUpdatePredefined(plan)}
        >
          <Edit size={16} />
        </button>
        <button 
          className="btn btn-icon btn-secondary" 
          title={plan.isActive ? 'Deactivate' : 'Activate'} 
          onClick={async () => { 
            const res = await subscriptionService.updatePredefinedPlan?.(plan._id, { isActive: !plan.isActive }); 
            if (res?.success) {
              fetchPlans();
              fetchAnalytics();
            }
          }}
        >
          {plan.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
        </button>
        <button 
          className="btn btn-icon btn-danger" 
          title="Delete Plan" 
          onClick={() => handleDeletePredefined(plan)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="overview-section">
      <div className="stats-grid">
        <StatCard
          title="Total Subscriptions"
          value={formatNumber(analytics.totalSubscriptions)}
          change={analytics.monthlyGrowth}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Active Subscriptions"
          value={formatNumber(analytics.activeSubscriptions)}
          change={15.2}
          icon={UserCheck}
          color="success"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          change={28.7}
          icon={DollarSign}
          color="warning"
        />
        <StatCard
          title="Active Plans"
          value={formatNumber(plans.filter(p => p.isActive).length)}
          change={5.4}
          icon={Crown}
          color="info"
        />
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Popular Plans</h3>
            <button className="btn btn-sm btn-secondary">View All</button>
          </div>
          <div className="popular-plans">
            {analytics.popularPlans.map((plan, index) => (
              <div key={index} className="popular-plan-item">
                <div className="plan-info">
                  <h4>{plan.name}</h4>
                  <p>{plan.count} subscribers</p>
                </div>
                <div className="plan-revenue">
                  <span className="revenue-amount">{formatCurrency(plan.revenue)}</span>
                  <span className="revenue-label">revenue</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue Trend</h3>
            <div className="trend-indicator positive">
              <TrendingUp size={16} />
              <span>+{analytics.monthlyGrowth}%</span>
            </div>
          </div>
          <div className="revenue-chart">
            {analytics.revenueByPlan.map((item, index) => (
              <div key={index} className="revenue-bar">
                <div className="bar-label">{item.month}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      height: `${(item.revenue / Math.max(...analytics.revenueByPlan.map(r => r.revenue))) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="bar-value">{formatCurrency(item.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlans = () => (
    <div className="plans-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Subscription Plans</h2>
          <p>Manage predefined subscription plans for sellers and agents</p>
        </div>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={() => setShowCreatePredefined(true)}
        >
          <Plus size={20} />
          Create New Plan
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-filters">
        <div className="search-box">
          <Search size={20} />
            <input 
              type="text" 
              placeholder="Search plans..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <div className="filter-group">
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select 
              value={filters.interval} 
              onChange={(e) => setFilters({...filters, interval: e.target.value})}
              className="filter-select"
            >
              <option value="all">All Intervals</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="3-monthly">3-Monthly</option>
              <option value="6-monthly">6-Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>

        <div className="sort-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name</option>
            <option value="amount">Price</option>
            <option value="createdAt">Created</option>
          </select>
          
          <button 
            className={`sort-btn ${sortOrder === 'asc' ? 'asc' : 'desc'}`}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <RefreshCw size={48} className="spinning" />
          <p>Loading subscription plans...</p>
        </div>
      ) : (
        <div className="plans-grid">
          {sortedPlans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}

      {sortedPlans.length === 0 && !loading && (
        <div className="empty-state">
          <Crown size={64} />
          <h3>No plans found</h3>
          <p>Create your first subscription plan to get started</p>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreatePredefined(true)}
          >
            <Plus size={16} />
            Create Plan
          </button>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="users-section">
        <div className="section-header">
        <div className="header-content">
          <h2>User Subscriptions</h2>
          <p>Manage individual user subscriptions for sellers and agents</p>
        </div>
        <button 
          className="btn btn-secondary btn-lg" 
          onClick={() => setShowCreateUserSub(true)}
        >
          <Plus size={20} />
          Create User Subscription
        </button>
          </div>

      <div className="user-search-section">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search users by name, email or phone..." 
            value={userSearch} 
            onChange={(e) => setUserSearch(e.target.value)} 
          />
        </div>
        
        {userSearch && (
          <button 
            className="btn btn-secondary" 
            onClick={() => userSearch && setUserSearch(userSearch)} 
            disabled={userSearching}
          >
            <Search size={16} />
            {userSearching ? 'Searching...' : 'Search'}
          </button>
        )}
        </div>

        {userResults.length > 0 && (
        <div className="user-results">
          <h3>Search Results</h3>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userResults.map(u => (
                  <tr key={u.seller._id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {u.seller.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{u.seller.name}</span>
                          <span className="user-id">ID: {u.seller._id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${u.seller.role}`}>
                        {u.seller.role}
                      </span>
                    </td>
                    <td>
                      <div className="contact-info">
                        <span className="email">{u.seller.email}</span>
                        {u.seller.phone && <span className="phone">{u.seller.phone}</span>}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => { 
                          setUserIdQuery(u.seller._id); 
                          //setUserResults([]); 
                          fetchUserSubscriptions(); 
                        }}
                      >
                        View Subscriptions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}

      {userSubscriptions.length > 0 && (
        <div className="user-subscriptions-list">
          <h3>User Subscriptions</h3>
          <div className="subscriptions-table">
            <table>
              <thead>
                <tr>
                  <th>Subscription Details</th>
                  <th>Billing</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userSubscriptions.map((s) => (
                console.log("user subscriptions 😊😊😊😉", s),
                  <tr key={s._id}>
                    <td>
                      <div className="subscription-info">
                        <div className="sub-id">ID: {s.seller._id}</div>
                        <div className="sub-user">User: {s.seller.role || s.agent || s.userId}</div>
                      </div>
                    </td>
                    <td>
                      <div className="billing-info">
                        <div className="amount">{formatCurrency(s.amount)}</div>
                        <div className="interval">per {s.interval}</div>
                        <div className="frequency">x{s.frequency}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${s.active ? 'active' : 'inactive'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-icon btn-primary" 
                          onClick={() => {
                        const newAmount = prompt('New amount (ETB):', s.amount);
                        if (newAmount !== null) {
                              subscriptionService.updatePlan?.(s._id, { amount: Number(newAmount) })
                                .then(() => {
                                  fetchUserSubscriptions();
                                  fetchAnalytics();
                                });
                            }
                          }} 
                          title="Edit Amount"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-icon btn-danger" 
                          onClick={() => { 
                            if (window.confirm('Are you sure you want to delete this subscription?')) {
                              subscriptionService.deletePlan?.(s._id).then(() => {
                                fetchUserSubscriptions();
                                fetchAnalytics();
                              });
                            }
                          }} 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {userSubscriptions.length === 0 && userIdQuery && (
        <div className="empty-state">
          <Users size={64} />
          <h3>No subscriptions found</h3>
          <p>This user doesn't have any active subscriptions</p>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreateUserSub(true)}
          >
            <Plus size={16} />
            Create Subscription
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="subscription-management">
      <div className="management-header">
        <div className="header-main">
          <h1>Subscription Management</h1>
          <p>Comprehensive subscription management for sellers and agents</p>
        </div>
        
        <div className="view-tabs">
          <button 
            className={`view-tab ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            <BarChart3 size={20} />
            Overview
          </button>
          <button 
            className={`view-tab ${viewMode === 'plans' ? 'active' : ''}`}
            onClick={() => setViewMode('plans')}
          >
            <Crown size={20} />
            Plans
          </button>
          <button 
            className={`view-tab ${viewMode === 'users' ? 'active' : ''}`}
            onClick={() => setViewMode('users')}
          >
            <Users size={20} />
            Users
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          </div>
        )}

      <div className="content-area">
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'plans' && renderPlans()}
        {viewMode === 'users' && renderUsers()}
      </div>

      {/* Create Predefined Plan Modal */}
      {showCreatePredefined && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>Create New Subscription Plan</h3>
              <button className="close-btn" onClick={() => setShowCreatePredefined(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreatePredefined} className="form-grid">
                <div className="form-row">
                  <label className="form-group">
                    <span>Plan Name *</span>
                    <input 
                      placeholder="e.g., Premium, Standard, Basic" 
                      value={predefinedForm.name} 
                      onChange={(e) => setPredefinedForm({ ...predefinedForm, name: e.target.value })} 
                      required 
                    />
                  </label>
                  <label className="form-group">
                    <span>Billing Interval *</span>
                    <select 
                      value={predefinedForm.interval} 
                      onChange={(e) => setPredefinedForm({ ...predefinedForm, interval: e.target.value })}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="3-monthly">3-Monthly</option>
                      <option value="6-monthly">6-Monthly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-group">
                    <span>Amount (ETB) *</span>
                    <input 
                      type="number" 
                      placeholder="500" 
                      value={predefinedForm.amount} 
                      onChange={(e) => setPredefinedForm({ ...predefinedForm, amount: Number(e.target.value) })} 
                      required 
                    />
                  </label>
                  <label className="form-group">
                    <span>Currency *</span>
                    <input 
                      placeholder="ETB" 
                      value={predefinedForm.currency} 
                      onChange={(e) => setPredefinedForm({ ...predefinedForm, currency: e.target.value })} 
                      required 
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-group">
                    <span>Max Properties</span>
                    <input 
                      type="number" 
                      placeholder="10" 
                      value={predefinedForm.maxProperties} 
                      onChange={(e) => setPredefinedForm({ ...predefinedForm, maxProperties: Number(e.target.value) })} 
                    />
                  </label>
                  <label className="form-group">
                    <span>Max Images</span>
                    <input 
                      type="number" 
                      placeholder="20" 
                      value={predefinedForm.maxImages} 
                      onChange={(e) => setPredefinedForm({ ...predefinedForm, maxImages: Number(e.target.value) })} 
                    />
                </label>
                </div>

                <label className="form-group">
                  <span>Priority Level</span>
                  <select 
                    value={predefinedForm.priority} 
                    onChange={(e) => setPredefinedForm({ ...predefinedForm, priority: e.target.value })}
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </label>

                <label className="form-group">
                  <span>Description</span>
                  <textarea 
                    placeholder="Describe what this plan includes and its benefits..." 
                    value={predefinedForm.description} 
                    onChange={(e) => setPredefinedForm({ ...predefinedForm, description: e.target.value })} 
                  />
                </label>

                <label className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    checked={predefinedForm.isActive} 
                    onChange={(e) => setPredefinedForm({ ...predefinedForm, isActive: e.target.checked })} 
                  />
                  <span>Active Plan</span>
                </label>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreatePredefined(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-secondary">
                    <Plus size={16} />
                    Create Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Predefined Plan Modal */}
      {showEditPredefined && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>Edit Subscription Plan</h3>
              <button className="close-btn" onClick={() => setShowEditPredefined(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditPredefinedSubmit} className="form-grid">
                <div className="form-row">
                  <label className="form-group">
                    <span>Plan Name *</span>
                    <input 
                      placeholder="Plan name" 
                      value={editPredefinedForm.name} 
                      onChange={(e) => setEditPredefinedForm({ ...editPredefinedForm, name: e.target.value })} 
                      required 
                    />
                  </label>
                  <label className="form-group">
                    <span>Billing Interval *</span>
                    <select 
                      value={editPredefinedForm.interval} 
                      onChange={(e) => setEditPredefinedForm({ ...editPredefinedForm, interval: e.target.value })}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="3-monthly">3-Monthly</option>
                      <option value="6-monthly">6-Monthly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-group">
                    <span>Amount (ETB) *</span>
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      value={editPredefinedForm.amount} 
                      onChange={(e) => setEditPredefinedForm({ ...editPredefinedForm, amount: Number(e.target.value) })} 
                      required 
                    />
                  </label>
                  <label className="form-group">
                    <span>Currency *</span>
                    <input 
                      placeholder="Currency" 
                      value={editPredefinedForm.currency} 
                      onChange={(e) => setEditPredefinedForm({ ...editPredefinedForm, currency: e.target.value })} 
                      required 
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-group">
                    <span>Max Properties</span>
                    <input 
                      type="number" 
                      placeholder="10" 
                      value={editPredefinedForm.maxProperties} 
                      onChange={(e) => setEditPredefinedForm({ ...editPredefinedForm, maxProperties: Number(e.target.value) })} 
                    />
                  </label>
                  <label className="form-group">
                    <span>Max Images</span>
                    <input 
                      type="number" 
                      placeholder="20" 
                      value={editPredefinedForm.maxImages} 
                      onChange={(e) => setEditPredefinedForm({ ...editPredefinedForm, maxImages: Number(e.target.value) })} 
                    />
                </label>
                </div>

                <label className="form-group">
                  <span>Priority Level</span>
                  <select 
                    value={editPredefinedForm.priority} 
                    onChange={(e) => setEditPredefinedForm({ ...editPredefinedForm, priority: e.target.value })}
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </label>

                <label className="form-group">
                  <span>Description</span>
                  <textarea 
                    placeholder="Description" 
                    value={editPredefinedForm.description} 
                    onChange={(e) => setEditPredefinedForm({ ...editPredefinedForm, description: e.target.value })} 
                  />
                </label>

                <label className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    checked={editPredefinedForm.isActive} 
                    onChange={(e) => setEditPredefinedForm({ ...editPredefinedForm, isActive: e.target.checked })} 
                  />
                  <span>Active Plan</span>
                </label>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditPredefined(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Edit size={16} />
                    Update Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create User Subscription Modal */}
      {showCreateUserSub && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create User Subscription</h3>
              <button className="close-btn" onClick={() => setShowCreateUserSub(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateUserSubscription} className="form-grid">
                <label className="form-group">
                  <span>Seller/Agent User ID *</span>
                  <input 
                    placeholder="Enter user ID" 
                    value={userSubForm.userId} 
                    onChange={(e) => setUserSubForm({ ...userSubForm, userId: e.target.value })} 
                    required 
                  />
                </label>
                
                <div className="form-row">
                  <label className="form-group">
                    <span>Billing Interval *</span>
                    <select 
                      value={userSubForm.interval} 
                      onChange={(e) => setUserSubForm({ ...userSubForm, interval: e.target.value })}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="3-monthly">3-Monthly</option>
                      <option value="6-monthly">6-Monthly</option>
                      <option value="annually">Annually</option>
                    </select>
                </label>
                  <label className="form-group">
                    <span>Amount (ETB) *</span>
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      value={userSubForm.amount} 
                      onChange={(e) => setUserSubForm({ ...userSubForm, amount: Number(e.target.value) })} 
                      required 
                    />
                </label>
                </div>

                <div className="form-row">
                  <label className="form-group">
                    <span>Currency *</span>
                    <input 
                      placeholder="ETB" 
                      value={userSubForm.currency} 
                      onChange={(e) => setUserSubForm({ ...userSubForm, currency: e.target.value })} 
                      required 
                    />
                </label>
                  <label className="form-group">
                    <span>Frequency *</span>
                    <input 
                      type="number" 
                      placeholder="1" 
                      value={userSubForm.frequency} 
                      onChange={(e) => setUserSubForm({ ...userSubForm, frequency: Number(e.target.value) })} 
                      required 
                    />
                </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateUserSub(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Plus size={16} />
                    Create Subscription
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
