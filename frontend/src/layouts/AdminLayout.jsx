import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Users, Package, Flag } from "lucide-react";

const Item = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end
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

export default function AdminLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3">
        <div className="rounded-2xl bg-white shadow-soft border p-4 sticky top-24">
          <div className="font-black text-slate-900 text-lg mb-3">Admin Panel</div>
          <div className="space-y-2">
            <Item to="/admin" icon={BarChart3} label="Dashboard" />
            <Item to="/admin/users" icon={Users} label="Manage Users" />
            <Item to="/admin/products" icon={Package} label="Manage Products" />
            <Item to="/admin/reports" icon={Flag} label="Reports" />
          </div>
        </div>
      </aside>

      <section className="lg:col-span-9">
        <Outlet />
      </section>
    </div>
  );
}
