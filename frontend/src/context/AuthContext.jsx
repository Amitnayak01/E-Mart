import React, { createContext, useContext, useEffect, useReducer } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem("emart_token") || null,
  loading: true
};

function normalizeUser(u) {
  if (!u) return null;
  return {
    ...u,
    _id: u._id || u.id // 🔥 unify id format for entire app
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "AUTH_LOADING":
      return { ...state, loading: true };

    case "AUTH_READY":
      return { ...state, loading: false };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: normalizeUser(action.payload.user),
        token: action.payload.token,
        loading: false
      };

    case "SET_USER":
      return {
        ...state,
        user: normalizeUser(action.payload),
        loading: false
      };

    case "LOGOUT":
      return { ...state, user: null, token: null, loading: false };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const saveToken = (token) => {
    localStorage.setItem("emart_token", token);
  };

  const clearToken = () => {
    localStorage.removeItem("emart_token");
  };

  const login = async ({ username, password }) => {
    dispatch({ type: "AUTH_LOADING" });
    const res = await api.post("/api/auth/login", { username, password });

    const { token, user } = res.data.data;
    saveToken(token);

    dispatch({ type: "LOGIN_SUCCESS", payload: { token, user } });
    toast.success("Welcome back!");
  };

  const signup = async ({ username, password, confirmPassword }) => {
    dispatch({ type: "AUTH_LOADING" });
    const res = await api.post("/api/auth/signup", { username, password, confirmPassword });

    const { token, user } = res.data.data;
    saveToken(token);

    dispatch({ type: "LOGIN_SUCCESS", payload: { token, user } });
    toast.success("Account created!");
  };

  const logout = () => {
    clearToken();
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out");
  };

  const refreshMe = async () => {
    try {
      if (!localStorage.getItem("emart_token")) {
        dispatch({ type: "AUTH_READY" });
        return;
      }

      const res = await api.get("/api/auth/me");
      dispatch({ type: "SET_USER", payload: res.data.data.user });

    } catch {
      clearToken();
      dispatch({ type: "LOGOUT" });
    }
  };

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line
  }, []);

  const value = {
    ...state,
    isAuthenticated: !!state.token,
    isAdmin: state.user?.role === "admin",
    login,
    signup,
    logout,
    refreshMe
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
