import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Package, Heart, Flag, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";   // ✅ ADD

function Stat({ icon: Icon, label, value, to }) {
  const navigate = useNavigate();                 // ✅ ADD

  return (
    <div
      onClick={() => navigate(to)}                // ✅ CLICK ACTION
      className="rounded-2xl bg-white shadow-soft border p-4 transition cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-slate-300"
    >
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="mt-2 font-black text-2xl text-slate-900">{value}</div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, favorites: 0 });

  useEffect(() => {
    const run = async () => {
      const my = await api.get("/api/products/my", { params: { page: 1, limit: 1 } });
      const fav = await api.get("/api/favorites");
      setStats({
        products: my.data.data.pagination.total,
        favorites: fav.data.data.items.length
      });
    };
    run();
  }, []);

  return (
    <div>
      <div className="rounded-3xl bg-white shadow-soft border p-6">
        <div className="text-slate-500 text-sm">Welcome</div>
        <div className="font-black text-3xl text-slate-900">{user?.username}</div>
        <div className="text-slate-500 mt-1">
          Manage listings, favorites, messages and profile from here.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <Stat
          icon={Package}
          label="My Listings"
          value={stats.products}
          to="/dashboard/my-listings"
        />
        <Stat
          icon={Heart}
          label="Favorites"
          value={stats.favorites}
          to="/dashboard/favorites"
        />
        <Stat
          icon={Flag}
          label="Reports"
          value={"—"}
          to="/dashboard/reports"
        />
        <Stat
          icon={Users}
          label="Role"
          value={user?.role}
          to="/dashboard/profile"
        />
      </div>
    </div>
  );
}
