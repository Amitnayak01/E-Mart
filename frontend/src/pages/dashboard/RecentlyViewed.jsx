import React, { useEffect, useState } from "react";
import ProductCard from "../../components/products/ProductCard";
import api from "../../api/axios";

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncRecentlyViewed = async () => {
      try {
        const key = "emart_recent";
        const stored = JSON.parse(localStorage.getItem(key) || "[]");

        if (!stored.length) {
          setItems([]);
          setLoading(false);
          return;
        }

        // Extract IDs
        const ids = stored.map((p) => p._id);

        // Ask backend which products still exist
        const res = await api.post("/api/products/bulk-exists", { ids });

        const validProducts = res.data.data.items || [];

        // Update UI
        setItems(validProducts);

        // Also update localStorage to remove deleted ads
        localStorage.setItem(key, JSON.stringify(validProducts));
      } catch (err) {
        console.error("Recently viewed sync failed", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    syncRecentlyViewed();
  }, []);

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <div className="rounded-3xl bg-white shadow-soft border p-6">
        <div className="font-black text-2xl text-slate-900">Recently Viewed</div>
        <div className="text-slate-500 text-sm mt-1">
          Automatically hides deleted listings
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}

        {items.length === 0 && (
          <div className="text-slate-500 mt-6">
            No recently viewed products.
          </div>
        )}
      </div>
    </div>
  );
}
