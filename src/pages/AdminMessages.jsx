import {
  ArrowLeft,
  MessageSquare,
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Plus,
  FileText,
  UserPlus,
  Trash2,
  Edit,
  Archive,
  ChevronDown,
  X,
  User,
  MoreVertical,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { messageService } from "../services/messageService";
import { userService } from "../services/userService";

import "../styles/admin-dashboard.css";
import "../styles/messages.css";

const AdminMessages = () => {
  const { user, isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("conversations");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showBulkMessageModal, setShowBulkMessageModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Real data from API
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [permissions, setPermissions] = useState({
    canDelete: false,
    canUpdate: false,
    canViewAll: true,
    canSendBulk: false,
  });

  // Users for bulk message recipients
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Bulk message form
  const [bulkMessageForm, setBulkMessageForm] = useState({
    recipients: [],
    subject: "",
    content: "",
    messageType: "general",
    priority: "medium",
  });

  // Track when last message was sent
  const [lastMessageSent, setLastMessageSent] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    if (isAdmin || isEmployee) {
      fetchMessages();
      fetchTemplates();
      fetchStats();
      fetchUsers();
    }
  }, [isAdmin, isEmployee]);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Fetch all users for bulk message recipients
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const result = await userService.getUsers();
      //console.log("Users API result:", result);

      if (result.success) {
        const usersData = result.data?.data?.data || [];
        //console.log("Users data extracted:", usersData);
        setUsers(usersData);

        if (usersData.length === 0) {
          console.warn("No users found in API response");
        }
      } else {
        console.error("Failed to fetch users:", result.error);
        alert("Failed to load users for bulk message. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Error loading users. Please check console for details.");
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch all messages
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await messageService.getAllMessages();
      //console.log("API result 🥵🥵😱😱😱😰😰:", result);

      if (result.success) {
        const messagesData = result.data?.data?.messages || [];
        //console.log("Messages data:", messagesData);
        // Sort messages by creation date (newest first)
        const sortedMessages = messagesData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMessages(sortedMessages);
        // Set permissions based on user role
        const userPermissions = {
          canDelete: isAdmin,
          canUpdate: isAdmin || isEmployee,
          canViewAll: true,
          canSendBulk: isAdmin,
        };

        //console.log("Setting permissions:", userPermissions);
        setPermissions(userPermissions);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  // Fetch message templates
  const fetchTemplates = async () => {
    try {
      const result = await messageService.getMessageTemplates();
      console.log("getMessageTemplates()😎😍😘😘😘",result)
      if (result.success) {
        setTemplates(
          result.data?.data?.templates || result.data?.templates || []
        );
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  };

  // Fetch message statistics
  const fetchStats = async () => {
    try {
      const result = await messageService.getMessageStats();
      console.log("🤣🤣🤣🤣🤣🤣", result);

      if (result.success) {
        setStats(result.data?.data );
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Handle user selection for bulk message
  const handleUserSelect = (selectedUser) => {
    const isAlreadySelected = bulkMessageForm.recipients.find(
      (r) => r._id === selectedUser._id
    );
    if (!isAlreadySelected) {
      setBulkMessageForm((prev) => ({
        ...prev,
        recipients: [...prev.recipients, selectedUser],
      }));
    }
    setShowUserDropdown(false);
  };

  // Remove user from recipients
  const removeRecipient = (userId) => {
    setBulkMessageForm((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r._id !== userId),
    }));
  };

  // Handle bulk message submission
  const handleBulkMessageSubmit = async (e) => {
    e.preventDefault();

    if (
      !bulkMessageForm.recipients.length ||
      !bulkMessageForm.subject ||
      !bulkMessageForm.content
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const messageData = {
        ...bulkMessageForm,
        recipients: bulkMessageForm.recipients.map((r) => r._id),
      };

      const result = await messageService.sendBulkMessage(messageData);
      if (result.success) {
        alert(
          `Bulk message sent successfully to ${result.data.data.messages.length} recipients`
        );
        setShowBulkMessageModal(false);
        setBulkMessageForm({
          recipients: [],
          subject: "",
          content: "",
          messageType: "general",
          priority: "medium",
        });
        fetchMessages(); // Refresh messages
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert("Failed to send bulk message");
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setBulkMessageForm((prev) => ({
      ...prev,
      subject: template.subject,
      content: template.content,
      messageType: template.messageType,
      priority: template.priority,
    }));
    setShowTemplatesModal(false);
  };

  // Handle message actions with permission checks
  const handleMessageAction = async (messageId, action) => {
    try {
      console.log(`Attempting ${action} on message:`, messageId);
      let response;

      switch (action) {
        case "delete":
          if (!permissions.canDelete) {
            alert("You do not have permission to delete messages");
            return;
          }
          console.log("Calling deleteMessage...");
          response = await messageService.deleteMessage(messageId);
          break;
        case "archive":
          console.log("Calling toggleArchive...");
          response = await messageService.toggleArchive(messageId);
          break;
        case "markRead":
          console.log("Calling markAsRead...");
          response = await messageService.markAsRead(messageId);
          break;
        default:
          console.log("Unknown action:", action);
          return;
      }

      console.log("Response received:", response);

      if (response && response.success) {
        console.log(`${action} action successful`);

        // Update local state immediately for better UX
        if (action === "delete") {
          // Remove deleted message from local state
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg._id !== messageId)
          );

          // If the deleted message was in the selected conversation, remove it from there too
          if (selectedConversation && selectedConversation.messages) {
            setSelectedConversation((prev) => ({
              ...prev,
              messages: prev.messages.filter((msg) => msg._id !== messageId),
            }));
          }
        } else if (action === "markRead") {
          // Update message read status in local state
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === messageId ? { ...msg, isRead: true } : msg
            )
          );
        } else if (action === "archive") {
          // Update message archive status in local state
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === messageId
                ? { ...msg, isArchived: !msg.isArchived }
                : msg
            )
          );
        }

        // Show success message
        alert(
          `${
            action === "markRead"
              ? "Marked as read"
              : action === "archive"
              ? "Archive status updated"
              : "Message deleted"
          } successfully`
        );
      } else {
        console.error("Action failed:", response);
        alert(response?.error || `Failed to ${action} message`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on message:`, error);
      alert(`Action failed: ${error.message || "Unknown error occurred"}`);
    }
  };

  // Filter messages based on search and status
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipient?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unread" && !message.isRead) ||
      (filterStatus === "read" && message.isRead) ||
      (filterStatus === "archived" && message.isArchived);

    return matchesSearch && matchesStatus;
  });

  // Group messages by conversation (sender-recipient pair) and sort by creation date
  const conversations = filteredMessages.reduce((acc, message) => {
    const key = `${message.sender._id}-${message.recipient._id}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        messages: [],
        lastMessage: message,
        participants: {
          sender: message.sender,
          recipient: message.recipient,
        },
      };
    }
    acc[key].messages.push(message);
    return acc;
  }, {});

  // Sort conversations by last message creation date (newest first)
  const conversationList = Object.values(conversations)
    .map((conv) => ({
      ...conv,
      messages: conv.messages.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "completed":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "completed":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Store the message content before clearing input
    const messageContent = newMessage.trim();

    // Create optimistic message object
    const optimisticMessage = {
      _id: `temp_${Date.now()}`, // Temporary ID
      sender: user._id,
      recipient: selectedConversation.participants.recipient._id,
      subject: `${selectedConversation.lastMessage.subject || "Message"}`,
      content: messageContent,
      messageType: "general",
      isRead: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Add sender details for display
      senderDetails: {
        _id: user._id,
        name: user.name,
        photo: user.photo,
      },
    };

    try {
      // Clear input immediately for better UX
      setNewMessage("");

      // Add optimistic message to local state
      if (selectedConversation.messages) {
        const updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, optimisticMessage],
        };
        setSelectedConversation(updatedConversation);
      }

      // Set timestamp to prevent real-time updates for 5 seconds
      setLastMessageSent(Date.now());

      // Scroll to bottom immediately
      setTimeout(() => {
        const messagesContainer = document.querySelector(
          ".messages-container-inner"
        );
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);

      // Create new message object for API
      const messageData = {
        recipient: selectedConversation.participants.recipient._id,
        subject: `${selectedConversation.lastMessage.subject || "Message"}`,
        content: messageContent,
        messageType: "general",
      };

      const result = await messageService.createMessage(messageData);

      if (result.success) {
        // Replace optimistic message with real message from API
        if (selectedConversation.messages) {
          const updatedConversation = {
            ...selectedConversation,
            messages: selectedConversation.messages.map((msg) =>
              msg._id === optimisticMessage._id ? result.data.data.message : msg
            ),
          };
          //setSelectedConversation(updatedConversation);
          console.log("🦓🤖🤖🤖", updatedConversation)
          //setMessages(updatedConversation);
          // Fetch updated messages to ensure consistency
          await fetchMessages();
        }
      } else {
        // If API call failed, remove optimistic message and show error
        if (selectedConversation.messages) {
          const updatedConversation = {
            ...selectedConversation,
            messages: selectedConversation.messages.filter(
              (msg) => msg._id !== optimisticMessage._id
            ),
          };
          setSelectedConversation(updatedConversation);
        }
        alert(result.error || "Failed to send message");
      }
    } catch (err) {
      // If error occurred, remove optimistic message and show error
      if (selectedConversation.messages) {
        const updatedConversation = {
          ...selectedConversation,
          messages: selectedConversation.messages.filter(
            (msg) => msg._id !== optimisticMessage._id
          ),
        };
        setSelectedConversation(updatedConversation);
      }
      alert("Failed to send message");
      console.error("Error sending message:", err);
    }
  };

  // Check if user has access
  if (!isAdmin && !isEmployee) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate("/admin-dashboard")}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Message Management</h1>
            <p>
              Monitor and manage conversations between property owners and
              buyers
            </p>
          </div>
        </div>
        <div className="header-right">
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
          {permissions.canSendBulk && (
            <button
              className="action-btn primary"
              onClick={() => setShowBulkMessageModal(true)}
            >
              <UserPlus size={16} />
              Bulk Message
            </button>
          )}
          <button
            className="action-btn secondary"
            onClick={() => setShowTemplatesModal(true)}
          >
            <FileText size={16} />
            Templates
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="messages-container">
        {/* Conversations List */}
        <div className="conversations-panel">
          <div className="panel-header">
            <h2>Conversations ({conversationList.length})</h2>
          </div>
          <div className="admin-conversations-list">
            {conversationList.map((conversation) => (
              <div
                key={conversation.id}
                className={`admin-conversation-item ${
                  selectedConversation?.id === conversation.id ? "selected" : ""
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="admin-conversation-header">
                  <div className="admin-conversation-participants">
                    <div className="admin-conversation-title">
                      <User size={16} />
                      {conversation.participants.sender.name} →{" "}
                      {conversation.participants.recipient.name}
                    </div>
                    <div className="admin-conversation-subtitle">
                      <MessageSquare size={14} />
                      {conversation.lastMessage.subject}
                    </div>
                  </div>
                  <div className="admin-conversation-status">
                    <span className="admin-conversation-time">
                      {formatTimestamp(conversation.lastMessage.createdAt)}
                    </span>
                    <span
                      className={`admin-conversation-badge ${
                        conversation.lastMessage.isRead ? "read" : "unread"
                      }`}
                    >
                      {conversation.lastMessage.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
                <div className="admin-conversation-preview">
                  {conversation.lastMessage.content}
                </div>
                <div className="admin-conversation-meta">
                  <div className="admin-conversation-meta-item">
                    <MessageSquare size={12} />
                    {conversation.messages.length} messages
                  </div>
                  <div className="admin-conversation-meta-item">
                    <Clock size={12} />
                    {conversation.lastMessage.messageType}
                  </div>
                </div>
                <div className="admin-conversation-actions">
                  <button
                    className="admin-conversation-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add any quick actions here
                    }}
                    title="Quick actions"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="admin-messages-container">
          {selectedConversation ? (
            <>
              <div className="admin-messages-header">
                <div className="admin-messages-title">
                  {selectedConversation.lastMessage.subject}
                </div>
                <div className="admin-messages-subtitle">
                  <Users size={14} />
                  {selectedConversation.participants.sender.name} ↔{" "}
                  {selectedConversation.participants.recipient.name}
                </div>
              </div>

              <div className="admin-messages-content">
                {selectedConversation.messages.map((message) => (
                  <div key={message._id} className="admin-message-item">
                    <div className="admin-message-avatar">
                      {/* {message.sender.name.charAt(0).toUpperCase()} */}A
                    </div>
                    <div className="admin-message-content">
                      <div className="admin-message-header">
                        <span className="admin-message-sender">
                          {message.sender.name}
                        </span>
                        <span className="admin-message-time">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="admin-message-text">
                        {message.content}
                      </div>
                      <div className="admin-message-actions">
                        {permissions.canUpdate && (
                          <button
                            className="admin-message-action-btn"
                            onClick={() =>
                              handleMessageAction(message._id, "markRead")
                            }
                            disabled={message.isRead}
                            title={
                              message.isRead ? "Already read" : "Mark as read"
                            }
                          >
                            <CheckCircle size={14} />
                            {message.isRead ? "Read" : "Mark Read"}
                          </button>
                        )}
                        {permissions.canUpdate && (
                          <button
                            className="admin-message-action-btn"
                            onClick={() =>
                              handleMessageAction(message._id, "archive")
                            }
                            title={message.isArchived ? "Unarchive" : "Archive"}
                          >
                            <Archive size={14} />
                            {message.isArchived ? "Unarchive" : "Archive"}
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button
                            className="admin-message-action-btn danger"
                            onClick={() =>
                              handleMessageAction(message._id, "delete")
                            }
                            title="Delete message"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-message-input">
                <div className="input-container">
                  <textarea
                    placeholder="Send a message as admin..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="message-input"
                    rows={1}
                    style={{
                      resize: "none",
                      minHeight: "40px",
                      maxHeight: "120px",
                      overflowY: "auto",
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="send-btn"
                    disabled={!newMessage.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="admin-note">
                  Press Enter to send, Shift+Enter for new line. As an{" "}
                  {isAdmin ? "admin" : "employee"}, you can monitor
                  conversations and intervene when necessary.
                </p>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <MessageSquare size={64} />
              <h3>Select a conversation</h3>
              <p>
                Choose a conversation from the list to view the message thread
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Message Modal */}
      {showBulkMessageModal && (
        <div className="modal-overlay">
          <div className="modal-content bulk-message-modal">
            <div className="modal-header">
              <h3>Send Bulk Message</h3>
              <button
                className="close-btn"
                onClick={() => setShowBulkMessageModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleBulkMessageSubmit}>
              <div className="form-group">
                <label>Recipients</label>
                <div className="recipients-selector">
                  <div className="selected-recipients">
                    {bulkMessageForm.recipients.map((recipient) => (
                      <span key={recipient._id} className="recipient-tag">
                        {recipient.name}
                        <button
                          type="button"
                          onClick={() => removeRecipient(recipient._id)}
                          className="remove-recipient"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="recipient-dropdown-container">
                    <button
                      type="button"
                      className="recipient-dropdown-trigger"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                    >
                      <span>Select Users</span>
                      <ChevronDown size={16} />
                    </button>
                    {showUserDropdown && (
                      <div className="recipient-dropdown">
                        {usersLoading ? (
                          <div className="dropdown-loading">
                            Loading users...
                          </div>
                        ) : (
                          users.map((user) => (
                            <div
                              key={user._id}
                              className="dropdown-user-item"
                              onClick={() => handleUserSelect(user)}
                            >
                              <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-role">{user.role}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {bulkMessageForm.recipients.length > 0 && (
                  <p className="recipients-count">
                    {bulkMessageForm.recipients.length} recipient
                    {bulkMessageForm.recipients.length !== 1 ? "s" : ""}{" "}
                    selected
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Message subject"
                  value={bulkMessageForm.subject}
                  onChange={(e) =>
                    setBulkMessageForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Message Type</label>
                  <select
                    value={bulkMessageForm.messageType}
                    onChange={(e) =>
                      setBulkMessageForm((prev) => ({
                        ...prev,
                        messageType: e.target.value,
                      }))
                    }
                  >
                    <option value="general">General</option>
                    <option value="inquiry">Inquiry</option>
                    <option value="support">Support</option>
                    <option value="property">Property</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={bulkMessageForm.priority}
                    onChange={(e) =>
                      setBulkMessageForm((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  placeholder="Message content"
                  value={bulkMessageForm.content}
                  onChange={(e) =>
                    setBulkMessageForm((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowBulkMessageModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Bulk Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Message Templates</h3>
              <button
                className="close-btn"
                onClick={() => setShowTemplatesModal(false)}
              >
                ×
              </button>
            </div>
            <div className="templates-list">
              {templates.map((template) => (
                <div key={template.id} className="template-item">
                  <div className="template-header">
                    <h4>{template.name}</h4>
                    <span className={`template-type ${template.messageType}`}>
                      {template.messageType}
                    </span>
                  </div>
                  <div className="template-content">
                    <p>
                      <strong>Subject:</strong> {template.subject}
                    </p>
                    <p>
                      <strong>Content:</strong> {template.content}
                    </p>
                    <p>
                      <strong>Priority:</strong> {template.priority}
                    </p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowTemplatesModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
