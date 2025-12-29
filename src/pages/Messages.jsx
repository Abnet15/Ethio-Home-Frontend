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
import socketService from "../services/socketService";

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
  
  // Real-time features
  const [typingUsers, setTypingUsers] = useState({}); // { userId: { isTyping, name } }
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Set of online user IDs
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch messages when component mounts or tab changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated, activeTab]);

  // Set up real-time socket listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // New message received
    const handleNewMessage = (message) => {
      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(msg => msg._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      
      // Auto-scroll to bottom if this conversation is selected
      if (selectedConversation) {
        const otherPartyId = selectedConversation.otherParty?.id;
        const messageSenderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
        const messageRecipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
        
        if (messageSenderId === otherPartyId || messageRecipientId === otherPartyId) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    // Message updated
    const handleMessageUpdated = (updatedMessage) => {
      setMessages(prev => prev.map(msg => 
        msg._id === updatedMessage._id ? updatedMessage : msg
      ));
    };

    // Message deleted
    const handleMessageDeleted = (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    };

    // Message read receipt
    const handleMessageRead = (data) => {
      setMessages(prev => prev.map(msg => {
        if (msg._id === data.messageId) {
          return { ...msg, isRead: true, readAt: data.readAt };
        }
        return msg;
      }));
    };

    // Typing indicator
    const handleTyping = (data) => {
      if (data.senderId === user?._id) return; // Don't show own typing
      
      setTypingUsers(prev => ({
        ...prev,
        [data.senderId]: {
          isTyping: data.isTyping,
          name: data.sender?.name || 'Someone'
        }
      }));

      // Clear typing after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[data.senderId];
            return updated;
          });
        }, 3000);
      }
    };

    // User online/offline
    const handleUserOnline = (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    };

    const handleUserOffline = (data) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    };

    // Register socket listeners
    socketService.on('message:new', handleNewMessage);
    socketService.on('message:updated', handleMessageUpdated);
    socketService.on('message:deleted', handleMessageDeleted);
    socketService.on('message:read', handleMessageRead);
    socketService.on('message:typing', handleTyping);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);

    // Cleanup
    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:updated', handleMessageUpdated);
      socketService.off('message:deleted', handleMessageDeleted);
      socketService.off('message:read', handleMessageRead);
      socketService.off('message:typing', handleTyping);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
    };
  }, [isAuthenticated, user, selectedConversation]);

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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="bg-card rounded-xl border shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to access messages.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Handle typing indicator
  useEffect(() => {
    if (!selectedConversation?.otherParty?.id) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (newMessage.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        socketService.startTyping(selectedConversation.otherParty.id);
      }
      
      // Reset typing indicator after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketService.stopTyping(selectedConversation.otherParty.id);
      }, 2000);
    } else {
      if (isTyping) {
        setIsTyping(false);
        socketService.stopTyping(selectedConversation.otherParty.id);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && selectedConversation?.otherParty?.id) {
        socketService.stopTyping(selectedConversation.otherParty.id);
      }
    };
  }, [newMessage, selectedConversation, isTyping]);

  const handleSendMessage = async () => {
    if (!canSend) return;
    if (!newMessage.trim() || !selectedConversation) return;

    // Add safety check for required conversation data
    if (!selectedConversation.otherParty?.id) {
      alert("Invalid conversation data. Please refresh and try again.");
      return;
    }

    // Stop typing indicator
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketService.stopTyping(selectedConversation.otherParty.id);

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
        // Mark message as read if recipient is viewing
        if (selectedConversation.otherParty?.id) {
          const sentMessage = result.data?.data?.message;
          if (sentMessage && sentMessage._id) {
            // The message will be added via socket event, no need to fetch
            // But we can mark it as read if viewing
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
        // Don't fetch immediately - let socket handle real-time update
        // Only fetch if socket doesn't update within 2 seconds
        setTimeout(() => {
          fetchMessages();
        }, 2000);
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                className="p-2 hover:bg-muted rounded-lg transition-colors" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-black text-foreground">Messages</h1>
                <p className="text-muted-foreground">
                  Communicate with{" "}
                  {user?.role === "buyer" ? "property owners" : "potential buyers"}
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-t pt-4">
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "inbox"
                  ? "bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white shadow-lg"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setActiveTab("inbox")}
            >
              <MessageSquare size={18} />
              Inbox
              {conversationList.filter((conv) => (conv.unreadCount || 0) > 0)
                .length > 0 && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {
                    conversationList.filter((conv) => (conv.unreadCount || 0) > 0)
                      .length
                  }
                </span>
              )}
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "sent"
                  ? "bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white shadow-lg"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setActiveTab("sent")}
            >
              <Send size={18} />
              Sent
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "received"
                  ? "bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white shadow-lg"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setActiveTab("received")}
            >
              <User size={18} />
              Received
            </button>
          </div>
        </div>
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
                      {onlineUsers.has(selectedConversation.otherParty?.id) && (
                        <span className="online-indicator" title="Online">
                          <span className="online-dot"></span>
                        </span>
                      )}
                    </h3>
                    <p>
                      <User size={14} />
                      {selectedConversation.otherParty?.role === "owner"
                        ? "Property Owner"
                        : "Potential Buyer"}
                      {!onlineUsers.has(selectedConversation.otherParty?.id) && (
                        <span className="offline-text"> • Offline</span>
                      )}
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
                            {message.sender?._id === user?._id && message.isRead && (
                              <span className="read-receipt" title="Read">
                                <CheckCircle size={12} />
                              </span>
                            )}
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
                    {/* Typing indicator */}
                    {selectedConversation.otherParty?.id && typingUsers[selectedConversation.otherParty.id]?.isTyping && (
                      <div className="message-item other typing-indicator">
                        <div className="message-avatar">
                          <div className="avatar-circle small">
                            {typingUsers[selectedConversation.otherParty.id].name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        </div>
                        <div className="message-content-wrapper">
                          <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
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
