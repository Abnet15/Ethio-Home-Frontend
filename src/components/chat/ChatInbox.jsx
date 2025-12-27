import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MessageCircle } from "lucide-react";
import { Input } from "../ui/input";
import { useMyMessages } from "../../hooks/useMyMessages";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

export function ChatInbox({ onSelectConversation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: messages = [], isLoading } = useMyMessages();
  const { user } = useAuth();

  // Group messages by conversation
  const conversations = useMemo(() => {
    if (!user || !messages.length) return [];
    
    const convMap = new Map();
    messages.forEach((message) => {
      const senderId = typeof message.sender === "object" ? message.sender._id : message.sender;
      const recipientId = typeof message.recipient === "object" ? message.recipient._id : message.recipient;
      const otherUserId = senderId === user._id ? recipientId : senderId;
      const otherUser = senderId === user._id 
        ? (typeof message.recipient === "object" ? message.recipient : null)
        : (typeof message.sender === "object" ? message.sender : null);

      const conversationId = [user._id, otherUserId].sort().join("-");

      if (!convMap.has(conversationId)) {
        convMap.set(conversationId, {
          otherUser,
          lastMessage: message,
          unreadCount: 0,
          messages: [],
        });
      }

      const conv = convMap.get(conversationId);
      conv.messages.push(message);
      
      if (new Date(message.createdAt) > new Date(conv.lastMessage.createdAt)) {
        conv.lastMessage = message;
      }

      if (!message.isRead && recipientId === user._id) {
        conv.unreadCount++;
      }
    });

    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [messages, user]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter((conv) =>
      conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation from any property page
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation, idx) => {
          const otherUser = conversation.otherUser;
          const isUnread = conversation.unreadCount > 0;
          const conversationId = [user._id, otherUser?._id].sort().join("-");

          return (
            <motion.div
              key={conversationId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectConversation(conversationId)}
              className={`p-4 border-b border-border/20 cursor-pointer hover:bg-accent/50 transition-colors ${
                isUnread ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  {otherUser?.photo ? (
                    <img
                      src={otherUser.photo.startsWith("http") ? otherUser.photo : `http://localhost:5000${otherUser.photo}`}
                      alt={otherUser.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {otherUser?.name?.[0] || "?"}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate ${isUnread ? "font-bold" : ""}`}>
                      {otherUser?.name || "Unknown User"}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {conversation.lastMessage.content}
                  </p>
                </div>

                {/* Unread badge */}
                {isUnread && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}









