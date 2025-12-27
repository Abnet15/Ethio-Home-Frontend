import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { useUnreadNotificationCount } from "../hooks/useUnreadNotificationCount";
import { ChatPanel } from "./chat/ChatPanel";

export function FloatingChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { user, isAuthenticated } = useAuth();
  // const { data: unreadCount = 0 } = useUnreadNotificationCount(); // TODO: Implement this hook

  // Don't show if user is not logged in
  if (!isAuthenticated || !user) return null;

  return (
    <>
      {/* Floating Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:scale-110 transition-transform relative"
            >
              <MessageCircle className="h-7 w-7 text-white" />
              {/* Unread count badge would go here */}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <ChatPanel
            isMinimized={isMinimized}
            onMinimize={() => setIsMinimized(!isMinimized)}
            onClose={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}









