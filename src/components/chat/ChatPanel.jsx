import { useState } from "react";
import { motion } from "framer-motion";
import { X, Minimize2, Maximize2, Search, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ChatInbox } from "./ChatInbox";
import { ConversationView } from "./ConversationView";

export function ChatPanel({ isMinimized, onMinimize, onClose }) {
  const [view, setView] = useState("inbox");
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const isMobile = window.innerWidth < 768;

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setView("conversation");
  };

  const handleBackToInbox = () => {
    setView("inbox");
    setSelectedConversationId(null);
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className={`fixed bottom-0 right-6 w-80 h-16 glass rounded-t-2xl border-t border-x border-border/40 shadow-2xl z-50 ${
          isMobile ? "right-0 left-0 w-full rounded-t-none" : ""
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Messages</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onMinimize}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`fixed bottom-0 right-6 w-[420px] h-[600px] glass rounded-t-2xl border-t border-x border-border/40 shadow-2xl z-50 flex flex-col overflow-hidden ${
        isMobile ? "right-0 left-0 w-full h-[85vh] rounded-t-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {view === "conversation" && (
            <Button variant="ghost" size="icon" onClick={handleBackToInbox} className="md:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {view === "inbox" ? "Messages" : "Conversation"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {view === "inbox" && (
            <Button variant="ghost" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === "inbox" ? (
          <ChatInbox onSelectConversation={handleSelectConversation} />
        ) : (
          <ConversationView
            conversationId={selectedConversationId}
            onBack={handleBackToInbox}
          />
        )}
      </div>
    </motion.div>
  );
}









