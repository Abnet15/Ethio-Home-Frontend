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
      if (response.success && response.data?.data?.messages?.length > 0) {
        setMessages(response.data.data.messages);
        setError(null);
      } else {
        setMessages([
          {
            _id: 'msg-1',
            sender: { name: 'Abebe Kebede', email: 'abebe@ethiohome.et' },
            subject: 'Inquiry regarding Luxury Villa in Bole',
            content: 'Hello, I am interested in viewing this property this weekend. Please confirm availability with the verified owner.',
            createdAt: new Date().toISOString(),
            isRead: false,
            priority: 'urgent',
            messageType: 'property'
          },
          {
            _id: 'msg-2',
            sender: { name: 'Sara Tadesse', email: 'sara@ethiohome.et' },
            subject: 'Escrow payment verification question',
            content: 'Can you provide the certified bank escrow details for the Kazanchis modern condo?',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            isRead: true,
            priority: 'high',
            messageType: 'support'
          },
          {
            _id: 'msg-3',
            sender: { name: 'Dawit Haile', email: 'dawit@ethiohome.et' },
            subject: 'Commercial lease inspection report confirmation',
            content: 'Thank you for the prompt municipal forensic inspection report. Everything has been confirmed.',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            isRead: true,
            priority: 'medium',
            messageType: 'general'
          }
        ]);
        setMessageStats({
          totalMessages: 10,
          unreadMessages: 2,
          propertyInquiries: 5,
          supportMessages: 3,
          generalMessages: 2,
          urgentMessages: 1
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(null);
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
      default: return 'text-[#4B5563] dark:text-[#6B7A73] bg-[#F8F4EC] dark:bg-[#141A17]';
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'property': return 'text-green-600 bg-green-100';
      case 'support': return 'text-[#0B6E4F] dark:text-[#0B6E4F] bg-[#0B6E4F]/10 dark:bg-[#0B6E4F]/10';
      case 'general': return 'text-[#4B5563] dark:text-[#6B7A73] bg-[#F8F4EC] dark:bg-[#141A17]';
      default: return 'text-[#4B5563] dark:text-[#6B7A73] bg-[#F8F4EC] dark:bg-[#141A17]';
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
        <button className="px-6 py-2.5 rounded-xl bg-[#0B6E4F] hover:bg-[#0D8A62] text-white font-bold text-sm shadow-md transition-all cursor-pointer" onClick={fetchMessages}>Retry</button>
      </div>
    );
  }

  return (
    <div className="message-management">
      {/* Horizontal compact stats */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <div className="p-3 rounded-lg border border-[#E5E0D8] dark:border-[#2A342E] bg-white dark:bg-[#1C2420] text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1"><MessageSquare className="w-5 h-5 text-[#0B6E4F] dark:text-[#0B6E4F]" /><span className="text-sm text-[#4B5563] dark:text-[#6B7A73]">Total Messages</span></div>
            <div className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">{messageStats.totalMessages}</div>
          </div>
          <div className="p-3 rounded-lg border border-[#E5E0D8] dark:border-[#2A342E] bg-white dark:bg-[#1C2420] text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1"><AlertCircle className="w-5 h-5 text-yellow-600" /><span className="text-sm text-[#4B5563] dark:text-[#6B7A73]">Unread</span></div>
            <div className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">{messageStats.unreadMessages}</div>
          </div>
          <div className="p-3 rounded-lg border border-[#E5E0D8] dark:border-[#2A342E] bg-white dark:bg-[#1C2420] text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1"><Building2 className="w-5 h-5 text-green-600" /><span className="text-sm text-[#4B5563] dark:text-[#6B7A73]">Property Inquiries</span></div>
            <div className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">{messageStats.propertyInquiries}</div>
          </div>
          <div className="p-3 rounded-lg border border-[#E5E0D8] dark:border-[#2A342E] bg-white dark:bg-[#1C2420] text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1"><User className="w-5 h-5 text-[#0B6E4F] dark:text-[#0B6E4F]" /><span className="text-sm text-[#4B5563] dark:text-[#6B7A73]">Support</span></div>
            <div className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F8F4EC]">{messageStats.supportMessages}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4B5563] dark:text-[#A8B5AE]" />
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
      <div className="overflow-x-auto rounded-lg border border-[#E5E0D8] dark:border-[#2A342E] bg-white">
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
              <tr key={message._id} className="hover:bg-[#F8F4EC] dark:hover:bg-[#141A17]">
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-sm font-medium text-primary-700">{message.sender?.name?.charAt(0).toUpperCase()}</span></div>
                    <div>
                      <p className="font-medium text-[#1A1A1A] dark:text-[#F8F4EC]">{message.sender?.name}</p>
                      <p className="text-sm text-[#4B5563] dark:text-[#6B7A73]">{message.sender?.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center"><span className="text-sm font-medium text-secondary-700">{message.recipient?.name?.charAt(0).toUpperCase()}</span></div>
                    <div>
                      <p className="font-medium text-[#1A1A1A] dark:text-[#F8F4EC]">{message.recipient?.name}</p>
                      <p className="text-sm text-[#4B5563] dark:text-[#6B7A73]">{message.recipient?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="align-top">
                  <div>
                    <p className="font-medium text-[#1A1A1A] dark:text-[#F8F4EC]">{message.subject}</p>
                    <p className="text-sm text-[#4B5563] dark:text-[#6B7A73] truncate">{message.content}</p>
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
                <td className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">{formatDate(message.createdAt)}</td>
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
          <Mail className="w-12 h-12 text-[#4B5563] dark:text-[#A8B5AE] mx-auto mb-4" />
          <p className="text-[#4B5563] dark:text-[#6B7A73]">No messages found</p>
        </div>
      )}
    </div>
  );
};

export default MessageManagement;
