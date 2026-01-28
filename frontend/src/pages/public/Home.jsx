import React, { useEffect } from "react";
import { useProducts } from "../../context/ProductContext";
import ProductCard from "../../components/products/ProductCard";
import { SkeletonList } from "../../components/common/Skeletons";
import { Link } from "react-router-dom";

const categories = [
  "Mobiles",
  "Electronics",
  "Cars",
  "Bikes",
  "Furniture",
  "Fashion",
  "Books",
  "Sports",
  "Real Estate",
  "Jobs",
  "Services"
];

export default function Home() {
  const { items, loading, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts({
      page: 1,
      limit: 12,
      sort: "latest",
      status: "Available"
    });
    // eslint-disable-next-line
  }, []);

  return (
    <div className="space-y-8 md:space-y-10">
      {/* HERO */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-soft overflow-hidden">
        <div className="p-5 sm:p-6 md:p-10">

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
            Buy & Sell Anything.
            <br className="hidden sm:block" />
            The Premium Marketplace Experience.
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/80 max-w-xl">
            E-Mart is a production-ready  marketplace: premium listings UI,
            real-time chat, favorites, reports, admin moderation, and analytics.
          </p>

          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-slate-900 font-black text-center"
            >
              Explore Marketplace
            </Link>

            <Link
              to="/dashboard/add-product"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900/30 border border-white/20 font-black text-center"
            >
              Sell a Product
            </Link>
          </div>

        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-lg sm:text-xl md:text-2xl">
            Browse Categories
          </h2>

          <Link to="/products" className="text-slate-900 font-semibold underline text-sm sm:text-base">
            View all
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((c) => (
            <Link
              key={c}
              to={`/products?category=${encodeURIComponent(c)}`}
              className="rounded-2xl bg-white shadow-soft border px-3 py-3 sm:px-4 sm:py-4 hover:bg-slate-50 font-bold text-sm sm:text-base text-center"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST LISTINGS */}
      <section>
        <h2 className="font-black text-slate-900 text-lg sm:text-xl md:text-2xl">
          Latest Listings
        </h2>

        <div className="mt-4">
          {loading ? (
            <SkeletonList count={8} />
          ) : items.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-soft border p-5 sm:p-6 mt-4">
              <div className="font-black text-slate-900 text-base sm:text-lg">No listings found</div>
              <div className="text-slate-500 text-sm mt-1">
                Add your first product and it will appear here.
              </div>

              <Link
                to="/dashboard/add-product"
                className="inline-block mt-4 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black"
              >
                Add Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {items.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
