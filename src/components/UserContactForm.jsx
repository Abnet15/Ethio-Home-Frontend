import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contactService';
import { 
  Mail,
  Phone,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Tag
} from 'lucide-react';

const UserContactForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [myContacts, setMyContacts] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [showMyContacts, setShowMyContacts] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: '',
    inquiryType: 'general',
    sender: user?._id 
  });

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'property', label: 'Property Related' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'sales', label: 'Sales Inquiry' },
    { value: 'support', label: 'Customer Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch user's contact submissions
  const fetchMyContacts = async () => {
    try {
      const result = await contactService.getMyContacts(user._id);
      console.log('Fetched contacts:', result);
      if (result.success) {
        setMyContacts(result.data?.data?.contact || result.data?.contact || []);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchMyContacts();
    }
  }, [user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Submitting contact form with data: 😋😋😋😋', formData);
      const result = await contactService.submitContact(formData);
      if (result.success) {
        setSuccess('Your message has been sent successfully! We will get back to you soon.');
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
        fetchMyContacts(); // Refresh the list
        setShowForm(false);
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <AlertCircle size={16} className="text-[#0B6E4F] dark:text-[#0B6E4F]" />;
      case 'in-progress': return <Clock size={16} className="text-yellow-500" />;
      case 'resolved': return <CheckCircle size={16} className="text-green-500" />;
      case 'closed': return <CheckCircle size={16} className="text-[#4B5563] dark:text-[#6B7A73]" />;
      default: return <AlertCircle size={16} className="text-[#0B6E4F] dark:text-[#0B6E4F]" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-[#0B6E4F]/10 dark:bg-[#0B6E4F]/10 text-[#0B6E4F] dark:text-[#0B6E4F]';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-[#F8F4EC] dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#F8F4EC]';
      default: return 'bg-[#F8F4EC] dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#F8F4EC]';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-[#F8F4EC] dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#F8F4EC]';
    }
  };

  return (
    <div className="user-contact-form">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">Contact Support</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => { setShowForm(true); setShowMyContacts(false); }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                showForm ? 'bg-[#0B6E4F] dark:bg-[#0B6E4F] text-white' : 'bg-[#F8F4EC] dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]'
              }`}
            >
              New Message
            </button>
            <button
              onClick={() => { setShowForm(false); setShowMyContacts(true); }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                showMyContacts ? 'bg-[#0B6E4F] dark:bg-[#0B6E4F] text-white' : 'bg-[#F8F4EC] dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]'
              }`}
            >
              My Messages ({myContacts.length})
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC] mb-4">Send us a message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F]"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F]"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F]"
                  placeholder="+251912345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                  Inquiry Type *
                </label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F]"
                >
                  {inquiryTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F]"
                placeholder="Brief description of your inquiry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F]"
                placeholder="Please provide detailed information about your inquiry..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-[#0B6E4F] dark:bg-[#0B6E4F] text-white rounded-md hover:bg-[#0B6E4F] dark:hover:bg-[#0B6E4F] focus:outline-none focus:ring-2 focus:ring-[#0B6E4F] dark:focus:ring-[#0B6E4F] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {showMyContacts && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-[#E5E0D8] dark:border-[#2A342E]">
            <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">My Messages</h3>
            <p className="text-sm text-[#4B5563] dark:text-[#6B7A73] mt-1">Track your inquiries and responses from our team</p>
          </div>

          {myContacts.length === 0 ? (
            <div className="p-6 text-center">
              <Mail className="w-12 h-12 text-[#4B5563] dark:text-[#A8B5AE] mx-auto mb-4" />
              <p className="text-[#4B5563] dark:text-[#6B7A73]">No messages yet. Send your first inquiry!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E0D8] dark:divide-[#2A342E]">
              {myContacts.map((contact) => (
                <div key={contact._id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-medium text-[#1A1A1A] dark:text-[#F8F4EC]">{contact.subject}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                          {getStatusIcon(contact.status)}
                          <span className="ml-1 capitalize">{contact.status}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                          {contact.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[#4B5563] dark:text-[#6B7A73] mb-3">
                        <span className="flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          {inquiryTypes.find(t => t.value === contact.inquiryType)?.label || contact.inquiryType}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="bg-[#F8F4EC] dark:bg-[#0B0F0D] rounded-md p-3 mb-3">
                        <p className="text-sm text-[#1A1A1A] dark:text-[#A8B5AE]">{contact.message}</p>
                      </div>

                      {(contact.adminResponse || contact.employeeResponse) && (
                        <div className="bg-[#0B6E4F]/5 dark:bg-[#0B6E4F]/5 rounded-md p-3 border-l-4 border-[#0D8A62] dark:border-[#0D8A62]">
                          <div className="flex items-center mb-2">
                            <User className="w-4 h-4 text-[#0B6E4F] dark:text-[#0B6E4F] mr-2" />
                            <span className="text-sm font-medium text-blue-900">
                              Response from {contact.adminResponse ? 'Admin' : 'Employee'}
                            </span>
                          </div>
                          <p className="text-sm text-[#0B6E4F] dark:text-[#0B6E4F]">
                            {contact.adminResponse || contact.employeeResponse}
                          </p>
                          {contact.respondedAt && (
                            <p className="text-xs text-[#0B6E4F] dark:text-[#0B6E4F] mt-2">
                              Responded on {new Date(contact.respondedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserContactForm;

