import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building,
  ShoppingCart,
  UserCheck,
  Settings,
  Save,
  X,
  ArrowLeft,
  Activity
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { userService } from '../services/userService';


const AdminUserManagement = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'

  // Backend-driven roles

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    city: '',
    state: '',
    photo: '',
    role: 'buyer',
    isVerified: false,
    active: true,
    password: '',
    passwordConfirm: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const roles = [
    {
      value: 'buyer',
      title: 'Property Buyer',
      description: 'Can browse and purchase properties',
      icon: ShoppingCart
    },
    {
      value: 'seller',
      title: 'Property Seller',
      description: 'Can list and manage properties for sale/rent',
      icon: Building
    },
    {
      value: 'agent',
      title: 'Real Estate Agent',
      description: 'Professional real estate agent with full access',
      icon: UserCheck
    },
    {
      value: 'employee',
      title: 'Company Employee',
      description: 'Employee with limited administrative access',
      icon: Settings
    }
  ];

  // Validation functions
  const validatePhone = (phone) => {
    const ethiopianPhoneRegex = /^(\+251|251|0)?[79]\d{8}$/;
    return ethiopianPhoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid Ethiopian phone number';
    }

    // Location validation
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    // State validation
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Role is required';
    }

    // Password validation for new users
    if (!editingUser) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }

      if (!formData.passwordConfirm) {
        errors.passwordConfirm = 'Please confirm your password';
      } else if (formData.password !== formData.passwordConfirm) {
        errors.passwordConfirm = 'Passwords do not match';
      }
    }

    // Password validation for editing users (if password is provided)
    if (editingUser && (formData.password || formData.passwordConfirm)) {
      if (formData.password && formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }
      if (formData.passwordConfirm && formData.password !== formData.passwordConfirm) {
        errors.passwordConfirm = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      try {
        const result = await userService.getUsers();
        //console.log(result.data)
        if (result.success) {
          const list = result.data?.data?.data || [];
          // Map backend fields to UI model if needed
          console.log(list);
          const normalized = list.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            location: u.location || '',
            createdAt: u.createdAt,
            status: u.active === false ? 'inactive' : 'active'
          }));
          setUsers(normalized);
        } else {
          setMessage(result.error || 'Failed to load users');
        }
      } catch (e) {
        setMessage('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isAdmin]);

  // Auto-dismiss messages after a short period
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, messageType === 'success' ? 3000 : 5000);
    return () => clearTimeout(timeout);
  }, [message, messageType]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validate form before submission
    if (!validateForm()) {
      setMessage('Please fix the errors in the form');
      return;
    }

    try {
      if (editingUser) {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          photo: formData.photo,
          role: formData.role,
          isVerified: formData.isVerified,
          active: formData.active,
          ...(formData.password ? { password: formData.password, passwordConfirm: formData.passwordConfirm } : {})
        };
        const result = await userService.updateUser(editingUser.id, payload);
        if (!result.success) throw new Error(result.error);
        setMessage('User updated successfully!');
        setMessageType('success');
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          photo: formData.photo,
          role: formData.role,
          isVerified: formData.isVerified,
          active: formData.active,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm
        };
        const result = await userService.createUser(payload);
        if (!result.success) throw new Error(result.error);
        setMessage('User created successfully!');
        setMessageType('success');
      }

      // Refresh list from backend and reset form
      const refreshed = await userService.getUsers();
      if (refreshed.success) {
        const list = refreshed.data?.data?.data || [];
        const normalized = list.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          location: u.location || '',
          createdAt: u.createdAt,
          status: u.active === false ? 'inactive' : 'active'
        }));
        setUsers(normalized);
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        role: '',
        password: '',
        passwordConfirm: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      setMessage(error.message || 'Failed to save user');
      setMessageType('error');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      photo: user.photo || '',
      role: user.role || 'buyer',
      isVerified: user.isVerified || false,
      active: user.active !== false,
      password: '',
      passwordConfirm: ''
    });
    setFormErrors({});
    setEditingUser(user);
    setShowCreateForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const result = await userService.deleteUser(userId);
    if (result.success) {
      setUsers(users.filter(u => u.id !== userId));
      setMessage('User deleted successfully!');
      setMessageType('success');
    } else {
      setMessage(result.error || 'Failed to delete user');
      setMessageType('error');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      address: '',
      city: '',
      state: '',
      photo: '',
      role: 'buyer',
      isVerified: false,
      active: true,
      password: '',
      passwordConfirm: ''
    });
    setFormErrors({});
    setEditingUser(null);
    setShowCreateForm(false);
    setMessage('');
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }

    try {
      const result = await userService.updateUserPassword(
        selectedUser.id,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );

      if (result.success) {
        setMessage('Password updated successfully!');
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        setMessage(result.error || 'Failed to update password');
      }
    } catch (error) {
      setMessage('Failed to update password');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const currentUser = users.find(u => u.id === userId);
      const newStatus = currentUser.status === 'active' ? 'inactive' : 'active';
      
      const result = await userService.updateUser(userId, { active: newStatus === 'active' });
      
      if (result.success) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ));
        setMessage(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`);
      } else {
        setMessage(result.error || 'Failed to update user status');
      }
    } catch (error) {
      setMessage('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'buyer': return ShoppingCart;
      case 'seller': return Building;
      case 'agent': return UserCheck;
      case 'employee': return Settings;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'buyer': return '#10b981';
      case 'seller': return '#3b82f6';
      case 'agent': return '#f59e0b';
      case 'employee': return '#6b7280';
      default: return '#6b7280';
    }
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

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, hsl(145 63% 32% / 0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, hsl(48 96% 53% / 0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-emerald-900/90 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl shadow-emerald-900/30">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
        
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button 
                className="group p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-gold-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gold-400/20"
                onClick={() => navigate('/admin-dashboard')}
              >
                <ArrowLeft size={20} className="text-white group-hover:text-gold-400 transition-colors" />
              </button>
              <div>
                <h1 className="text-4xl font-black mb-2 font-serif tracking-tight bg-gradient-to-r from-white via-gold-200 to-white bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-emerald-100/80 font-medium">Create and manage user accounts</p>
              </div>
            </div>
            <button
              className="group px-6 py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 text-slate-900 rounded-xl font-bold hover:from-gold-300 hover:to-gold-400 transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-gold-400/30 hover:shadow-xl hover:shadow-gold-400/40 hover:scale-105"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              Create User
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative container mx-auto px-6 py-10">

      {message && (
        <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {showCreateForm && (
        <div className="create-form-overlay">
          <div className="create-form-modal">
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
              <button className="close-button" onClick={handleCancel}>
                <X size={20} />
              </button>
            </div>

            {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
            )}

            <form onSubmit={handleSubmit} className="create-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <div className="input-wrapper">
                    <User size={16} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className={formErrors.name ? 'error' : ''}
                      required
                    />
                  </div>
                  {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <div className="input-wrapper">
                    <Mail size={16} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className={formErrors.email ? 'error' : ''}
                      required
                    />
                  </div>
                  {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <div className="input-wrapper">
                    <Phone size={16} />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+251 911 123 456"
                      className={formErrors.phone ? 'error' : ''}
                      required
                    />
                  </div>
                  {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <div className="input-wrapper">
                    <MapPin size={16} />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Bole, Addis Ababa"
                      className={formErrors.location ? 'error' : ''}
                      required
                    />
                  </div>
                  {formErrors.location && <div className="error-message">{formErrors.location}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <div className="input-wrapper">
                    <MapPin size={16} />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter full address"
                      className={formErrors.address ? 'error' : ''}
                      required
                    />
                  </div>
                  {formErrors.address && <div className="error-message">{formErrors.address}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <div className="input-wrapper">
                    <MapPin size={16} />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className={formErrors.city ? 'error' : ''}
                      required
                    />
                  </div>
                  {formErrors.city && <div className="error-message">{formErrors.city}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="state">State/Region *</label>
                  <div className="input-wrapper">
                    <MapPin size={16} />
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state or region"
                      className={formErrors.state ? 'error' : ''}
                      required
                    />
                  </div>
                  {formErrors.state && <div className="error-message">{formErrors.state}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="photo">Profile Photo URL</label>
                  <div className="input-wrapper">
                    <User size={16} />
                    <input
                      type="url"
                      id="photo"
                      name="photo"
                      value={formData.photo}
                      onChange={handleInputChange}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>User Role *</label>
                <div className="role-selection">
                  {roles.map((role) => (
                    <div
                      key={role.value}
                      className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect(role.value)}
                    >
                      <role.icon size={20} />
                      <div className="role-info">
                        <div className="role-title">{role.title}</div>
                        <div className="role-description">{role.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {formErrors.role && <div className="error-message">{formErrors.role}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                    />
                    Email Verified
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    />
                    Account Active
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">
                    {editingUser ? 'New Password (optional)' : 'Password *'}
                  </label>
                  <div className="input-wrapper">
                    <Lock size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                      className={formErrors.password ? 'error' : ''}
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="passwordConfirm">
                    {editingUser ? 'Confirm New Password' : 'Confirm Password *'}
                  </label>
                  <div className="input-wrapper">
                    <Lock size={16} />
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      id="passwordConfirm"
                      name="passwordConfirm"
                      value={formData.passwordConfirm}
                      onChange={handleInputChange}
                      placeholder={editingUser ? 'Confirm new password' : 'Confirm password'}
                      className={formErrors.passwordConfirm ? 'error' : ''}
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    >
                      {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.passwordConfirm && <div className="error-message">{formErrors.passwordConfirm}</div>}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-gold-400/50 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300"
          />
        </div>

        <div className="relative">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-12 pr-10 py-3.5 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-gold-400/50 focus:ring-2 focus:ring-gold-400/20 transition-all duration-300"
          >
            <option value="all">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="agent">Agents</option>
            <option value="employee">Employees</option>
          </select>
        </div>
      </div>

      {/* Premium Data Table */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/50">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-slate-800/60 border-b border-slate-700/50">
          <div className="text-xs font-bold text-gold-400 uppercase tracking-wider">User</div>
          <div className="text-xs font-bold text-gold-400 uppercase tracking-wider">Role</div>
          <div className="text-xs font-bold text-gold-400 uppercase tracking-wider">Contact</div>
          <div className="text-xs font-bold text-gold-400 uppercase tracking-wider">Location</div>
          <div className="text-xs font-bold text-gold-400 uppercase tracking-wider text-right">Actions</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-700/30">
          {filteredUsers.map((user, index) => {
            const RoleIcon = getRoleIcon(user.role);
            return (
              <div 
                key={user.id} 
                className="group grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-gold-400/5 hover:to-transparent cursor-pointer transition-all duration-300"
                onClick={() => {
                  setSelectedUser(user);
                  setShowUserDetails(true);
                }}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 flex items-center justify-center text-gold-400 font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-gold-400 transition-colors">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: getRoleColor(user.role) + '40', borderColor: getRoleColor(user.role), borderWidth: '1px' }}
                  >
                    <RoleIcon size={12} />
                    <span className="capitalize">{user.role}</span>
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-slate-300">
                  {user.phone}
                </div>
                
                <div className="flex items-center text-sm text-slate-300">
                  {user.location || '—'}
                </div>
                
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-gold-400/20 hover:text-gold-400 transition-all duration-300"
                    onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
                    title="Edit user"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-red-400/20 hover:text-red-400 transition-all duration-300"
                    onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
                    title="Delete user"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-700/30 flex items-center justify-center mb-4">
              <Users size={40} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
            <p className="text-slate-400 text-sm">No users match your current search and filter criteria.</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content user-details-modal">
            <div className="modal-header">
              <h2>User Details - {selectedUser.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowUserDetails(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
            )}
            
            <div className="modal-body">
              <div className="user-details-tabs">
                <button 
                  className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={16} />
                  Profile
                </button>
                <button 
                  className={`tab ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <Lock size={16} />
                  Password
                </button>
                <button 
                  className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  <Activity size={16} />
                  Activity
                </button>
              </div>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="user-details-grid">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedUser.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">
                      <span className="role-badge" style={{ backgroundColor: getRoleColor(selectedUser.role) }}>
                        {selectedUser.role}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span className={`status-badge ${selectedUser.status}`}>
                        {selectedUser.status}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Contact Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedUser.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{selectedUser.location || 'Not provided'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Account Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{new Date(selectedUser.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">User ID:</span>
                    <span className="detail-value">{selectedUser.id}</span>
                  </div>
                </div>
              </div>
              )}
              
              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="password-change-section">
                  <h3>Change Password</h3>
                  <p className="password-note">Enter a new password for this user. Leave blank to keep current password.</p>
                  
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        minLength="8"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showPasswordConfirm ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        minLength="8"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      >
                        {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={handlePasswordChange}
                    disabled={!passwordForm.newPassword || !passwordForm.confirmPassword}
                  >
                    <Lock size={16} />
                    Update Password
                  </button>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="user-activity-section">
                  <h3>User Activity</h3>
                  <div className="activity-stats">
                    <div className="activity-stat">
                      <span className="stat-label">Last Login:</span>
                      <span className="stat-value">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="activity-stat">
                      <span className="stat-label">Account Status:</span>
                      <span className={`stat-value status-${selectedUser.status}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="activity-actions">
                    <button 
                      className={`btn ${selectedUser.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleUserStatus(selectedUser.id)}
                    >
                      {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowUserDetails(false);
                  setEditingUser(selectedUser);
                  setShowCreateForm(true);
                }}
              >
                <Edit size={16} />
                Edit User
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowUserDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-content h1 {
          margin: 0;
          color: var(--text-primary);
        }

        .header-content p {
          margin: 0.5rem 0 0 0;
          color: var(--text-secondary);
        }

        .message {
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .message.success {
          background: var(--color-success-light);
          color: var(--color-success);
          border: 1px solid var(--color-success);
        }

        .message.error {
          background: var(--color-error-light);
          color: var(--color-error);
          border: 1px solid var(--color-error);
        }

        .create-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .create-form-modal {
          background: var(--bg-primary);
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background: var(--bg-secondary);
        }

        .create-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: var(--text-primary);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper svg:first-child {
          position: absolute;
          left: 12px;
          color: var(--text-tertiary);
          z-index: 1;
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 2px solid var(--border-primary);
          border-radius: 6px;
          font-size: 1rem;
          background: var(--input-bg);
          color: var(--text-primary);
          transition: border-color 0.2s;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 0.25rem;
          z-index: 1;
        }

        .role-selection {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .role-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid var(--border-primary);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg-primary);
        }

        .role-option:hover {
          border-color: var(--color-primary);
          background: var(--bg-secondary);
        }

        .role-option.selected {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .role-info {
          flex: 1;
        }

        .role-title {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .role-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
        }

        .users-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .search-wrapper,
        .filter-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-wrapper {
          flex: 1;
          max-width: 300px;
        }

        .search-wrapper svg,
        .filter-wrapper svg {
          position: absolute;
          left: 12px;
          color: var(--text-tertiary);
          z-index: 1;
        }

        .search-wrapper input,
        .filter-wrapper select {
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 2px solid var(--border-primary);
          border-radius: 6px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 1rem;
        }

        .search-wrapper input {
          width: 100%;
        }

        .filter-wrapper select {
          min-width: 150px;
        }

        .users-table {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1.5fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
        }

        .header-cell {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1.5fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-primary);
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background: var(--bg-secondary);
        }

        .table-row.clickable {
          cursor: pointer;
        }

        .table-row.clickable:hover {
          background: var(--bg-secondary);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .cell {
          display: flex;
          align-items: center;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .user-email {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .role-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .phone {
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .location-cell,
        .date-cell {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .actions-cell {
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .edit-btn {
          background: var(--color-primary);
          color: white;
        }

        .edit-btn:hover {
          background: var(--color-primary-hover);
        }

        .delete-btn {
          background: var(--color-error);
          color: white;
        }

        .delete-btn:hover {
          background: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .empty-state svg {
          color: var(--text-tertiary);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .access-denied,
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-primary);
          border-top: 4px solid var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          transition: background-color 0.2s;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--color-primary-hover);
        }

        /* Create User button resize/tighten */
        .create-user-btn {
          padding: 0.6rem 1rem;
          font-size: 0.95rem;
          border-radius: 8px;
        }

        .btn-secondary {
          background: var(--color-secondary-light);
          color: var(--text-primary);
        }

        .btn-secondary:hover {
          background: var(--color-secondary-hover);
        }

        /* User Details Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .user-details-modal {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0.5rem;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: var(--bg-secondary);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .user-details-grid {
          display: grid;
          gap: 2rem;
        }

        .detail-section h3 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          border-bottom: 2px solid var(--border-primary);
          padding-bottom: 0.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-primary);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: var(--text-secondary);
          min-width: 120px;
        }

        .detail-value {
          color: var(--text-primary);
          text-align: right;
          flex: 1;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.active {
          background: #10b981;
          color: white;
        }

        .status-badge.inactive {
          background: #6b7280;
          color: white;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid var(--border-primary);
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 1rem;
          }

          .admin-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .users-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .search-wrapper {
            max-width: none;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .header-cell {
            display: none;
          }

          .cell {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-primary);
          }

          .cell:last-child {
            border-bottom: none;
          }

          .user-cell::before { content: "User: "; font-weight: 600; }
          .role-cell::before { content: "Role: "; font-weight: 600; }
          .contact-cell::before { content: "Contact: "; font-weight: 600; }
          .location-cell::before { content: "Location: "; font-weight: 600; }
          .date-cell::before { content: "Created: "; font-weight: 600; }
          .actions-cell::before { content: "Actions: "; font-weight: 600; }
        }
      `}</style>
      </div>
    </div>
  );
};

export default AdminUserManagement;

