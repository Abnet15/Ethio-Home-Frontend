import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Tag,
  Calendar,
  User,
  MoreVertical,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { contactService } from '../services/contactService';

const FAQManagement = ({ userRole, showStats = true, showActions = true }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    question: '',
    answer: '',
    category: 'general',
    isActive: true,
    order: 0,
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalFAQs: 0,
    activeFAQs: 0,
    inactiveFAQs: 0,
    totalViews: 0,
    totalHelpful: 0
  });

  const categories = [
    'property', 'process', 'financing', 'account', 'search', 
    'technical', 'billing', 'general'
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter !== '') params.isActive = statusFilter === 'active';

      const result = await contactService.getAllFAQs(params);
      if (result.success) {
        setFaqs(result.data.data.faqs || []);
        calculateStats(result.data.data.faqs || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (faqList) => {
    const totalFAQs = faqList.length;
    const activeFAQs = faqList.filter(faq => faq.isActive).length;
    const inactiveFAQs = totalFAQs - activeFAQs;
    const totalViews = faqList.reduce((sum, faq) => sum + (faq.viewCount || 0), 0);
    const totalHelpful = faqList.reduce((sum, faq) => sum + (faq.helpful || 0), 0);

    setStats({
      totalFAQs,
      activeFAQs,
      inactiveFAQs,
      totalViews,
      totalHelpful
    });
  };

  const handleCreateFAQ = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.question.trim() || !formData.answer.trim()) {
      setFormError('Question and answer are required');
      return;
    }

    try {
      const result = await contactService.createFAQ(formData);
      if (result.success) {
        setShowCreateForm(false);
        resetForm();
        fetchFAQs();
      } else {
        setFormError(result.error);
      }
    } catch (err) {
      setFormError('Failed to create FAQ');
    }
  };

  const handleUpdateFAQ = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.question.trim() || !formData.answer.trim()) {
      setFormError('Question and answer are required');
      return;
    }

    try {
      const result = await contactService.updateFAQ(editingFAQ._id, formData);
      if (result.success) {
        setEditingFAQ(null);
        resetForm();
        fetchFAQs();
      } else {
        setFormError(result.error);
      }
    } catch (err) {
      setFormError('Failed to update FAQ');
    }
  };

  const handleDeleteFAQ = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const result = await contactService.deleteFAQ(id);
      if (result.success) {
        fetchFAQs();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to delete FAQ');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      question: '',
      answer: '',
      category: 'general',
      isActive: true,
      order: 0,
      tags: []
    });
    setTagInput('');
    setFormError(null);
  };

  const startEdit = (faq) => {
    setEditingFAQ(faq);
    setFormData({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive,
      order: faq.order,
      tags: faq.tags || []
    });
    setTagInput('');
  };

  const cancelEdit = () => {
    setEditingFAQ(null);
    resetForm();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-[#4B5563] dark:text-[#6B7A73]">Loading FAQs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">FAQ Management</h2>
          <p className="text-[#4B5563] dark:text-[#6B7A73]">Manage frequently asked questions and answers</p>
        </div>
        {showActions && (userRole === 'admin' || userRole === 'employee') && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add New FAQ
          </button>
        )}
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total FAQs" value={stats.totalFAQs} icon={MessageSquare} color="blue" />
          <StatCard title="Active FAQs" value={stats.activeFAQs} icon={CheckCircle} color="green" />
          <StatCard title="Inactive FAQs" value={stats.inactiveFAQs} icon={AlertCircle} color="red" />
          <StatCard title="Total Views" value={stats.totalViews} icon={Eye} color="purple" />
          <StatCard title="Helpful Votes" value={stats.totalHelpful} icon={ThumbsUp} color="orange" />
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
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
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
      {(showCreateForm || editingFAQ) && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-[#E5E0D8] dark:border-[#2A342E]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
            </h3>
            <button
              onClick={editingFAQ ? cancelEdit : () => setShowCreateForm(false)}
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

          <form onSubmit={editingFAQ ? handleUpdateFAQ : handleCreateFAQ} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  FAQ ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                  placeholder="e.g., property-listing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                Question *
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                placeholder="Enter the question..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                Answer *
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                placeholder="Enter the answer..."
                required
              />
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

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-lg focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] focus:border-transparent"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-[#F8F4EC] dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#A8B5AE] rounded-lg hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#0B6E4F]/10 dark:bg-[#0B6E4F]/10 text-[#0B6E4F] dark:text-[#0B6E4F] text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-[#0B6E4F] dark:text-[#0B6E4F] hover:text-[#0B6E4F] dark:text-[#0B6E4F]"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={editingFAQ ? cancelEdit : () => setShowCreateForm(false)}
                className="px-4 py-2 text-[#1A1A1A] dark:text-[#A8B5AE] bg-[#F8F4EC] dark:bg-[#141A17] rounded-lg hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B6E4F] dark:bg-[#0B6E4F] text-white rounded-lg hover:bg-[#0B6E4F] dark:hover:bg-[#0B6E4F] flex items-center gap-2"
              >
                <Save size={16} />
                {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQs List */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E0D8] dark:border-[#2A342E]">
        {filteredFAQs.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-[#4B5563] dark:text-[#A8B5AE] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">No FAQs Found</h3>
            <p className="text-[#4B5563] dark:text-[#6B7A73]">
              {searchTerm || categoryFilter || statusFilter 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first FAQ.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E0D8] dark:divide-[#2A342E]">
            {filteredFAQs.map((faq) => (
              <div key={faq._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">
                        {faq.question}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        faq.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-[#0B6E4F]/10 dark:bg-[#0B6E4F]/10 text-[#0B6E4F] dark:text-[#0B6E4F] rounded-full">
                        {faq.category}
                      </span>
                    </div>
                    
                    <p className="text-[#4B5563] dark:text-[#6B7A73] mb-3 line-clamp-2">
                      {faq.answer}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-[#4B5563] dark:text-[#6B7A73]">
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {faq.viewCount || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={14} />
                        {faq.helpful || 0} helpful
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown size={14} />
                        {faq.notHelpful || 0} not helpful
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(faq.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {faq.tags && faq.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {faq.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-[#F8F4EC] dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#A8B5AE] rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq._id ? null : faq._id)}
                      className="p-2 text-[#4B5563] dark:text-[#A8B5AE] hover:text-[#4B5563] dark:text-[#6B7A73]"
                    >
                      {expandedFAQ === faq._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {showActions && (userRole === 'admin' || userRole === 'employee') && (
                      <>
                        <button
                          onClick={() => startEdit(faq)}
                          className="p-2 text-[#0B6E4F] dark:text-[#0B6E4F] hover:text-[#0B6E4F] dark:text-[#0B6E4F]"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq._id)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {expandedFAQ === faq._id && (
                  <div className="mt-4 p-4 bg-[#F8F4EC] dark:bg-[#0B0F0D] rounded-lg">
                    <h4 className="font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">Full Answer:</h4>
                    <p className="text-[#1A1A1A] dark:text-[#A8B5AE] whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
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

export default FAQManagement;



