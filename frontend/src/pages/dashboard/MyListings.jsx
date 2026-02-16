import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Images } from "lucide-react";

export default function MyListings() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const resolveImg = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiBase}${url}`;
  };

  const load = async () => {
    setLoading(true);
    const res = await api.get("/api/products/my", { params: { page: 1, limit: 50 } });
    setItems(res.data.data.items);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/api/products/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="rounded-3xl bg-white shadow-soft border p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-black text-2xl text-slate-900">My Listings</div>
          <div className="text-slate-500 text-sm">Manage your products</div>
        </div>

        <Link
          to="/dashboard/add-product"
          className="px-4 py-2 rounded-2xl bg-slate-900 text-white font-black"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-slate-500">No listings yet.</div>
        ) : (
          items.map((p) => {
            const img = resolveImg(p?.images?.[0]?.url);
            const extraPhotos = Math.max((p?.images?.length || 0) - 1, 0);

            return (
              <div
                key={p._id}
                className="rounded-2xl border border-slate-200 hover:border-slate-400 transition bg-white p-4 flex items-center justify-between gap-4"
              >
                {/* CLICKABLE AREA */}
                <button
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="flex-1 text-left flex items-center gap-4 group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-20 rounded-2xl bg-slate-100 overflow-hidden border">
                    {img ? (
                      <img src={img} alt={p.title} className="h-16 w-20 object-cover" />
                    ) : null}

                    {extraPhotos > 0 && (
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[11px] px-2 py-1 rounded-full flex items-center gap-1">
                        <Images className="w-3 h-3" />
                        +{extraPhotos} photos
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="font-black text-lg text-slate-900 group-hover:underline">
                      {p.title}
                    </div>

                    <div className="text-sm text-slate-600 mt-1">
                      ₹{Number(p.price).toLocaleString("en-IN")} •{" "}
                      <span className="font-semibold">{p.status}</span>
                    </div>

                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span>{p.category}</span>
                      <span>•</span>
                      <span>{p.condition}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {p.location}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      Posted on {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </button>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/edit/${p._id}`}
                    className="px-4 py-2 rounded-xl border bg-white font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      del(p._id);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
