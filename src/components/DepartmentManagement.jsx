import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye,
  EyeOff,
  Building,
  Users,
  HeadphonesIcon,
  CreditCard,
  Phone,
  Mail,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Settings
} from 'lucide-react';
import { contactService } from '../services/contactService';

const DepartmentManagement = ({ userRole, showStats = true, showActions = true }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    icon: 'Building',
    title: '',
    description: '',
    contact: '',
    phone: '',
    email: '',
    isActive: true,
    order: 0
  });
  const [formError, setFormError] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalDepartments: 0,
    activeDepartments: 0,
    inactiveDepartments: 0
  });

  const icons = [
    { value: 'Building', label: 'Building', icon: Building },
    { value: 'Users', label: 'Users', icon: Users },
    { value: 'HeadphonesIcon', label: 'Headphones', icon: HeadphonesIcon },
    { value: 'CreditCard', label: 'Credit Card', icon: CreditCard },
    { value: 'Phone', label: 'Phone', icon: Phone },
    { value: 'Mail', label: 'Mail', icon: Mail },
    { value: 'Settings', label: 'Settings', icon: Settings }
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== '') params.isActive = statusFilter === 'active';

      const result = await contactService.getAllDepartments(params);
      if (result.success) {
        setDepartments(result.data.data.departments || []);
        calculateStats(result.data.data.departments || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (deptList) => {
    const totalDepartments = deptList.length;
    const activeDepartments = deptList.filter(dept => dept.isActive).length;
    const inactiveDepartments = totalDepartments - activeDepartments;

    setStats({
      totalDepartments,
      activeDepartments,
      inactiveDepartments
    });
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim() || !formData.description.trim() || !formData.email.trim()) {
      setFormError('Title, description, and email are required');
      return;
    }

    try {
      const result = await contactService.createDepartment(formData);
      if (result.success) {
        setShowCreateForm(false);
        resetForm();
        fetchDepartments();
      } else {
        setFormError(result.error);
      }
    } catch (err) {
      setFormError('Failed to create department');
    }
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim() || !formData.description.trim() || !formData.email.trim()) {
      setFormError('Title, description, and email are required');
      return;
    }

    try {
      const result = await contactService.updateDepartment(editingDepartment._id, formData);
      if (result.success) {
        setEditingDepartment(null);
        resetForm();
        fetchDepartments();
      } else {
        setFormError(result.error);
      }
    } catch (err) {
      setFormError('Failed to update department');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      const result = await contactService.deleteDepartment(id);
      if (result.success) {
        fetchDepartments();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to delete department');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      icon: 'Building',
      title: '',
      description: '',
      contact: '',
      phone: '',
      email: '',
      isActive: true,
      order: 0
    });
    setFormError(null);
  };

  const startEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      id: department.id,
      icon: department.icon,
      title: department.title,
      description: department.description,
      contact: department.contact,
      phone: department.phone,
      email: department.email,
      isActive: department.isActive,
      order: department.order
    });
  };

  const cancelEdit = () => {
    setEditingDepartment(null);
    resetForm();
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-[#E5E0D8] dark:border-[#2A342E]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#4B5563] dark:text-[#6B7A73]">{title}</p>
          <p className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">{value}</p>
        </div>
        <Icon className={`w-8 h-8 text-${color}-600`} />
      </div>
    </div>
  );

  const getIconComponent = (iconName) => {
    const iconObj = icons.find(icon => icon.value === iconName);
    return iconObj ? iconObj.icon : Building;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-[#4B5563] dark:text-[#6B7A73]">Loading departments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">Department Management</h2>
          <p className="text-[#4B5563] dark:text-[#6B7A73]">Manage contact departments and their information</p>
        </div>
        {showActions && (userRole === 'admin' || userRole === 'employee') && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Department
          </button>
        )}
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Departments" value={stats.totalDepartments} icon={Building} color="blue" />
          <StatCard title="Active Departments" value={stats.activeDepartments} icon={CheckCircle} color="green" />
          <StatCard title="Inactive Departments" value={stats.inactiveDepartments} icon={AlertCircle} color="red" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-[#E5E0D8] dark:border-[#2A342E]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4B5563] dark:text-[#A8B5AE]" size={20} />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingDepartment) && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[#E5E0D8] dark:border-[#2A342E]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingDepartment ? 'Edit Department' : 'Create New Department'}
            </h3>
            <button
              onClick={editingDepartment ? cancelEdit : () => setShowCreateForm(false)}
              className="text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#4B5563] dark:text-[#6B7A73]"
            >
              <X size={24} />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Department ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                  placeholder="e.g., property-sales"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                >
                  {icons.map(icon => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                placeholder="Enter department title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                placeholder="Enter department description..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                  placeholder="contact@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Display Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                  placeholder="display@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                  placeholder="+251 11 123 4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE]">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={editingDepartment ? cancelEdit : () => setShowCreateForm(false)}
                className="px-4 py-2 text-[#1A1A1A] dark:text-[#A8B5AE] bg-[#F8F4EC] dark:bg-[#141A17] rounded-lg hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B6E4F] dark:bg-[#0B6E4F] text-white rounded-lg hover:bg-[#0B6E4F] dark:hover:bg-[#0B6E4F] flex items-center gap-2"
              >
                <Save size={16} />
                {editingDepartment ? 'Update Department' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-lg shadow-sm border border-[#E5E0D8] dark:border-[#2A342E]">
            <Building className="w-12 h-12 text-[#4B5563] dark:text-[#A8B5AE] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">No Departments Found</h3>
            <p className="text-[#4B5563] dark:text-[#6B7A73]">
              {searchTerm || statusFilter 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first department.'}
            </p>
          </div>
        ) : (
          filteredDepartments.map((department) => {
            const IconComponent = getIconComponent(department.icon);
            return (
              <div key={department._id} className="bg-white rounded-lg p-6 shadow-sm border border-[#E5E0D8] dark:border-[#2A342E] hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#0B6E4F]/10 dark:bg-[#0B6E4F]/10 rounded-xl flex items-center justify-center">
                      <IconComponent size={24} className="text-[#0B6E4F] dark:text-[#0B6E4F]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">
                        {department.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        department.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {department.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {showActions && (userRole === 'admin' || userRole === 'employee') && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(department)}
                        className="p-2 text-[#0B6E4F] dark:text-[#0B6E4F] hover:text-[#0B6E4F] dark:text-[#0B6E4F]"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department._id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-[#4B5563] dark:text-[#6B7A73] mb-4 line-clamp-2">
                  {department.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#4B5563] dark:text-[#6B7A73]">
                    <Mail size={14} />
                    <span>{department.email}</span>
                  </div>
                  {department.phone && (
                    <div className="flex items-center gap-2 text-sm text-[#4B5563] dark:text-[#6B7A73]">
                      <Phone size={14} />
                      <span>{department.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[#4B5563] dark:text-[#6B7A73]">
                    <span>Order: {department.order}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;



