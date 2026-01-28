import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ManageProducts() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await api.get("/api/admin/products");
    setItems(res.data.data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!confirm("Delete product?")) return;
    await api.delete(`/api/admin/products/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="rounded-3xl bg-white shadow-soft border p-6">
      <div className="font-black text-2xl text-slate-900">Manage Products</div>

      <div className="mt-6 space-y-3">
        {items.map((p) => (
          <div key={p._id} className="rounded-2xl border p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-black text-slate-900">{p.title}</div>
              <div className="text-sm text-slate-500">
                ₹{Number(p.price).toLocaleString("en-IN")} • {p.category} • Seller: {p.seller?.username}
              </div>
            </div>
            <button onClick={() => del(p._id)} className="px-3 py-2 rounded-xl bg-rose-600 text-white font-semibold">
              Delete
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="text-slate-500">No products.</div>}
      </div>
    </div>
  );
}
