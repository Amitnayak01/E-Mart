import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ChatBubble from "./ChatBubble";
import { useChat } from "../../context/ChatContext";

export default function ChatWindow({ conversation, messages, meId, onSend, onBack }) {
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const { socket } = useChat();

  /* 🔄 Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 👁️ Mark messages as read when chat opens */
  useEffect(() => {
    if (conversation?._id && socket) {
      socket.emit("chat:read", { conversationId: conversation._id });
    }
  }, [conversation, socket]);

  /* ⌨️ Typing indicator emit */
  useEffect(() => {
    if (!socket || !conversation?._id) return;

    const timeout = setTimeout(() => setTyping(false), 1200);

    if (typing) {
      socket.emit("chat:typing", { conversationId: conversation._id });
    }

    return () => clearTimeout(timeout);
  }, [typing, socket, conversation]);

  if (!conversation)
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a chat
      </div>
    );

  const other = conversation.participants.find(
    (p) => String(p._id) !== String(meId)
  );

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
        <button className="md:hidden" onClick={onBack}>
          <ArrowLeft />
        </button>
        <img
          src={other?.avatar?.url || "/avatar.png"}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-bold">{other?.name || other?.username}</div>
          <div className="text-xs text-green-600">
            {other?.isOnline ? "Online" : "Offline"}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white scrollbar-thin">
        {messages.map((m) => (
          <motion.div
            key={m._id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <ChatBubble msg={m} mine={String(m.sender) === String(meId)} />
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t bg-white flex gap-3">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setTyping(true);
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border focus:ring-2 focus:ring-indigo-400 outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMsg();
            }
          }}
        />
        <button
          onClick={sendMsg}
          className="bg-indigo-600 text-white px-6 rounded-full shadow active:scale-95 transition"
        >
          Send
        </button>
      </div>
    </div>
  );

  function sendMsg() {
    if (!text.trim()) return;
    const receiverId = conversation.participants.find(
      (p) => String(p._id) !== String(meId)
    )._id;

    onSend({ conversationId: conversation._id, receiverId, text });
    setText("");
  }
}
