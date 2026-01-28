import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await api.get("/api/admin/users");
    setItems(res.data.data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const ban = async (id) => {
    await api.patch(`/api/admin/users/${id}/ban`);
    toast.success("User banned");
    load();
  };

  const unban = async (id) => {
    await api.patch(`/api/admin/users/${id}/unban`);
    toast.success("User unbanned");
    load();
  };

  return (
    <div className="rounded-3xl bg-white shadow-soft border p-6">
      <div className="font-black text-2xl text-slate-900">Manage Users</div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">Username</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id} className="border-b">
                <td className="py-3 font-bold text-slate-900">{u.username}</td>
                <td className="font-semibold">{u.role}</td>
                <td className="text-slate-600">{u.isBanned ? "Banned" : "Active"}</td>
                <td className="text-right">
                  {u.isBanned ? (
                    <button onClick={() => unban(u._id)} className="px-3 py-2 rounded-xl bg-slate-900 text-white font-semibold">
                      Unban
                    </button>
                  ) : (
                    <button onClick={() => ban(u._id)} className="px-3 py-2 rounded-xl bg-rose-600 text-white font-semibold">
                      Ban
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="py-6 text-slate-500" colSpan={4}>No users.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
