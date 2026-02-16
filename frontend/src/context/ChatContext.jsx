import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  useRef
} from "react";
import { io } from "socket.io-client";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

const initialState = {
  socket: null,
  conversations: [],
  activeConversation: null,
  messages: [],
  loadingConversations: false,
  loadingMessages: false
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SOCKET":
      return { ...state, socket: action.payload };

    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload };

    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversation: action.payload, messages: [] };

    case "SET_MESSAGES":
      return { ...state, messages: action.payload };

    // 🔥 MAIN REALTIME ENGINE
    case "ADD_MESSAGE": {
      const msg = action.payload;

      if (state.messages.some((m) => m._id === msg._id)) return state;

      const isActive = state.activeConversation?._id === msg.conversation;
      const newMessages = isActive ? [...state.messages, msg] : state.messages;

      let convoExists = false;

      let updatedConvos = state.conversations.map((c) => {
        if (c._id === msg.conversation) {
          convoExists = true;
          return {
            ...c,
            lastMessage: msg,
            lastMessageAt: msg.createdAt,
            unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1
          };
        }
        return c;
      });

      // 🧠 Insert brand new conversation instantly
      if (!convoExists && msg.conversationData) {
        updatedConvos.unshift({
          ...msg.conversationData,
          lastMessage: msg,
          lastMessageAt: msg.createdAt,
          unreadCount: 1
        });
      }

      // Keep latest chat on top
      updatedConvos.sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );

      return {
        ...state,
        messages: newMessages,
        conversations: updatedConvos
      };
    }

    case "RESET_UNREAD":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c._id === action.payload ? { ...c, unreadCount: 0 } : c
        )
      };

    case "REMOVE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter(
          (c) => c._id !== action.payload
        ),
        activeConversation:
          state.activeConversation?._id === action.payload
            ? null
            : state.activeConversation,
        messages:
          state.activeConversation?._id === action.payload ? [] : state.messages
      };

    case "SET_LOADING_CONVOS":
      return { ...state, loadingConversations: action.payload };

    case "SET_LOADING_MESSAGES":
      return { ...state, loadingMessages: action.payload };

    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const { token, user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const joinedRoomRef = useRef(null);

  // 🔌 SOCKET CONNECTION
  useEffect(() => {
    if (!token) return;

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "https://e-mart-gamma-three.vercel.app",
      { auth: { token } }
    );

    dispatch({ type: "SET_SOCKET", payload: socket });

    socket.on("chat:newMessage", (msg) => {
      dispatch({ type: "ADD_MESSAGE", payload: msg });
    });

    return () => socket.disconnect();
  }, [token]);

  // 📥 LOAD CONVERSATIONS
  const fetchConversations = useCallback(async () => {
    dispatch({ type: "SET_LOADING_CONVOS", payload: true });
    const res = await api.get("/api/chat/conversations");
    dispatch({ type: "SET_CONVERSATIONS", payload: res.data.data.items });
    dispatch({ type: "SET_LOADING_CONVOS", payload: false });
  }, []);

  useEffect(() => {
    if (token) fetchConversations();
  }, [token, fetchConversations]);

  // 📂 OPEN CHAT
  const setActiveConversation = useCallback(
    async (conversation) => {
      if (!conversation) return;
      if (state.activeConversation?._id === conversation._id) return;

      dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conversation });
      dispatch({ type: "SET_LOADING_MESSAGES", payload: true });

      const res = await api.get(`/api/chat/messages/${conversation._id}`, {
        params: { page: 1, limit: 50 }
      });

      dispatch({ type: "SET_MESSAGES", payload: res.data.data.items });
      dispatch({ type: "SET_LOADING_MESSAGES", payload: false });

      // Join socket room once
      if (joinedRoomRef.current !== conversation._id) {
        state.socket?.emit("chat:join", { conversationId: conversation._id });
        joinedRoomRef.current = conversation._id;
      }

      // Reset unread instantly
      dispatch({ type: "RESET_UNREAD", payload: conversation._id });
    },
    [state.socket, state.activeConversation]
  );

  // ✉ SEND MESSAGE
  const sendMessage = useCallback(
    ({ conversationId, receiverId, text }) => {
      state.socket?.emit("chat:sendMessage", {
        conversationId,
        receiverId,
        text
      });
    },
    [state.socket]
  );

  // 🗑 DELETE CONVERSATION
  const deleteConversation = useCallback(async (id) => {
    await api.delete(`/api/chat/conversations/${id}`);
    dispatch({ type: "REMOVE_CONVERSATION", payload: id });
  }, []);

  const getOtherUser = useCallback(
    (conversation) =>
      conversation?.participants?.find(
        (p) => String(p._id) !== String(user?._id)
      ),
    [user]
  );

  const totalUnread = useMemo(
    () => state.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
    [state.conversations]
  );

  const value = useMemo(
    () => ({
      ...state,
      totalUnread,
      fetchConversations,
      setActiveConversation,
      sendMessage,
      deleteConversation,
      getOtherUser,
      me: user
    }),
    [
      state,
      totalUnread,
      fetchConversations,
      setActiveConversation,
      sendMessage,
      deleteConversation,
      getOtherUser,
      user
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => useContext(ChatContext);
