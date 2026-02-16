import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useFavorites } from "../../context/FavoriteContext";

const FAV_KEY = "emart_fav_ids";

function safeParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}

function getFavIds() {
  return safeParse(localStorage.getItem(FAV_KEY) || "[]");
}

function setFavIds(ids) {
  localStorage.setItem(FAV_KEY, JSON.stringify(ids));
}

function toggleFavLocal(productId, makeFav) {
  const ids = getFavIds();
  const exists = ids.includes(productId);

  if (makeFav && !exists) {
    const next = [productId, ...ids];
    setFavIds(next);
    return;
  }

  if (!makeFav && exists) {
    const next = ids.filter((x) => x !== productId);
    setFavIds(next);
  }
}

export default function ProductCard({ product }) {
  const favCtx = useFavorites();

  const apiBase = import.meta.env.VITE_API_BASE_URL || "https://e-mart-gamma-three.vercel.app";

  const resolveImg = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${apiBase}${url}`;
  };

  const img = resolveImg(product?.images?.[0]?.url);
  const productId = product?._id;

  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const ids = getFavIds();
    setIsFav(ids.includes(productId));
  }, [productId]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) return;
    if (favLoading) return;

    const token = localStorage.getItem("emart_token");
    if (!token) return toast.error("Login required to favorite");

    try {
      setFavLoading(true);

      if (isFav) {
        await api.delete(`/api/favorites/${productId}`);
        setIsFav(false);
        toggleFavLocal(productId, false);
        favCtx.remove(productId);
        toast.success("Removed from favorites");
      } else {
        await api.post(`/api/favorites/${productId}`);
        setIsFav(true);
        toggleFavLocal(productId, true);
        favCtx.add(productId);
        toast.success("Added to favorites");
      }
    } catch {
      toast.error("Favorite failed");
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-white shadow-soft border border-slate-100 overflow-hidden"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative h-44 bg-slate-100">
          {img ? (
            <img src={img} alt={product.title} className="h-44 w-full object-cover" />
          ) : (
            <div className="h-44 w-full flex items-center justify-center text-slate-400">
              No image
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            className={`absolute top-3 right-3 p-2 rounded-full border shadow bg-white/95 backdrop-blur transition active:scale-95 ${
              isFav ? "border-rose-200 bg-rose-50" : "border-slate-200 hover:bg-slate-50"
            } ${favLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            title={isFav ? "Remove Favorite" : "Add Favorite"}
          >
            <Heart
              className={`w-5 h-5 ${
                isFav ? "text-rose-600 fill-rose-600" : "text-slate-800"
              }`}
            />
          </button>
        </div>

        <div className="p-3">
          <div className="font-black text-slate-900 text-lg">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </div>

          <div className="mt-1 font-semibold text-slate-800 line-clamp-1">
            {product.title}
          </div>

          <div className="mt-2 text-sm text-slate-500 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {product.location}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{product.category}</span>
            <span>{new Date(product.createdAt).toLocaleDateString("en-IN")}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
