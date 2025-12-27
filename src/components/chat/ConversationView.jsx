import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Smile, ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useMyMessages } from "../../hooks/useMyMessages";
import { useCreateMessage } from "../../hooks/useCreateMessage";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow, format } from "date-fns";

export function ConversationView({ conversationId, onBack }) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  
  const [userId1, userId2] = conversationId.split("-");
  const otherUserId = userId1 === user?._id ? userId2 : userId1;

  const { data: allMessages = [], isLoading } = useMyMessages();
  const messages = allMessages
    .filter((msg) => {
      const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
      const recipientId = typeof msg.recipient === "object" ? msg.recipient._id : msg.recipient;
      const msgConversationId = [senderId, recipientId].sort().join("-");
      return msgConversationId === conversationId;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const createMessage = useCreateMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user || !otherUserId) return;

    createMessage.mutate(
      {
        recipientId: otherUserId,
        subject: "Message",
        content: message,
      },
      {
        onSuccess: () => {
          setMessage("");
          setIsTyping(false);
        },
      }
    );

    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                ?
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div>
              <h3 className="font-semibold">Agent</h3>
              <p className="text-xs text-muted-foreground">
                {isTyping ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = (typeof msg.sender === "object" ? msg.sender._id : msg.sender) === user?._id;

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isSent ? "justify-end" : "justify-start"}`}
              >
                {!isSent && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {(typeof msg.sender === "object" ? msg.sender.name : "?")[0]}
                  </div>
                )}
                
                <div className={`flex flex-col max-w-[75%] ${isSent ? "items-end" : "items-start"}`}>
                  <motion.div
                    className={`rounded-2xl px-4 py-2 break-words ${
                      isSent
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </motion.div>
                  <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${isSent ? "flex-row-reverse" : ""}`}>
                    <span>{format(new Date(msg.createdAt), "HH:mm")}</span>
                    {isSent && <span>{msg.isRead ? "✓✓" : "✓"}</span>}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 justify-start"
          >
            <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (e.target.value.length > 0 && !isTyping) {
                  setIsTyping(true);
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-10"
            />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || createMessage.isPending}
            size="icon"
            className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}









