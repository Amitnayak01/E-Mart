import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import ImageCarousel from "../../components/products/ImageCarousel";
import {
  Heart,
  Flag,
  MessageCircle,
  MapPin,
  Share2,
  ChevronRight,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

function formatOLXDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffDays = Math.round(
    (startOfToday - startOfDate) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Favorite states
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // ✅ share modal
  const [shareOpen, setShareOpen] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "https://e-mart-gamma-three.vercel.app";

  const resolveUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${apiBase}${url}`;
  };

  const fixedImages = useMemo(() => {
    return (product?.images || []).map((img) => ({
      ...img,
      url: resolveUrl(img.url)
    }));
  }, [product]);

  const saveRecentlyViewed = (p) => {
    const key = "emart_recent";
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    const next = [p, ...arr.filter((x) => x._id !== p._id)].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(next));
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/api/products/${id}`);
        const prod = res.data.data.product;

        setProduct(prod);
        setLoading(false);

        await api.post(`/api/products/${id}/view`).catch(() => {});
        saveRecentlyViewed(prod);

        // ✅ load favorite status if logged in
        if (isAuthenticated) {
          try {
            const favRes = await api.get(`/api/favorites/status/${id}`);
            setIsFav(!!favRes.data.data.isFavorite);
          } catch {
            setIsFav(false);
          }
        } else {
          setIsFav(false);
        }
      } catch (e) {
        setLoading(false);
        toast.error("Failed to open ad");
      }
    };

    run();
    // eslint-disable-next-line
  }, [id, isAuthenticated]);

  // ✅ favorite toggle
  const fav = async () => {
    if (!isAuthenticated) return toast.error("Please login first");
    if (favLoading) return;

    try {
      setFavLoading(true);

      if (isFav) {
        await api.delete(`/api/favorites/${id}`);
        setIsFav(false);
        toast.success("Removed from favorites");
      } else {
        await api.post(`/api/favorites/${id}`);
        setIsFav(true);
        toast.success("Added to favorites");
      }
    } catch {
      toast.error("Favorite failed");
    } finally {
      setFavLoading(false);
    }
  };

  const report = async () => {
    if (!isAuthenticated) return toast.error("Please login first");
    const reason = prompt("Report reason (e.g. scam, spam, fake listing):");
    if (!reason) return;
    await api.post(`/api/reports/${id}`, { reason, description: "" });
    toast.success("Report submitted");
  };

  const startChat = async () => {
    if (!isAuthenticated) return toast.error("Please login first");

    const sellerId = product?.seller?._id;
    if (!sellerId) return toast.error("Seller not found");

    const res = await api.post("/api/chat/conversations", { otherUserId: sellerId });
    const convo = res.data.data.conversation;
    navigate("/dashboard/messages", { state: { convoId: convo._id } });
  };

  // ✅ share helpers
  const getShareUrl = () => window.location.href;

  const copyLink = async () => {
    try {
      const url = getShareUrl();

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        return;
      }

      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);

      toast.success("Link copied!");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const nativeShare = async () => {
    try {
      const url = getShareUrl();
      const title = product?.title ? `E-Mart: ${product.title}` : "E-Mart listing";

      if (!navigator.share) {
        toast.error("Native share not supported");
        return;
      }

      await navigator.share({
        title,
        text: "Check this listing on E-Mart",
        url
      });
    } catch {
      // user cancel share => ignore
    }
  };

  const openSocialShare = (platform) => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`Check this listing on E-Mart: ${product?.title || ""}`);

    let shareUrl = "";

    if (platform === "whatsapp") shareUrl = `https://wa.me/?text=${text}%20${url}`;
    if (platform === "telegram") shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    if (platform === "facebook") shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (platform === "twitter") shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

    if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) return <div className="text-slate-500">Loading ad...</div>;
  if (!product) return <div className="text-slate-500">Ad not found</div>;

  const postedLabel = formatOLXDate(product.createdAt);
  const adId = product._id?.slice(-8)?.toUpperCase();

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:underline">
          Marketplace
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 font-semibold">{product.category}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 font-semibold line-clamp-1">
          {product.title}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left */}
        <section className="xl:col-span-8 space-y-4">
          <ImageCarousel images={fixedImages} />

          {/* Details */}
          <div className="rounded-2xl bg-white shadow-soft border p-5">
            <div className="font-black text-slate-900 text-lg">Details</div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between border rounded-xl px-3 py-2">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold">{product.category}</span>
              </div>

              <div className="flex justify-between border rounded-xl px-3 py-2">
                <span className="text-slate-500">Condition</span>
                <span className="font-semibold">{product.condition}</span>
              </div>


              <div className="flex justify-between border rounded-xl px-3 py-2">
                <span className="text-slate-500">Posted</span>
                <span className="font-semibold">{postedLabel}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="font-black text-slate-900 text-lg">Description</div>
              <div className="mt-2 text-slate-700 whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          </div>
        </section>

        {/* Right */}
        <section className="xl:col-span-4 space-y-4">
          {/* Price box */}
          <div className="rounded-2xl bg-white shadow-soft border p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-black text-3xl text-slate-900">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </div>
                <div className="mt-1 font-bold text-slate-800">{product.title}</div>
                <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {product.location}
                </div>
              </div>

              <div className="flex gap-2">
                {/* Share */}
                <button
                  onClick={() => setShareOpen(true)}
                  className="p-2 rounded-xl border bg-white hover:bg-slate-50 active:scale-95 transition"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {/* Favorite */}
                <button
                  onClick={fav}
                  disabled={favLoading}
                  className={`p-2 rounded-xl border active:scale-95 transition ${
                    isFav ? "bg-rose-50 border-rose-200" : "bg-white hover:bg-slate-50"
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
            </div>

            <div className="mt-3 text-xs text-slate-500">
              {postedLabel} •{" "}
              {new Date(product.createdAt).toLocaleTimeString([], {
                hour: (navigator.language || "").toLowerCase().includes("en") ? "2-digit" : undefined,
                minute: "2-digit"
              })}
            </div>
          </div>

          {/* Seller box */}
          <div className="rounded-2xl bg-white shadow-soft border p-5">
            <div className="text-slate-500 text-sm">Posted By</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                {product?.seller?.avatar?.url ? (
                  <img
                    src={resolveUrl(product.seller.avatar.url)}
                    alt="seller"
                    className="h-12 w-12 object-cover"
                  />
                ) : null}
              </div>

              <div>
                <div className="font-black text-slate-900">
                  {product?.seller?.name || product?.seller?.username || "Seller"}
                </div>
                <div className="text-xs text-slate-500">
                  Last seen:{" "}
                  {product?.seller?.lastSeenAt
                    ? new Date(product.seller.lastSeenAt).toLocaleString()
                    : "unknown"}
                </div>
              </div>
            </div>

            <button
              onClick={startChat}
              className="mt-4 w-full py-3 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with seller
            </button>

            <button
              onClick={report}
              className="mt-3 w-full py-3 rounded-2xl border bg-white font-black flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <Flag className="w-5 h-5" />
              Report this ad
            </button>
          </div>

          {/* Posted in */}
          <div className="rounded-2xl bg-white shadow-soft border p-5">
            <div className="font-black text-slate-900">Posted in</div>
            <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {product.location}
            </div>

            <div className="mt-4 text-xs text-slate-500 flex justify-between">
              <span>Ad ID</span>
              <span className="font-semibold text-slate-700">{adId}</span>
            </div>
          </div>
        </section>
      </div>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* overlay */}
            <button
              onClick={() => setShareOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            {/* modal */}
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md rounded-3xl bg-white shadow-soft border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-black text-xl text-slate-900">
                    Share this ad
                  </div>
                  <div className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {product?.title}
                  </div>
                </div>

                <button
                  onClick={() => setShareOpen(false)}
                  className="p-2 rounded-xl border bg-white hover:bg-slate-50"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={copyLink}
                  className="py-3 rounded-2xl bg-slate-900 text-white font-black hover:opacity-95"
                >
                  Copy Link
                </button>

                <button
                  onClick={nativeShare}
                  className="py-3 rounded-2xl border bg-white font-black hover:bg-slate-50"
                >
                  Share (Mobile)
                </button>

                <button
                  onClick={() => openSocialShare("whatsapp")}
                  className="py-3 rounded-2xl border bg-white font-black hover:bg-slate-50"
                >
                  WhatsApp
                </button>

                <button
                  onClick={() => openSocialShare("telegram")}
                  className="py-3 rounded-2xl border bg-white font-black hover:bg-slate-50"
                >
                  Telegram
                </button>

                <button
                  onClick={() => openSocialShare("facebook")}
                  className="py-3 rounded-2xl border bg-white font-black hover:bg-slate-50"
                >
                  Facebook
                </button>

                <button
                  onClick={() => openSocialShare("twitter")}
                  className="py-3 rounded-2xl border bg-white font-black hover:bg-slate-50"
                >
                  X (Twitter)
                </button>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-500 font-semibold mb-1">
                  Share URL
                </div>
                <div className="text-xs rounded-2xl border bg-slate-50 px-3 py-2 break-all text-slate-700">
                  {getShareUrl()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
