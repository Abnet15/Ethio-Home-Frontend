import { 
  Shield, 
  Users, 
  Settings, 
  Eye, 
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Key,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Crown,
  Star,
  Award,
  Activity,
  Database,
  FileText,
  BarChart3,
  MessageSquare,
  Bell,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { userService } from '../services/userService';


const AdminRoleManagement = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('roles');
  const [error, setError] = useState(null);

  // Admin roles and permissions
  const [adminRoles, setAdminRoles] = useState([
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access and control',
      level: 'super',
      permissions: [
        'user_management',
        'role_management', 
        'system_settings',
        'data_management',
        'security_settings',
        'audit_logs',
        'backup_restore',
        'api_access'
      ],
      users: ['admin@example.com'],
      createdAt: '2024-01-01',
      color: '#dc2626'
    },
    {
      id: 2,
      name: 'Property Admin',
      description: 'Manage properties and listings',
      level: 'admin',
      permissions: [
        'property_management',
        'listing_approval',
        'property_verification',
        'media_management'
      ],
      users: ['property.admin@example.com'],
      createdAt: '2024-01-15',
      color: '#2563eb'
    },
    {
      id: 3,
      name: 'User Admin',
      description: 'Manage users and accounts',
      level: 'admin',
      permissions: [
        'user_management',
        'account_verification',
        'user_support',
        'communication_tools'
      ],
      users: ['user.admin@example.com'],
      createdAt: '2024-01-15',
      color: '#059669'
    },
    {
      id: 4,
      name: 'Content Moderator',
      description: 'Moderate content and communications',
      level: 'moderator',
      permissions: [
        'content_moderation',
        'chat_moderation',
        'review_management',
        'report_handling'
      ],
      users: ['moderator@example.com'],
      createdAt: '2024-02-01',
      color: '#d97706'
    },
    {
      id: 5,
      name: 'Analytics Admin',
      description: 'View reports and analytics',
      level: 'analyst',
      permissions: [
        'analytics_access',
        'report_generation',
        'data_export',
        'dashboard_access'
      ],
      users: ['analyst@example.com'],
      createdAt: '2024-02-15',
      color: '#7c3aed'
    },
    {
      id: 9,
      name: 'Customer Service Rep',
      description: 'Handles customer inquiries and provides support',
      level: 'employee',
      permissions: [
        'user_support',
        'communication_tools',
        'customer_onboarding',
        'appointment_scheduling',
        'internal_communication'
      ],
      users: ['csr@example.com'],
      createdAt: '2024-04-01',
      color: '#10b981'
    },
    {
      id: 10,
      name: 'Data Entry Clerk',
      description: 'Manages data input and document processing',
      level: 'employee',
      permissions: [
        'document_processing',
        'task_management',
        'basic_reporting'
      ],
      users: ['data.entry@example.com'],
      createdAt: '2024-04-10',
      color: '#f59e0b'
    },
    {
      id: 11,
      name: 'Marketing Assistant',
      description: 'Assists with marketing campaigns and content creation',
      level: 'employee',
      permissions: [
        'marketing_support',
        'media_management',
        'internal_communication'
      ],
      users: ['marketing.assistant@example.com'],
      createdAt: '2024-04-20',
      color: '#6366f1'
    },
    {
      id: 12,
      name: 'Legal Assistant',
      description: 'Provides support for legal and compliance matters',
      level: 'employee',
      permissions: [
        'document_processing',
        'legal_compliance',
        'internal_communication'
      ],
      users: ['legal.assistant@example.com'],
      createdAt: '2024-05-01',
      color: '#ef4444'
    }
  ]);

  const [permissions, setPermissions] = useState([
    { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete user accounts', category: 'Users' },
    { id: 'role_management', name: 'Role Management', description: 'Manage admin roles and permissions', category: 'Security' },
    { id: 'property_management', name: 'Property Management', description: 'Manage property listings and details', category: 'Properties' },
    { id: 'listing_approval', name: 'Listing Approval', description: 'Approve or reject property listings', category: 'Properties' },
    { id: 'property_verification', name: 'Property Verification', description: 'Verify property authenticity and documents', category: 'Properties' },
    { id: 'media_management', name: 'Media Management', description: 'Manage property images and videos', category: 'Content' },
    { id: 'content_moderation', name: 'Content Moderation', description: 'Moderate user-generated content', category: 'Content' },
    { id: 'chat_moderation', name: 'Chat Moderation', description: 'Monitor and moderate chat communications', category: 'Communication' },
    { id: 'review_management', name: 'Review Management', description: 'Manage property and agent reviews', category: 'Content' },
    { id: 'report_handling', name: 'Report Handling', description: 'Handle user reports and complaints', category: 'Support' },
    { id: 'system_settings', name: 'System Settings', description: 'Configure system-wide settings', category: 'System' },
    { id: 'data_management', name: 'Data Management', description: 'Manage system data and databases', category: 'System' },
    { id: 'security_settings', name: 'Security Settings', description: 'Configure security and authentication', category: 'Security' },
    { id: 'audit_logs', name: 'Audit Logs', description: 'View system audit logs and activities', category: 'Security' },
    { id: 'backup_restore', name: 'Backup & Restore', description: 'Manage system backups and restoration', category: 'System' },
    { id: 'api_access', name: 'API Access', description: 'Access system APIs and integrations', category: 'System' },
    { id: 'analytics_access', name: 'Analytics Access', description: 'View system analytics and metrics', category: 'Analytics' },
    { id: 'report_generation', name: 'Report Generation', description: 'Generate custom reports', category: 'Analytics' },
    { id: 'data_export', name: 'Data Export', description: 'Export system data', category: 'Analytics' },
    { id: 'dashboard_access', name: 'Dashboard Access', description: 'Access admin dashboard', category: 'Analytics' },
    { id: 'account_verification', name: 'Account Verification', description: 'Verify user accounts and documents', category: 'Users' },
    { id: 'user_support', name: 'User Support', description: 'Provide user support and assistance', category: 'Support' },
    { id: 'customer_onboarding', name: 'Customer Onboarding', description: 'Assist new customers with setup', category: 'Users' },
    { id: 'document_processing', name: 'Document Processing', description: 'Handle and process various documents', category: 'System' },
    { id: 'appointment_scheduling', name: 'Appointment Scheduling', description: 'Manage and schedule appointments', category: 'Communication' },
    { id: 'inventory_management', name: 'Inventory Management', description: 'Manage property inventory and availability', category: 'Properties' },
    { id: 'basic_reporting', name: 'Basic Reporting', description: 'Generate basic reports and summaries', category: 'Analytics' },
    { id: 'internal_communication', name: 'Internal Communication', description: 'Communicate with internal teams', category: 'Communication' },
    { id: 'task_management', name: 'Task Management', description: 'Manage and track assigned tasks', category: 'System' },
    { id: 'client_relations', name: 'Client Relations', description: 'Manage client relationships and inquiries', category: 'Users' },
    { id: 'payment_processing', name: 'Payment Processing', description: 'Process payments and financial transactions', category: 'System' },
    { id: 'marketing_support', name: 'Marketing Support', description: 'Assist with marketing activities and content creation', category: 'Content' },
    { id: 'technical_support', name: 'Technical Support', description: 'Provide basic technical assistance', category: 'Support' },
    { id: 'training_development', name: 'Training & Development', description: 'Assist in employee training and development', category: 'System' },
    { id: 'legal_compliance', name: 'Legal Compliance', description: 'Ensure adherence to legal and regulatory standards', category: 'Security' }
  ]);

  const [adminUsers, setAdminUsers] = useState([
    {
      id: 1,
      name: 'Super Admin',
      email: 'admin@example.com',
      role: 'Super Admin',
      roleId: 1,
      status: 'active',
      lastLogin: '2024-07-29T10:30:00Z',
      createdAt: '2024-01-01',
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Property Manager',
      email: 'property.admin@example.com',
      role: 'Property Admin',
      roleId: 2,
      status: 'active',
      lastLogin: '2024-07-28T15:45:00Z',
      createdAt: '2024-01-15',
      permissions: ['property_management', 'listing_approval', 'property_verification', 'media_management']
    },
    {
      id: 3,
      name: 'User Manager',
      email: 'user.admin@example.com',
      role: 'User Admin',
      roleId: 3,
      status: 'active',
      lastLogin: '2024-07-27T09:20:00Z',
      createdAt: '2024-01-15',
      permissions: ['user_management', 'account_verification', 'user_support', 'communication_tools']
    },
    {
      id: 4,
      name: 'Content Moderator',
      email: 'moderator@example.com',
      role: 'Content Moderator',
      roleId: 4,
      status: 'active',
      lastLogin: '2024-07-29T08:15:00Z',
      createdAt: '2024-02-01',
      permissions: ['content_moderation', 'chat_moderation', 'review_management', 'report_handling']
    },
    {
      id: 6,
      name: 'Marketing Specialist',
      email: 'marketing.manager@example.com',
      role: 'Marketing Manager',
      roleId: 6,
      status: 'active',
      lastLogin: '2024-07-25T11:00:00Z',
      createdAt: '2024-03-01',
      permissions: ['media_management', 'content_moderation', 'analytics_access', 'communication_tools']
    },
    {
      id: 7,
      name: 'Customer Support Rep',
      email: 'customer.support@example.com',
      role: 'Customer Support',
      roleId: 7,
      status: 'active',
      lastLogin: '2024-07-29T09:00:00Z',
      createdAt: '2024-03-10',
      permissions: ['user_support', 'communication_tools', 'report_handling']
    },
    {
      id: 5,
      name: 'Data Analyst',
      email: 'analyst@example.com',
      role: 'Analytics Admin',
      roleId: 5,
      status: 'active',
      lastLogin: '2024-07-26T14:30:00Z',
      createdAt: '2024-02-15',
      permissions: ['analytics_access', 'report_generation', 'data_export', 'dashboard_access']
    },
    {
      id: 9,
      name: 'Customer Service Rep',
      email: 'csr@example.com',
      role: 'Customer Service Rep',
      roleId: 9,
      status: 'active',
      lastLogin: '2024-07-29T09:00:00Z',
      createdAt: '2024-04-01',
      permissions: ['user_support', 'communication_tools', 'customer_onboarding', 'appointment_scheduling', 'internal_communication']
    },
    {
      id: 10,
      name: 'Data Entry Clerk',
      email: 'data.entry@example.com',
      role: 'Data Entry Clerk',
      roleId: 10,
      status: 'active',
      lastLogin: '2024-07-29T09:00:00Z',
      createdAt: '2024-04-10',
      permissions: ['document_processing', 'task_management', 'basic_reporting']
    },
    {
      id: 11,
      name: 'Marketing Assistant',
      email: 'marketing.assistant@example.com',
      role: 'Marketing Assistant',
      roleId: 11,
      status: 'active',
      lastLogin: '2024-07-29T09:00:00Z',
      createdAt: '2024-04-20',
      permissions: ['marketing_support', 'media_management', 'internal_communication']
    },
    {
      id: 12,
      name: 'Legal Assistant',
      email: 'legal.assistant@example.com',
      role: 'Legal Assistant',
      roleId: 12,
      status: 'active',
      lastLogin: '2024-07-29T09:00:00Z',
      createdAt: '2024-05-01',
      permissions: ['document_processing', 'legal_compliance', 'internal_communication']
    }
  ]);

  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    level: 'moderator',
    permissions: [],
    color: '#6b7280'
  });

  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    password: '',
    passwordConfirm: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch users to populate admin users list
        const usersResult = await userService.getUsers();
        if (usersResult.success) {
          const fetchedUsers = usersResult.data?.data?.data || usersResult.data?.data || [];
          // Filter only admin users
          const adminUsersList = fetchedUsers.filter(user => 
            ['admin', 'employee'].includes(user.role)
          );
          setAdminUsers(adminUsersList.map((user, index) => ({
            id: user._id || index + 1,
            name: user.name,
            email: user.email,
            role: user.role === 'admin' ? 'Super Admin' : 'Employee',
            roleId: user.role === 'admin' ? 1 : 2,
            status: user.status || 'active',
            lastLogin: user.lastLogin || null,
            createdAt: user.createdAt || new Date().toISOString().split('T')[0],
            permissions: user.permissions || []
          })));
        } else {
          setError(usersResult.error);
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleRoleInputChange = (e) => {
    setRoleFormData({
      ...roleFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminInputChange = (e) => {
    setAdminFormData({
      ...adminFormData,
      [e.target.name]: e.target.value
    });
  };

  const handlePermissionToggle = (permissionId) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!roleFormData.name || !roleFormData.description) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (roleFormData.permissions.length === 0) {
      setMessage('Please select at least one permission');
      return;
    }

    try {
      const newRole = {
        id: adminRoles.length + 1,
        ...roleFormData,
        users: [],
        createdAt: new Date().toISOString().split('T')[0]
      };

      if (editingRole) {
        setAdminRoles(adminRoles.map(role => 
          role.id === editingRole.id ? { ...newRole, id: editingRole.id } : role
        ));
        setMessage('Role updated successfully!');
        setEditingRole(null);
      } else {
        setAdminRoles([...adminRoles, newRole]);
        setMessage('Role created successfully!');
      }

      setRoleFormData({
        name: '',
        description: '',
        level: 'moderator',
        permissions: [],
        color: '#6b7280'
      });
      setShowCreateRole(false);
    } catch (error) {
      setMessage('Failed to save role');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setMessage('');

    if (adminFormData.password !== adminFormData.passwordConfirm) {
      setMessage('Passwords do not match');
      return;
    }

    if (adminFormData.password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }

    if (!adminFormData.roleId) {
      setMessage('Please select a role');
      return;
    }

    try {
      const selectedRole = adminRoles.find(role => role.id === parseInt(adminFormData.roleId));
      const newAdmin = {
        id: adminUsers.length + 1,
        ...adminFormData,
        role: selectedRole.name,
        status: 'active',
        lastLogin: null,
        createdAt: new Date().toISOString().split('T')[0],
        permissions: selectedRole.permissions
      };

      if (editingAdmin) {
        setAdminUsers(adminUsers.map(admin => 
          admin.id === editingAdmin.id ? { ...newAdmin, id: editingAdmin.id } : admin
        ));
        setMessage('Admin updated successfully!');
        setEditingAdmin(null);
      } else {
        setAdminUsers([...adminUsers, newAdmin]);
        setMessage('Admin created successfully!');
      }

      setAdminFormData({
        name: '',
        email: '',
        roleId: '',
        password: '',
        passwordConfirm: ''
      });
      setShowCreateAdmin(false);
    } catch (error) {
      setMessage('Failed to save admin');
    }
  };

  const handleEditRole = (role) => {
    setRoleFormData({
      name: role.name,
      description: role.description,
      level: role.level,
      permissions: role.permissions,
      color: role.color
    });
    setEditingRole(role);
    setShowCreateRole(true);
  };

  const handleEditAdmin = (admin) => {
    setAdminFormData({
      name: admin.name,
      email: admin.email,
      roleId: admin.roleId.toString(),
      password: '',
      passwordConfirm: ''
    });
    setEditingAdmin(admin);
    setShowCreateAdmin(true);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setAdminRoles(adminRoles.filter(role => role.id !== roleId));
      setMessage('Role deleted successfully!');
    }
  };

  const handleDeleteAdmin = (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      setAdminUsers(adminUsers.filter(admin => admin.id !== adminId));
      setMessage('Admin deleted successfully!');
    }
  };

  const handleToggleAdminStatus = (adminId) => {
    setAdminUsers(adminUsers.map(admin => 
      admin.id === adminId 
        ? { ...admin, status: admin.status === 'active' ? 'suspended' : 'active' }
        : admin
    ));
    setMessage('Admin status updated successfully!');
  };

  const handleCancel = () => {
    setRoleFormData({
      name: '',
      description: '',
      level: 'moderator',
      permissions: [],
      color: '#6b7280'
    });
    setAdminFormData({
      name: '',
      email: '',
      roleId: '',
      password: '',
      passwordConfirm: ''
    });
    setEditingRole(null);
    setEditingAdmin(null);
    setShowCreateRole(false);
    setShowCreateAdmin(false);
    setMessage('');
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'super': return Crown;
      case 'admin': return Shield;
      case 'moderator': return UserCheck;
      case 'analyst': return BarChart3;
      default: return Settings;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'super': return '#dc2626';
      case 'admin': return '#2563eb';
      case 'moderator': return '#d97706';
      case 'analyst': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  const getPermissionIcon = (category) => {
    switch (category) {
      case 'Users': return Users;
      case 'Security': return Shield;
      case 'Properties': return Database;
      case 'Content': return FileText;
      case 'Communication': return MessageSquare;
      case 'Support': return Bell;
      case 'System': return Settings;
      case 'Analytics': return BarChart3;
      default: return Activity;
    }
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <Shield size={48} />
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
          <p>Loading admin roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <button 
            className="back-btn"
            onClick={() => navigate('/admin-dashboard')}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1>Admin Role Management</h1>
          <p>Manage admin roles, permissions, and user assignments</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowCreateRole(true)}
          >
            <Plus size={16} />
            Create Role
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateAdmin(true)}
          >
            <UserPlus size={16} />
            Create Admin
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Shield size={16} />
          Roles & Permissions
        </button>
        <button
          className={`tab ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          <Users size={16} />
          Admin Users
        </button>
        <button
          className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <Key size={16} />
          All Permissions
        </button>
      </div>

      {/* Create/Edit Role Modal */}
      {showCreateRole && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
              <button className="close-button" onClick={handleCancel}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Role Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={roleFormData.name}
                    onChange={handleRoleInputChange}
                    placeholder="Enter role name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="level">Role Level</label>
                  <select
                    id="level"
                    name="level"
                    value={roleFormData.level}
                    onChange={handleRoleInputChange}
                    required
                  >
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="analyst">Analyst</option>
                    <option value="super">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={roleFormData.description}
                  onChange={handleRoleInputChange}
                  placeholder="Describe the role's responsibilities"
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="color">Role Color</label>
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={roleFormData.color}
                    onChange={handleRoleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-grid">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="permission-category">
                      <div className="category-header">
                        {React.createElement(getPermissionIcon(category), { size: 16 })}
                        <span>{category}</span>
                      </div>
                      <div className="permission-list">
                        {perms.map((permission) => (
                          <label key={permission.id} className="permission-item">
                            <input
                              type="checkbox"
                              checked={roleFormData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                            />
                            <div className="permission-info">
                              <div className="permission-name">{permission.name}</div>
                              <div className="permission-description">{permission.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Admin Modal */}
      {showCreateAdmin && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingAdmin ? 'Edit Admin' : 'Create New Admin'}</h2>
              <button className="close-button" onClick={handleCancel}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="adminName">Full Name</label>
                  <input
                    type="text"
                    id="adminName"
                    name="name"
                    value={adminFormData.name}
                    onChange={handleAdminInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adminEmail">Email Address</label>
                  <input
                    type="email"
                    id="adminEmail"
                    name="email"
                    value={adminFormData.email}
                    onChange={handleAdminInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="roleId">Admin Role</label>
                <select
                  id="roleId"
                  name="roleId"
                  value={adminFormData.roleId}
                  onChange={handleAdminInputChange}
                  required
                >
                  <option value="">Select a role</option>
                  {adminRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="adminPassword">Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="adminPassword"
                      name="password"
                      value={adminFormData.password}
                      onChange={handleAdminInputChange}
                      placeholder="Enter password"
                      required={!editingAdmin}
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
                  <label htmlFor="adminPasswordConfirm">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      id="adminPasswordConfirm"
                      name="passwordConfirm"
                      value={adminFormData.passwordConfirm}
                      onChange={handleAdminInputChange}
                      placeholder="Confirm password"
                      required={!editingAdmin}
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
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="roles-grid">
          {adminRoles.map((role) => {
            const LevelIcon = getLevelIcon(role.level);
            return (
              <div key={role.id} className="role-card">
                <div className="role-header">
                  <div className="role-info">
                    <div className="role-icon" style={{ backgroundColor: role.color }}>
                      <LevelIcon size={20} />
                    </div>
                    <div>
                      <h3>{role.name}</h3>
                      <p>{role.description}</p>
                    </div>
                  </div>
                  <div className="role-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditRole(role)}
                      title="Edit role"
                    >
                      <Edit size={14} />
                    </button>
                    {role.level !== 'super' && (
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteRole(role.id)}
                        title="Delete role"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="role-stats">
                  <div className="stat">
                    <Users size={16} />
                    <span>{role.users.length} users</span>
                  </div>
                  <div className="stat">
                    <Key size={16} />
                    <span>{role.permissions.length} permissions</span>
                  </div>
                  <div className="stat">
                    <Calendar size={16} />
                    <span>Created {role.createdAt}</span>
                  </div>
                </div>

                <div className="role-permissions">
                  <h4>Permissions</h4>
                  <div className="permission-tags">
                    {role.permissions.slice(0, 4).map((permissionId) => {
                      const permission = permissions.find(p => p.id === permissionId);
                      return permission ? (
                        <span key={permissionId} className="permission-tag">
                          {permission.name}
                        </span>
                      ) : null;
                    })}
                    {role.permissions.length > 4 && (
                      <span className="permission-tag more">
                        +{role.permissions.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Users Tab */}
      {activeTab === 'admins' && (
        <div className="admins-table">
          <div className="table-header">
            <div className="header-cell">Admin</div>
            <div className="header-cell">Role</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Last Login</div>
            <div className="header-cell">Created</div>
            <div className="header-cell">Actions</div>
          </div>

          {adminUsers.map((admin) => {
            const role = adminRoles.find(r => r.id === admin.roleId);
            const LevelIcon = role ? getLevelIcon(role.level) : Settings;
            
            return (
              <div key={admin.id} className="table-row">
                <div className="cell admin-cell">
                  <div className="admin-info">
                    <div className="admin-avatar">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="admin-name">{admin.name}</div>
                      <div className="admin-email">{admin.email}</div>
                    </div>
                  </div>
                </div>
                
                <div className="cell role-cell">
                  <div className="role-badge" style={{ backgroundColor: role?.color || '#6b7280' }}>
                    <LevelIcon size={14} />
                    <span>{admin.role}</span>
                  </div>
                </div>
                
                <div className="cell status-cell">
                  <div className={`status-badge ${admin.status}`}>
                    {admin.status === 'active' ? <CheckCircle size={14} /> : <UserX size={14} />}
                    <span>{admin.status}</span>
                  </div>
                </div>
                
                <div className="cell login-cell">
                  <div className="login-info">
                    <Clock size={14} />
                    <span>{formatLastLogin(admin.lastLogin)}</span>
                  </div>
                </div>
                
                <div className="cell date-cell">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </div>
                
                <div className="cell actions-cell">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditAdmin(admin)}
                    title="Edit admin"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className={`action-btn ${admin.status === 'active' ? 'suspend-btn' : 'activate-btn'}`}
                    onClick={() => handleToggleAdminStatus(admin.id)}
                    title={admin.status === 'active' ? 'Suspend admin' : 'Activate admin'}
                  >
                    {admin.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  {admin.email !== 'admin@example.com' && (
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteAdmin(admin.id)}
                      title="Delete admin"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {adminUsers.length === 0 && (
            <div className="empty-state">
              <Users size={48} />
              <h3>No admin users found</h3>
              <p>Create your first admin user to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* All Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="permissions-overview">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category} className="permission-category-card">
              <div className="category-header">
                {React.createElement(getPermissionIcon(category), { size: 20 })}
                <h3>{category}</h3>
                <span className="permission-count">{perms.length} permissions</span>
              </div>
              
              <div className="permission-list">
                {perms.map((permission) => (
                  <div key={permission.id} className="permission-item">
                    <div className="permission-info">
                      <div className="permission-name">{permission.name}</div>
                      <div className="permission-description">{permission.description}</div>
                    </div>
                    <div className="permission-usage">
                      <span>Used in {adminRoles.filter(role => role.permissions.includes(permission.id)).length} roles</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .admin-container {
          max-width: 1400px;
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

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .admin-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .tab {
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        .tab.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .role-card {
          background: var(--card-bg);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-primary);
        }

        .role-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .role-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .role-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .role-info h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .role-info p {
          margin: 0.25rem 0 0 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .role-actions {
          display: flex;
          gap: 0.5rem;
        }

        .role-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem 0;
          border-top: 1px solid var(--border-primary);
          border-bottom: 1px solid var(--border-primary);
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .role-permissions h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .permission-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .permission-tag {
          background: var(--color-primary-light);
          color: var(--color-primary);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .permission-tag.more {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .admins-table {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1.5fr;
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
          grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1.5fr;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-primary);
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background: var(--bg-secondary);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .cell {
          display: flex;
          align-items: center;
        }

        .admin-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .admin-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .admin-email {
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
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.active {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .status-badge.suspended {
          background: var(--color-error-light);
          color: var(--color-error);
        }

        .login-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

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

        .suspend-btn {
          background: var(--color-warning);
          color: white;
        }

        .suspend-btn:hover {
          background: #d97706;
        }

        .activate-btn {
          background: var(--color-success);
          color: white;
        }

        .activate-btn:hover {
          background: #059669;
        }

        .permissions-overview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .permission-category-card {
          background: var(--card-bg);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-primary);
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .category-header h3 {
          margin: 0;
          color: var(--text-primary);
          flex: 1;
        }

        .permission-count {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .permission-list .permission-item {
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .permission-list .permission-item:last-child {
          border-bottom: none;
        }

        .permission-info .permission-name {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .permission-info .permission-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .permission-usage {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-align: right;
        }

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

        .modal {
          background: var(--bg-primary);
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
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

        .modal-form {
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

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid var(--border-primary);
          border-radius: 6px;
          font-size: 1rem;
          background: var(--input-bg);
          color: var(--text-primary);
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 0.25rem;
        }

        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem


}

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: var(--color-primary-hover);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .message.success {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .message.error {
          background: var(--color-error-light);
          color: var(--color-error);
        }

        .access-denied,
        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: var(--text-secondary);
          text-align: center;
        }

        .access-denied h2,
        .empty-state h3 {
          margin-top: 1rem;
          color: var(--text-primary);
        }

        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: var(--color-primary);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
          }

          .header-cell,
          .cell {
            justify-content: center;
            text-align: center;
          }

          .admin-info {
            flex-direction: column;
            text-align: center;
          }

          .role-badge,
          .status-badge,
          .login-info {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminRoleManagement;


