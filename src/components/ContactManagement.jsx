import { 
  Mail,
  Phone,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Archive,
  Tag,
  UserPlus,
  Filter,
  Search,
  Calendar,
  Star,
  Reply
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contactService';
import { userService } from '../services/userService';

const ContactManagement = ({ userRole, showStats = true, showActions = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [employees, setEmployees] = useState([]);

  // Form states
  const [responseForm, setResponseForm] = useState({
    status: '',
    adminResponse: '',
    employeeResponse: '',
    priority: ''
  });
  const [noteForm, setNoteForm] = useState({ content: '' });
  const [assignForm, setAssignForm] = useState({ assignedTo: '' });

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await contactService.getAllContacts();
      if (result.success) {
        setContacts(result.data?.data?.contacts || result.data?.contacts || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const result = await contactService.getContactStats();
      if (result.success) {
        setStats(result.data?.data || result.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchContacts();
    if (showStats) {
      fetchStats();
    }
    // Load employees for assignment (admins only)
    const loadEmployees = async () => {
      if (userRole !== 'admin') return;
      try {
        const res = await userService.getUsers({ role: 'employee', limit: 200 });
        if (res.success) {
          const list = res.data?.data?.data || [];
          setEmployees(list.map(u => ({ id: u._id || u.id, name: u.name, email: u.email })));
        }
      } catch (e) {
        setEmployees([]);
      }
    };
    loadEmployees();
  }, [showStats]);

  const handleResponse = async (e) => {
    e.preventDefault();
    try {
      const result = await contactService.updateContactStatus(selectedContact._id, responseForm);
      if (result.success) {
        setShowResponseModal(false);
        setResponseForm({ status: '', adminResponse: '', employeeResponse: '', priority: '' });
        fetchContacts();
        alert('Contact updated successfully!');
      } else {
        alert(result.error || 'Failed to update contact');
      }
    } catch (error) {
      alert('Failed to update contact');
    }
  };

  const handleReplyViaMessage = (contact) => {
    // Prefill a draft for admin to send using existing messaging UI
    const draft = {
      subject: `Re: ${contact.subject || 'Your Inquiry'}`,
      content: `Hello ${contact.name || ''},\n\n${contact.message ? `Regarding your message: \"${contact.message}\"\n\n` : ''}Here is our response:`,
      recipientEmail: contact.email,
      meta: { contactId: contact._id }
    };
    navigate('/admin/messages', { state: { draft } });
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      const result = await contactService.addNote(selectedContact._id, noteForm);
      if (result.success) {
        setShowNoteModal(false);
        setNoteForm({ content: '' });
        fetchContacts();
        alert('Note added successfully!');
      } else {
        alert(result.error || 'Failed to add note');
      }
    } catch (error) {
      alert('Failed to add note');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const result = await contactService.assignContact(selectedContact._id, assignForm);
      if (result.success) {
        setShowAssignModal(false);
        setAssignForm({ assignedTo: '' });
        fetchContacts();
        alert('Contact assigned successfully!');
      } else {
        alert(result.error || 'Failed to assign contact');
      }
    } catch (error) {
      alert('Failed to assign contact');
    }
  };

  const handleDelete = async (contactId) => {
    if (userRole !== 'admin') {
      alert('Only admins can delete contacts');
      return;
    }
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const result = await contactService.deleteContact(contactId);
        if (result.success) {
          fetchContacts();
          alert('Contact deleted successfully!');
        } else {
          alert(result.error || 'Failed to delete contact');
        }
      } catch (error) {
        alert('Failed to delete contact');
      }
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || contact.priority === filterPriority;
    const matchesType = filterType === 'all' || contact.inquiryType === filterType;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <AlertCircle size={16} className="text-[#0B6E4F] dark:text-[#0B6E4F]" />;
      case 'in-progress': return <Clock size={16} className="text-yellow-500" />;
      case 'resolved': return <CheckCircle size={16} className="text-green-500" />;
      case 'closed': return <Archive size={16} className="text-[#4B5563] dark:text-[#6B7A73]" />;
      default: return <AlertCircle size={16} className="text-[#0B6E4F] dark:text-[#0B6E4F]" />;
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

  if (loading) {
    return <div className="text-center py-8">Loading contacts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="contact-management">
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-[#0B6E4F] dark:text-[#0B6E4F]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#4B5563] dark:text-[#6B7A73]">Total Contacts</p>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">{stats.totalContacts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-[#0B6E4F] dark:text-[#0B6E4F]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#4B5563] dark:text-[#6B7A73]">New</p>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">{stats.newContacts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#4B5563] dark:text-[#6B7A73]">In Progress</p>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">{stats.inProgressContacts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#4B5563] dark:text-[#6B7A73]">Resolved</p>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F4EC]">{stats.resolvedContacts}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4B5563] dark:text-[#A8B5AE]" />
              <input type="text" placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-3 py-2 border border-[#E5E0D8] dark:border-[#2A342E] rounded-md w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-[#E5E0D8] dark:border-[#2A342E] rounded-md py-2 px-3">
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">Priority</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full border border-[#E5E0D8] dark:border-[#2A342E] rounded-md py-2 px-3">
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full border border-[#E5E0D8] dark:border-[#2A342E] rounded-md py-2 px-3">
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="property">Property</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E5E0D8] dark:divide-[#2A342E]">
            <thead className="bg-[#F8F4EC] dark:bg-[#0B0F0D]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] dark:text-[#6B7A73] uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] dark:text-[#6B7A73] uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] dark:text-[#6B7A73] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] dark:text-[#6B7A73] uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] dark:text-[#6B7A73] uppercase tracking-wider">Date</th>
                {showActions && (<th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] dark:text-[#6B7A73] uppercase tracking-wider">Actions</th>)}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E5E0D8] dark:divide-[#2A342E]">
              {filteredContacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-[#F8F4EC] dark:hover:bg-[#141A17]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#1A1A1A] dark:text-[#F8F4EC]">{contact.name}</div>
                      <div className="text-sm text-[#4B5563] dark:text-[#6B7A73]">{contact.email}</div>
                      {contact.phone && (<div className="text-sm text-[#4B5563] dark:text-[#6B7A73] flex items-center"><Phone className="w-3 h-3 mr-1" />{contact.phone}</div>)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0B6E4F]/10 dark:bg-[#0B6E4F]/10 text-[#0B6E4F] dark:text-[#0B6E4F]">{contact.inquiryType}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center">{getStatusIcon(contact.status)}<span className="ml-2 text-sm text-[#1A1A1A] dark:text-[#F8F4EC] capitalize">{contact.status}</span></div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>{contact.priority}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563] dark:text-[#6B7A73]">{new Date(contact.createdAt).toLocaleDateString()}</td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => { setSelectedContact(contact); setResponseForm({ status: contact.status, adminResponse: contact.adminResponse || '', employeeResponse: contact.employeeResponse || '', priority: contact.priority }); setShowResponseModal(true); }} className="text-indigo-600 hover:text-indigo-900" title="Update Status"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedContact(contact); setShowNoteModal(true); }} className="text-green-600 hover:text-green-900" title="Add Note"><MessageSquare className="w-4 h-4" /></button>
                        <button onClick={() => handleReplyViaMessage(contact)} className="text-[#0B6E4F] dark:text-[#0B6E4F] hover:text-blue-900" title="Reply via Message"><Reply className="w-4 h-4" /></button>
                        {userRole === 'admin' && (<button onClick={() => { setSelectedContact(contact); setShowAssignModal(true); }} className="text-[#0B6E4F] dark:text-[#0B6E4F] hover:text-blue-900" title="Assign"><UserPlus className="w-4 h-4" /></button>)}
                        {userRole === 'admin' && (<button onClick={() => handleDelete(contact._id)} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 className="w-4 h-4" /></button>)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showResponseModal && selectedContact && (
        <div className="fixed inset-0 bg-[#E5E0D8] dark:bg-[#2A342E] bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-4">Update Contact</h3>
              <form onSubmit={handleResponse}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">Status</label>
                  <select value={responseForm.status} onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })} className="w-full border border-[#E5E0D8] dark:border-[#2A342E] rounded-md py-2 px-3" required>
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">Priority</label>
                  <select value={responseForm.priority} onChange={(e) => setResponseForm({ ...responseForm, priority: e.target.value })} className="w-full border border-[#E5E0D8] dark:border-[#2A342E] rounded-md py-2 px-3" required>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">{userRole === 'admin' ? 'Admin Response' : 'Employee Response'}</label>
                  <textarea value={userRole === 'admin' ? responseForm.adminResponse : responseForm.employeeResponse} onChange={(e) => setResponseForm({ ...responseForm, [userRole === 'admin' ? 'adminResponse' : 'employeeResponse']: e.target.value })} rows={4} className="w-full border border-[#E5E0D8] dark:border-[#2A342E] rounded-md py-2 px-3" placeholder="Enter your response..." />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowResponseModal(false)} className="px-4 py-2 text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] bg-[#F8F4EC] dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] rounded-md hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && selectedContact && (
        <div className="fixed inset-0 bg-[#E5E0D8] dark:bg-[#2A342E] bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-4">Add Note</h3>
              <form onSubmit={handleAddNote}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">Note Content</label>
                  <textarea value={noteForm.content} onChange={(e) => setNoteForm({ content: e.target.value })} rows={4} className="w-full border border-[#E5E0D8] dark:border-[#2A342E] rounded-md py-2 px-3" placeholder="Enter note content..." required />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowNoteModal(false)} className="px-4 py-2 text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] bg-[#F8F4EC] dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] rounded-md hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700">Add Note</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedContact && (
        <div className="fixed inset-0 bg-[#E5E0D8] dark:bg-[#2A342E] bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-[#F8F4EC] mb-4">Assign Contact</h3>
              <form onSubmit={handleAssign}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] mb-1">Assign To Employee</label>
                  <select value={assignForm.assignedTo} onChange={(e) => setAssignForm({ assignedTo: e.target.value })} className="w-full border border-[#E5E0D8] dark:border-[#2A342E] rounded-md py-2 px-3" required>
                    <option value="">Select employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm font-medium text-[#1A1A1A] dark:text-[#A8B5AE] bg-[#F8F4EC] dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] rounded-md hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420]">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0B6E4F] dark:bg-[#0B6E4F] border border-transparent rounded-md hover:bg-[#0B6E4F] dark:hover:bg-[#0B6E4F]">Assign</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
