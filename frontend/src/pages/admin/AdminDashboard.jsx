import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Users, Package, Flag } from "lucide-react";

function Card({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white shadow-soft border p-5">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{label}</span>
      </div>
      <div className="mt-2 font-black text-3xl text-slate-900">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [a, setA] = useState({ totalUsers: 0, totalProducts: 0, totalReports: 0 });

  useEffect(() => {
    const run = async () => {
      const res = await api.get("/api/admin/analytics");
      setA(res.data.data);
    };
    run();
  }, []);

  return (
    <div>
      <div className="rounded-3xl bg-white shadow-soft border p-6">
        <div className="font-black text-2xl text-slate-900">Admin Dashboard</div>
        <div className="text-slate-500 text-sm mt-1">Analytics overview</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Card icon={Users} label="Total Users" value={a.totalUsers} />
        <Card icon={Package} label="Total Products" value={a.totalProducts} />
        <Card icon={Flag} label="Total Reports" value={a.totalReports} />
      </div>
    </div>
  );
}
