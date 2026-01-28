import React, { useEffect } from "react";
import { useProducts } from "../../context/ProductContext";
import FiltersSidebar from "../../components/products/FiltersSidebar";
import ProductCard from "../../components/products/ProductCard";
import Pagination from "../../components/common/Pagination";
import { SkeletonList } from "../../components/common/Skeletons";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

export default function ProductList() {
  const { items, loading, filters, pagination, dispatch, fetchProducts } = useProducts();
  const [params] = useSearchParams();

  useEffect(() => {
    const q = params.get("q") || "";
    const category = params.get("category") || "";

    fetchProducts({
      page: 1,
      q,
      category,
      status: "Available"
    });
    // eslint-disable-next-line
  }, [params.toString()]);

  const onApply = () => {
    fetchProducts({ page: 1 });
  };

  const onFav = async (product) => {
    try {
      await api.post(`/api/favorites/${product._id}`);
      toast.success("Added to favorites");
    } catch {
      toast.error("Login required to favorite");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3 hidden lg:block">
        <FiltersSidebar
          filters={filters}
          onChange={(f) => dispatch({ type: "SET_FILTERS", payload: f })}
          onApply={onApply}
        />
      </aside>

      <section className="lg:col-span-9">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="font-black text-slate-900 text-2xl">Marketplace</div>
            <div className="text-sm text-slate-500">
              Showing {pagination.total} listings
            </div>
          </div>

          <select
            className="rounded-xl border bg-white px-3 py-2"
            value={filters.sort}
            onChange={(e) =>
              fetchProducts({ page: 1, sort: e.target.value })
            }
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        <div className="mt-4">
          {loading ? (
            <SkeletonList count={12} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((p) => (
                <ProductCard key={p._id} product={p} onFav={onFav} />
              ))}
            </div>
          )}

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={(p) => fetchProducts({ page: p })}
          />
        </div>
      </section>
    </div>
  );
}
