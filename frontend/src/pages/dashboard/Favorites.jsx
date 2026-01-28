import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import ProductCard from "../../components/products/ProductCard";
import { useFavorites } from "../../context/FavoriteContext";

export default function Favorites() {
  const favCtx = useFavorites();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const run = async () => {
      const res = await api.get("/api/favorites");
      const list = res.data.data.items || [];

      setItems(list);

      // ✅ sync badge ids
      const ids = list.map((p) => p._id).filter(Boolean);
      favCtx.setAll(ids);
    };

    run();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="rounded-3xl bg-white shadow-soft border p-6">
        <div className="font-black text-2xl text-slate-900">Favorites</div>
        <div className="text-slate-500 text-sm mt-1">Saved products</div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}

        {items.length === 0 && (
          <div className="text-slate-500 mt-6">No favorites yet.</div>
        )}
      </div>
    </div>
  );
}
