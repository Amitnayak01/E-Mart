import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Reports() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await api.get("/api/reports");
    setItems(res.data.data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!confirm("Delete report?")) return;
    await api.delete(`/api/reports/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="rounded-3xl bg-white shadow-soft border p-6">
      <div className="font-black text-2xl text-slate-900">Reports</div>

      <div className="mt-6 space-y-3">
        {items.map((r) => (
          <div key={r._id} className="rounded-2xl border p-4">
            <div className="font-black text-slate-900">{r.reason}</div>
            <div className="text-sm text-slate-500 mt-1">
              Reporter: {r.reporter?.username} • Product: {r.product?.title}
            </div>
            {r.description ? <div className="text-sm text-slate-700 mt-2">{r.description}</div> : null}
            <div className="mt-3 flex justify-end">
              <button onClick={() => del(r._id)} className="px-3 py-2 rounded-xl bg-rose-600 text-white font-semibold">
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-slate-500">No reports found.</div>}
      </div>
    </div>
  );
}
