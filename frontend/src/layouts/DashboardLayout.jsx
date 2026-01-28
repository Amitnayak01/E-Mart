import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Heart,
  LayoutDashboard,
  MessageCircle,
  PlusCircle,
  User,
  Eye,
  List,
  Menu
} from "lucide-react";

const Item = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-xl font-semibold ${
        isActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"
      }`
    }
  >
    <Icon className="w-5 h-5" />
    {label}
  </NavLink>
);

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/my-listings", icon: List, label: "My Listings" },
    { to: "/dashboard/add-product", icon: PlusCircle, label: "Add Product" },
    { to: "/dashboard/favorites", icon: Heart, label: "Favorites" },
    { to: "/dashboard/recent", icon: Eye, label: "Recently Viewed" },
    { to: "/dashboard/messages", icon: MessageCircle, label: "Messages" },
    { to: "/dashboard/profile", icon: User, label: "Profile" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* 📱 MOBILE DROPDOWN MENU */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white font-semibold"
        >
          <Menu className="w-5 h-5" />
          Dashboard Menu
        </button>

        {open && (
          <div className="mt-3 space-y-2 bg-white border rounded-2xl shadow-soft p-3">
            {menuItems.map((item) => (
              <Item
                key={item.to}
                {...item}
                onClick={() => setOpen(false)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 💻 DESKTOP SIDEBAR */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="rounded-2xl bg-white shadow-soft border p-4 sticky top-24">
          <div className="font-black text-slate-900 text-lg mb-3">Dashboard</div>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Item key={item.to} {...item} />
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="lg:col-span-9">
        <Outlet />
      </section>
    </div>
  );
}
