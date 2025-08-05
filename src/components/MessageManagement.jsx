import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Archive, 
  Trash2, 
  Edit3, 
  Reply, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  User, 
  Building2,
  Search,
  Filter,
  Eye,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { messageService } from '../services/messageService';

const MessageManagement = ({ userRole = 'admin', showStats = true, showActions = true }) => {
  const [messages, setMessages] = useState([]);
  const [messageStats, setMessageStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    propertyInquiries: 0,
    supportMessages: 0,
    generalMessages: 0,
    urgentMessages: 0
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageFilter, setMessageFilter] = useState('all');
  const [messageSearch, setMessageSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
    fetchMessageStats();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getAllMessages();
      if (response.success) {
        setMessages(response.data.data.messages || []);
      } else {
        setError('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageStats = async () => {
    try {
      const response = await messageService.getMessageStats();
      if (response.success) {
        const stats = response.data.data;
        setMessageStats({
          totalMessages: stats.totalMessages || 0,
          unreadMessages: stats.unreadMessages || 0,
          propertyInquiries: stats.propertyInquiries || 0,
          supportMessages: stats.supportMessages || 0,
          generalMessages: stats.generalMessages || 0,
          urgentMessages: stats.urgentMessages || 0
        });
      }
    } catch (error) {
      console.error('Error fetching message stats:', error);
    }
  };

  const handleMessageAction = async (messageId, action) => {
    try {
      let response;
      switch (action) {
        case 'delete':
          response = await messageService.deleteMessage(messageId);
          break;
        case 'archive':
          response = await messageService.toggleArchive(messageId);
          break;
        case 'markRead':
          response = await messageService.markAsRead(messageId);
          break;
        default:
          return;
      }

      if (response.success) {
        await Promise.all([fetchMessages(), fetchMessageStats()]);
      }
    } catch (error) {
      console.error(`Error performing ${action} on message:`, error);
    }
  };

  const sendBulkMessage = async (messageData) => {
    try {
      const response = await messageService.sendBulkMessage(messageData);
      if (response.success) {
        setShowMessageModal(false);
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending bulk message:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(messageSearch.toLowerCase()) ||
                         message.content.toLowerCase().includes(messageSearch.toLowerCase()) ||
                         message.sender?.name?.toLowerCase().includes(messageSearch.toLowerCase());
    const matchesFilter = messageFilter === 'all' || 
                         message.messageType === messageFilter ||
                         (messageFilter === 'unread' && !message.isRead) ||
                         (messageFilter === 'urgent' && message.priority === 'urgent');
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'property': return 'text-green-600 bg-green-100';
      case 'support': return 'text-blue-600 bg-blue-100';
      case 'general': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-600">{error}</p>
        <button className="btn btn-primary mt-4" onClick={fetchMessages}>Retry</button>
      </div>
    );
  }

  return (
    <div className="message-management">
      {/* Horizontal compact stats */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <div className="p-3 rounded-lg border border-gray-200 bg-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1"><MessageSquare className="w-5 h-5 text-blue-600" /><span className="text-sm text-gray-600">Total Messages</span></div>
            <div className="text-xl font-semibold text-gray-900">{messageStats.totalMessages}</div>
          </div>
          <div className="p-3 rounded-lg border border-gray-200 bg-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1"><AlertCircle className="w-5 h-5 text-yellow-600" /><span className="text-sm text-gray-600">Unread</span></div>
            <div className="text-xl font-semibold text-gray-900">{messageStats.unreadMessages}</div>
          </div>
          <div className="p-3 rounded-lg border border-gray-200 bg-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1"><Building2 className="w-5 h-5 text-green-600" /><span className="text-sm text-gray-600">Property Inquiries</span></div>
            <div className="text-xl font-semibold text-gray-900">{messageStats.propertyInquiries}</div>
          </div>
          <div className="p-3 rounded-lg border border-gray-200 bg-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1"><User className="w-5 h-5 text-purple-600" /><span className="text-sm text-gray-600">Support</span></div>
            <div className="text-xl font-semibold text-gray-900">{messageStats.supportMessages}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search messages..." className="form-input w-full pl-10" value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)} />
          </div>
        </div>
        <select className="form-select" value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)}>
          <option value="all">All Messages</option>
          <option value="property">Property Inquiries</option>
          <option value="support">Support Messages</option>
          <option value="general">General Messages</option>
          <option value="unread">Unread Messages</option>
          <option value="urgent">Urgent Messages</option>
        </select>
        {userRole === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowMessageModal(true)}>
            <Send size={16} />
            Send Bulk Message
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Recipient</th>
              <th className="w-2/5">Subject</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((message) => (
              <tr key={message._id} className="hover:bg-gray-50">
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-sm font-medium text-primary-700">{message.sender?.name?.charAt(0).toUpperCase()}</span></div>
                    <div>
                      <p className="font-medium text-neutral-900">{message.sender?.name}</p>
                      <p className="text-sm text-neutral-500">{message.sender?.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center"><span className="text-sm font-medium text-secondary-700">{message.recipient?.name?.charAt(0).toUpperCase()}</span></div>
                    <div>
                      <p className="font-medium text-neutral-900">{message.recipient?.name}</p>
                      <p className="text-sm text-neutral-500">{message.recipient?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="align-top">
                  <div>
                    <p className="font-medium text-neutral-900">{message.subject}</p>
                    <p className="text-sm text-neutral-500 truncate">{message.content}</p>
                  </div>
                </td>
                <td><span className={`badge ${getMessageTypeColor(message.messageType)}`}>{message.messageType}</span></td>
                <td><span className={`badge ${getPriorityColor(message.priority)}`}>{message.priority}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                    {message.isRead ? (<CheckCircle className="w-4 h-4 text-green-600" />) : (<Clock className="w-4 h-4 text-yellow-600" />)}
                    <span className={`badge ${message.isRead ? 'badge-success' : 'badge-warning'}`}>{message.isRead ? 'Read' : 'Unread'}</span>
                  </div>
                </td>
                <td className="text-sm text-neutral-600">{formatDate(message.createdAt)}</td>
                {showActions && (
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleMessageAction(message._id, 'markRead')} title="Mark as Read"><Eye size={14} /></button>
                      <button className="btn btn-sm btn-warning" onClick={() => handleMessageAction(message._id, 'archive')} title="Archive"><Archive size={14} /></button>
                      {userRole === 'admin' && (<button className="btn btn-sm btn-error" onClick={() => handleMessageAction(message._id, 'delete')} title="Delete"><Trash2 size={14} /></button>)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center p-8">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No messages found</p>
        </div>
      )}
    </div>
  );
};

export default MessageManagement;
