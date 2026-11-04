import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Tag,
  Calendar,
  Eye,
  HelpCircle,
  Star,
  Mail,
  Phone,
  Building,
  Users,
  HeadphonesIcon,
  CreditCard,
  Settings
} from 'lucide-react';
import { contactService } from '../services/contactService';

const FAQViewer = ({ userRole }) => {
  const [faqs, setFaqs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [activeTab, setActiveTab] = useState('faqs');

  const categories = [
    'property', 'process', 'financing', 'account', 'search', 
    'technical', 'billing', 'general'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [faqsResult, departmentsResult] = await Promise.all([
        contactService.getContactFAQs(),
        contactService.getContactDepartments()
      ]);

      if (faqsResult.success) {
        setFaqs(faqsResult.data.data.faqs || []);
      }
      if (departmentsResult.success) {
        setDepartments(departmentsResult.data.data.departments || []);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRateFAQ = async (faqId, helpful) => {
    try {
      const result = await contactService.rateFAQ(faqId, helpful);
      if (result.success) {
        // Update the FAQ in the local state
        setFaqs(prevFaqs => 
          prevFaqs.map(faq => 
            faq._id === faqId 
              ? { 
                  ...faq, 
                  helpful: helpful ? faq.helpful + 1 : faq.helpful,
                  notHelpful: !helpful ? faq.notHelpful + 1 : faq.notHelpful
                }
              : faq
          )
        );
      }
    } catch (err) {
      console.error('Failed to rate FAQ:', err);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || faq.category === categoryFilter;
    return matchesSearch && matchesCategory && faq.isActive;
  });

  const getIconComponent = (iconName) => {
    const icons = {
      Building, Users, HeadphonesIcon, CreditCard, Mail, Phone, Settings
    };
    return icons[iconName] || Building;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-[#4B5563] dark:text-[#6B7A73]">Loading help center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">Help Center</h2>
        <p className="text-[#4B5563] dark:text-[#6B7A73]">Find answers to common questions and get in touch with our team</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-[#F8F4EC] dark:bg-[#141A17] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'faqs' 
                ? 'bg-white text-[#0B6E4F] dark:text-[#0B6E4F] shadow-sm' 
                : 'text-[#4B5563] dark:text-[#6B7A73] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
            }`}
          >
            <HelpCircle size={20} className="inline mr-2" />
            FAQs
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'departments' 
                ? 'bg-white text-[#0B6E4F] dark:text-[#0B6E4F] shadow-sm' 
                : 'text-[#4B5563] dark:text-[#6B7A73] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
            }`}
          >
            <Building size={20} className="inline mr-2" />
            Contact Departments
          </button>
        </div>
      </div>

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          {/* Search and Filters */}
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
            </div>
          </div>

          {/* FAQs List */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-[#E5E0D8] dark:border-[#2A342E]">
                <HelpCircle className="w-12 h-12 text-[#4B5563] dark:text-[#A8B5AE] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">No FAQs Found</h3>
                <p className="text-[#4B5563] dark:text-[#6B7A73]">
                  {searchTerm || categoryFilter 
                    ? 'Try adjusting your search or filters.'
                    : 'No frequently asked questions available at the moment.'}
                </p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div key={faq._id} className="bg-white rounded-lg shadow-sm border border-[#E5E0D8] dark:border-[#2A342E]">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">
                            {faq.question}
                          </h3>
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
                      </div>
                    </div>

                    {expandedFAQ === faq._id && (
                      <div className="mt-4 pt-4 border-t border-[#E5E0D8] dark:border-[#2A342E]">
                        <div className="mb-4">
                          <h4 className="font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">Full Answer:</h4>
                          <p className="text-[#1A1A1A] dark:text-[#A8B5AE] whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[#4B5563] dark:text-[#6B7A73]">Was this helpful?</span>
                          <button
                            onClick={() => handleRateFAQ(faq._id, true)}
                            className="flex items-center gap-1 px-3 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <ThumbsUp size={16} />
                            Yes
                          </button>
                          <button
                            onClick={() => handleRateFAQ(faq._id, false)}
                            className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <ThumbsDown size={16} />
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm border border-[#E5E0D8] dark:border-[#2A342E]">
                <Building className="w-12 h-12 text-[#4B5563] dark:text-[#A8B5AE] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-2">No Departments Available</h3>
                <p className="text-[#4B5563] dark:text-[#6B7A73]">Contact departments are not available at the moment.</p>
              </div>
            ) : (
              departments.map((department) => {
                const IconComponent = getIconComponent(department.icon);
                return (
                  <div key={department._id} className="bg-white rounded-lg p-6 shadow-sm border border-[#E5E0D8] dark:border-[#2A342E] hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#0B6E4F]/10 dark:bg-[#0B6E4F]/10 rounded-xl flex items-center justify-center">
                        <IconComponent size={24} className="text-[#0B6E4F] dark:text-[#0B6E4F]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">
                          {department.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>

                    <p className="text-[#4B5563] dark:text-[#6B7A73] mb-4">
                      {department.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#4B5563] dark:text-[#6B7A73]">
                        <Mail size={14} />
                        <a href={`mailto:${department.email}`} className="hover:text-[#0B6E4F] dark:hover:text-[#0B6E4F]">
                          {department.email}
                        </a>
                      </div>
                      {department.phone && (
                        <div className="flex items-center gap-2 text-sm text-[#4B5563] dark:text-[#6B7A73]">
                          <Phone size={14} />
                          <a href={`tel:${department.phone}`} className="hover:text-[#0B6E4F] dark:hover:text-[#0B6E4F]">
                            {department.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#E5E0D8] dark:border-[#2A342E]">
                      <button className="w-full bg-[#0B6E4F] dark:bg-[#0B6E4F] text-white py-2 px-4 rounded-lg hover:bg-[#0B6E4F] dark:hover:bg-[#0B6E4F] transition-colors">
                        Contact This Department
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default FAQViewer;



