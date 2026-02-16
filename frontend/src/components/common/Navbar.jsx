import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useFavorites } from "../../context/FavoriteContext";
import {
  MessageCircle,
  Shield,
  LayoutDashboard,
  Heart,
  LogOut,
  User
} from "lucide-react";
import logo from "../../assets/logo.svg";

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { totalUnread, fetchConversations } = useChat();
  const { count: favCount } = useFavorites();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (isAuthenticated) fetchConversations();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="E-Mart" className="h-10" />
        </Link>

        <div className="flex-1 hidden md:block">
          <SearchBar />
        </div>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Messages */}
              <button
                onClick={() => navigate("/dashboard/messages")}
                className="relative px-3 py-2 rounded-xl bg-white border shadow-soft"
              >
                <MessageCircle className="w-5 h-5" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-rose-600 text-white px-2 rounded-full">
                    {totalUnread}
                  </span>
                )}
              </button>

              {/* Favorites */}
              <button
                onClick={() => navigate("/dashboard/favorites")}
                className="relative px-3 py-2 rounded-xl bg-white border shadow-soft"
              >
                <Heart className="w-5 h-5" />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-rose-600 text-white px-2 rounded-full">
                    {favCount}
                  </span>
                )}
              </button>

              <NavLink
                to="/dashboard"
                className="px-3 py-2 rounded-xl bg-white border shadow-soft flex items-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden md:inline font-semibold">Dashboard</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="px-3 py-2 rounded-xl bg-white border shadow-soft flex items-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  <span className="hidden md:inline font-semibold">Admin</span>
                </NavLink>
              )}

              {/* ✅ PROFILE DROPDOWN */}
             {/* ✅ PROFILE DROPDOWN (Desktop + Mobile) */}
<div className="relative" ref={menuRef}>
  <button
    onClick={() => setOpen((p) => !p)}
    className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl bg-white border shadow-soft hover:bg-slate-50 transition"
  >
    {/* Avatar */}
    <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
      {user?.avatar?.url ? (
        <img
          src={
            user.avatar.url.startsWith("http")
              ? user.avatar.url
              : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${user.avatar.url}`
          }
          alt="avatar"
          className="h-8 w-8 object-cover"
        />
      ) : null}
    </div>

    {/* Username hidden on phone, visible on desktop */}
    <div className="hidden md:block text-sm text-left">
      <div className="font-bold text-slate-900">{user?.username}</div>
      <div className="text-slate-500">{user?.role}</div>
    </div>
  </button>

  {open && (
    <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-soft border p-2 z-50">
      <Link
        to="/dashboard/profile"
        onClick={() => setOpen(false)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold"
      >
        👤 Profile
      </Link>

      <button
        onClick={() => {
          logout();
          setOpen(false);
        }}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-left font-semibold text-rose-600"
      >
        🚪 Logout
      </button>
    </div>
  )}
</div>

            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-xl bg-white border shadow-soft font-semibold"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold"
              >
                Signup
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  );
}
