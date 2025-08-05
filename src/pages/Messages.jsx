import {
  ArrowLeft,
  MessageSquare,
  Send,
  Search,
  Filter,
  Clock,
  CheckCircle,
  User,
  Building,
  Archive,
  Trash2,
  RefreshCw,
  MoreVertical,
  Star,
  Reply,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { messageService } from "../services/messageService";

import "../styles/admin-dashboard.css";
import "../styles/messages.css";

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const canSend = ["admin", "employee", "buyer", "seller", "agent"].includes(
    user?.role
  );
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const disabledTextareaRef = useRef(null);
  const [lastMessageSent, setLastMessageSent] = useState(null); // Track when last message was sent

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

  // Real messages data from API
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox"); // inbox, sent, received

  // Fetch messages when component mounts or tab changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated, activeTab]);

    // Scroll to bottom when messages change
  /*  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);
 */

  // Add real-time message updates with protection against message flickering
  /* useEffect(() => {
    const interval = setInterval(() => {
      if (selectedConversation) {
        // Don't fetch if we just sent a message (wait 5 seconds)
        if (lastMessageSent && (Date.now() - lastMessageSent) < 1000) {
          return;
        }
        fetchMessages();
      }
    }, 5000); // Check for new messages every 10 seconds

    return () => clearInterval(interval);
  }, [selectedConversation, lastMessageSent]); */

  // Auto-scroll to bottom when new messages arrive
  /*   useEffect(() => {
    if (selectedConversation?.messages?.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedConversation?.messages]); */

   // Auto-resize textarea when message content changes
  useEffect(() => {
    autoResizeTextarea();
  }, [newMessage]);

  // Auto-scroll to bottom of messages
  /*  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }; */

  // Auto-resize textarea
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  // Ensure consistent ordering: sort messages by createdAt (oldest first for proper chat display)
  const sortedMessages = [...messages].sort((a, b) => {
    // Add safety checks for createdAt
    const aDate = a?.createdAt ? new Date(a.createdAt) : new Date(0);
    const bDate = b?.createdAt ? new Date(b.createdAt) : new Date(0);
    return aDate - bDate;
  });

  // Group messages into conversations with improved logic
  const conversations = sortedMessages.reduce((acc, message) => {
    // Add safety checks for message structure
    if (!message || !message.sender || !message.recipient) {
      console.warn("Invalid message structure:", message);
      return acc;
    }

    // For inbox, group by the other person (not current user)
    // For sent, group by recipient
    // For received, group by sender
    let otherPartyId, otherParty;

    if (activeTab === "sent") {
      otherPartyId = message.recipient?._id;
      otherParty = message.recipient;
    } else if (activeTab === "received") {
      otherPartyId = message.sender?._id;
      otherParty = message.sender;
    } else {
      // inbox - group by conversation pair
      if (message.sender?._id === user?._id) {
        otherPartyId = message.recipient?._id;
        otherParty = message.recipient;
      } else {
        otherPartyId = message.sender?._id;
        otherParty = message.sender;
      }
    }

    // Skip if we don't have valid IDs
    if (!otherPartyId || !otherParty) {
      console.warn("Missing otherParty data:", {
        message,
        otherPartyId,
        otherParty,
      });
      return acc;
    }

    if (!acc[otherPartyId]) {
      acc[otherPartyId] = {
        id: otherPartyId,
        otherParty: {
          id: otherPartyId,
          name: otherParty?.name || "Unknown User",
          role:
            activeTab === "sent"
              ? "recipient"
              : activeTab === "received"
              ? "sender"
              : message.sender?._id === user?._id
              ? "recipient"
              : "sender",
        },
        messages: [],
        lastMessage: message,
        unreadCount: 0,
      };
    }

    acc[otherPartyId].messages.push(message);

    // Keep latest message reference updated
    if (
      message.createdAt &&
      acc[otherPartyId].lastMessage?.createdAt &&
      new Date(message.createdAt) >
        new Date(acc[otherPartyId].lastMessage.createdAt)
    ) {
      acc[otherPartyId].lastMessage = message;
    }

    // Update unread count for inbox
    if (
      activeTab === "inbox" &&
      !message.isRead &&
      message.recipient?._id === user?._id
    ) {
      acc[otherPartyId].unreadCount = (acc[otherPartyId].unreadCount || 0) + 1;
    }

    return acc;
  }, {});

  const conversationList = Object.values(conversations)
    .map((conv) => ({
      ...conv,
      // Sort messages by createdAt (oldest first for proper chat display)
      messages: conv.messages.sort((a, b) => {
        // Add safety checks for createdAt
        const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return aDate - bDate;
      }),
    }))
    .sort((a, b) => {
      // Add safety check for lastMessage.createdAt
      const aDate = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt)
        : new Date(0);
      const bDate = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt)
        : new Date(0);
      return bDate - aDate;
    });

  // Filter conversations based on search
  const filteredConversations = conversationList.filter((conv) => {
    // Add null checks to prevent errors
    const otherPartyName = conv.otherParty?.name || "";
    const lastMessageSubject = conv.lastMessage?.subject || "";
    const lastMessageContent = conv.lastMessage?.content || "";

    return (
      otherPartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMessageSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMessageContent.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Fetch messages based on active tab
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      switch (activeTab) {
        case "inbox":
          result = await messageService.getMyMessages();
          break;
        case "sent":
          result = await messageService.getSentMessages();
          break;
        case "received":
          result = await messageService.getReceivedMessages();
          break;
        default:
          result = await messageService.getMyMessages();
      }

      if (result.success) {
        const newMessages = result.data.data.messages || [];
        setMessages(newMessages);

        // Update selected conversation if it exists
        if (selectedConversation) {
          const updatedConversation = conversationList.find(
            (conv) => conv.id === selectedConversation.id
          );
          if (updatedConversation) {
            setSelectedConversation(updatedConversation);
          }
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  // Handle message actions
  const handleMarkAsRead = async (messageId) => {
    try {
      const result = await messageService.markAsRead(messageId);
      if (result.success) {
        await fetchMessages();
      }
    } catch (err) {
      console.error("Failed to mark message as read:", err);
    }
  };

  const handleToggleArchive = async (messageId) => {
    try {
      const result = await messageService.toggleArchive(messageId);
      if (result.success) {
        await fetchMessages();
      }
    } catch (err) {
      console.error("Failed to toggle archive:", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const result = await messageService.deleteMessage(messageId);
        if (result.success) {
          await fetchMessages();
        }
      } catch (err) {
        console.error("Failed to delete message:", err);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need to be logged in to access messages.</p>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-primary"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!canSend) return;
    if (!newMessage.trim() || !selectedConversation) return;

    // Add safety check for required conversation data
    if (!selectedConversation.otherParty?.id) {
      alert("Invalid conversation data. Please refresh and try again.");
      return;
    }

    // Store the message content before clearing input
    const messageContent = newMessage.trim();

    // Create optimistic message object
    const optimisticMessage = {
      _id: `temp_${Date.now()}`, // Temporary ID
      sender: user._id,
      recipient: selectedConversation.otherParty?.id,
      subject: `Re: ${selectedConversation.lastMessage?.subject || "Message"}`,
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

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

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
      /* setTimeout(() => {
        scrollToBottom();
      }, 100); */

      // Create new message object for API
      const messageData = {
        recipient: selectedConversation.otherParty?.id,
        subject: `Re: ${
          selectedConversation.lastMessage?.subject || "Message"
        }`,
        content: messageContent,
        messageType: "general",
      };

      const result = await messageService.createMessage(messageData);
      console.log(result);

      if (result.success) {
        /* // Replace optimistic message with real message from API
          if (selectedConversation.messages) {
            console.log(selectedConversation, optimisticMessage);
          const updatedConversation = {
            ...selectedConversation,
            messages: result.data.data.messages
          };
          //setNewMessage(result.data.data.messages);
          setSelectedConversation(updatedConversation);
          
        } */
        await fetchMessages();
        // Fetch updated messages to ensure consistency
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

  return (
    <div className="modern-admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1>Messages</h1>
            <p>
              Communicate with{" "}
              {user?.role === "buyer" ? "property owners" : "potential buyers"}
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
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="messages-tabs">
        <button
          className={`tab-button ${activeTab === "inbox" ? "active" : ""}`}
          onClick={() => setActiveTab("inbox")}
        >
          <MessageSquare size={16} />
          Inbox
          {conversationList.filter((conv) => (conv.unreadCount || 0) > 0)
            .length > 0 && (
            <span className="unread-count">
              {
                conversationList.filter((conv) => (conv.unreadCount || 0) > 0)
                  .length
              }
            </span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          <Send size={16} />
          Sent
        </button>
        <button
          className={`tab-button ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          <User size={16} />
          Received
        </button>
      </div>

      {/* Main Content */}
      <div className="messages-container">
        {/* Conversations List */}
        <div className="conversations-panel">
          <div className="panel-header">
            <h2>Conversations ({filteredConversations.length})</h2>
            {activeTab === "inbox" && (
              <div className="panel-actions">
                <button className="action-btn small">
                  <Archive size={14} />
                </button>
                <button className="action-btn small">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="conversations-list">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  selectedConversation?.id === conversation.id ? "active" : ""
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <div className="avatar-circle">
                    {conversation.otherParty?.name?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </div>
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <div className="conversation-name">
                      {conversation.otherParty?.name || "Unknown User"}
                    </div>
                    <div className="conversation-time">
                      {formatTimestamp(conversation.lastMessage?.createdAt)}
                    </div>
                  </div>
                  <div className="conversation-preview">
                    <span className="last-message">
                      {conversation.lastMessage?.content || "No content"}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="conversation-meta">
                    <span className="conversation-role">
                      {conversation.otherParty?.role === "owner"
                        ? "Owner"
                        : "Buyer"}
                    </span>
                    {conversation.lastMessage?.isRead ? (
                      <span className="read-status">Read</span>
                    ) : (
                      <span className="unread-status">Unread</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="message-thread-panel">
          {selectedConversation ? (
            <>
              <div className="thread-header">
                <div className="thread-info">
                  <div className="thread-avatar">
                    <div className="avatar-circle large">
                      {selectedConversation.otherParty?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </div>
                  </div>
                  <div className="thread-details">
                    <h3>
                      {selectedConversation.otherParty?.name || "Unknown User"}
                    </h3>
                    <p>
                      <User size={14} />
                      {selectedConversation.otherParty?.role === "owner"
                        ? "Property Owner"
                        : "Potential Buyer"}
                    </p>
                  </div>
                </div>
                <div className="thread-actions">
                  <button className="action-btn secondary">
                    <Building size={16} />
                    View Property
                  </button>
                  <button className="action-btn secondary">
                    <Star size={16} />
                  </button>
                  <button className="action-btn secondary">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="messages-container-inner">
                {loading ? (
                  <div className="loading-messages">
                    <RefreshCw size={24} className="spinning" />
                    <p>Loading messages...</p>
                  </div>
                ) : selectedConversation.messages.length === 0 ? (
                  <div className="no-messages">
                    <MessageSquare size={48} />
                    <h3>No messages yet</h3>
                    <p>Start the conversation by sending a message!</p>
                  </div>
                ) : (
                  <>
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message._id}
                        className={`message-item ${
                          message.sender?._id === user?._id ? "own" : "other"
                        }`}
                      >
                        <div className="message-avatar">
                          <div className="avatar-circle small">
                            {message.sender?.name?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                        </div>
                        <div className="message-content-wrapper">
                          <div className="message-header">
                            <span className="sender-name">
                              {message.sender?.name || "Unknown User"}
                            </span>
                            <span className="message-time">
                              {formatTimestamp(message.createdAt)}
                            </span>
                          </div>
                          <div className="message-content">
                            {message.content || "No content"}
                          </div>
                          <div className="message-actions">
                            <button className="message-action-btn">
                              <Reply size={12} />
                            </button>
                            <button className="message-action-btn">
                              <Star size={12} />
                            </button>
                            <button className="message-action-btn">
                              <MoreVertical size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {canSend ? (
                <div className="message-input-container">
                  <div className="input-container">
                    <textarea
                      ref={textareaRef}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        // Auto-resize textarea
                        e.target.style.height = "auto";
                        e.target.style.height =
                          Math.min(e.target.scrollHeight, 120) + "px";
                      }}
                      className="message-input"
                      rows={1}
                      style={{
                        resize: "none",
                        minHeight: "40px",
                        maxHeight: "120px",
                        overflowY: "auto",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
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
                  <p className="input-hint">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              ) : (
                <div className="message-input-container disabled">
                  <div className="input-container">
                    <textarea
                      placeholder="You can view messages but cannot send new messages with this role"
                      value=""
                      disabled
                      className="message-input"
                      rows={1}
                      ref={disabledTextareaRef}
                    />
                    <button className="send-btn" disabled>
                      <Send size={16} />
                    </button>
                  </div>
                  <p className="input-hint">
                    Contact an administrator to enable messaging for your role
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="no-conversation-selected">
              <MessageSquare size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
