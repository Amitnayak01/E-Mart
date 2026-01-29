import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";
import { motion, AnimatePresence } from "framer-motion";

export default function MyMessages() {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    deleteConversation,
    me
  } = useChat();

  const location = useLocation();
  const [showChat, setShowChat] = useState(false);

  // 🔥 AUTO OPEN CHAT WHEN NAVIGATED FROM PRODUCT PAGE
  useEffect(() => {
    const convoId = location.state?.convoId;
    if (!convoId) return;

    const convo = conversations.find((c) => c._id === convoId);
    if (convo) {
      setActiveConversation(convo);
      setShowChat(true);

      // clear state so it doesn't reopen on back
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations, setActiveConversation]);

  const openChat = (c) => {
    setActiveConversation(c);
    setShowChat(true);
  };

  return (
    <div className="h-[calc(100vh-110px)] bg-white rounded-3xl shadow-soft overflow-hidden flex">

      {/* Sidebar */}
      <div className={`${showChat ? "hidden md:block" : "block"} w-full md:w-80 border-r bg-slate-50`}>
        <ConversationList
          conversations={conversations}
          activeId={activeConversation?._id}
          onSelect={openChat}
          onDelete={deleteConversation}
          meId={me?._id}
        />
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {(showChat || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              meId={me?._id}
              onSend={sendMessage}
              onBack={() => setShowChat(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
