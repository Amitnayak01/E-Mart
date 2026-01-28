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

    case "ADD_MESSAGE": {
      if (state.messages.some((m) => m._id === action.payload._id)) return state;

      // 🔥 update lastMessage + unread in conversation list
      const updatedConvos = state.conversations.map((c) => {
        if (c._id === action.payload.conversation) {
          return {
            ...c,
            lastMessage: action.payload,
            unreadCount:
              state.activeConversation?._id === c._id
                ? 0
                : (c.unreadCount || 0) + 1
          };
        }
        return c;
      });

      return {
        ...state,
        messages: [...state.messages, action.payload],
        conversations: updatedConvos
      };
    }

    case "REMOVE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter(c => c._id !== action.payload),
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

  // 🔌 SOCKET
  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token }
    });

    dispatch({ type: "SET_SOCKET", payload: socket });

    socket.on("chat:newMessage", (msg) => {
      dispatch({ type: "ADD_MESSAGE", payload: msg });
    });

    return () => socket.disconnect();
  }, [token]);

  // 📥 Load Conversations
  const fetchConversations = useCallback(async () => {
    dispatch({ type: "SET_LOADING_CONVOS", payload: true });
    const res = await api.get("/api/chat/conversations");
    dispatch({ type: "SET_CONVERSATIONS", payload: res.data.data.items });
    dispatch({ type: "SET_LOADING_CONVOS", payload: false });
  }, []);

  useEffect(() => {
    if (token) fetchConversations();
  }, [token, fetchConversations]);

  // 📂 Open Chat Room
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

      // Join room once
      if (joinedRoomRef.current !== conversation._id) {
        state.socket?.emit("chat:join", { conversationId: conversation._id });
        joinedRoomRef.current = conversation._id;
      }
    },
    [state.socket, state.activeConversation]
  );

  // ✉ Send Message
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

  // 🗑 Delete Conversation
  const deleteConversation = useCallback(async (id) => {
    await api.delete(`/api/chat/conversations/${id}`);
    dispatch({ type: "REMOVE_CONVERSATION", payload: id });
  }, []);

  // 👤 Get Other User (room name logic)
  const getOtherUser = useCallback(
    (conversation) => {
      return conversation?.participants?.find(
        (p) => String(p._id) !== String(user?._id)
      );
    },
    [user]
  );

  const totalUnread = useMemo(() => {
    return state.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [state.conversations]);

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
