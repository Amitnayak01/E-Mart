import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ initialQ = "" }) {
  const [q, setQ] = useState(initialQ);
  const [suggestions, setSuggestions] = useState([]);
  const debounced = useDebounce(q, 350);
  const navigate = useNavigate();

  const show = useMemo(() => debounced.trim().length >= 2, [debounced]);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        if (!show) {
          setSuggestions([]);
          return;
        }
        const res = await api.get("/api/products", { params: { q: debounced, limit: 5, page: 1 } });
        const items = res.data?.data?.items || [];
        if (!ignore) setSuggestions(items.map((p) => ({ id: p._id, title: p.title })));
      } catch {
        if (!ignore) setSuggestions([]);
      }
    };

    run();
    return () => {
      ignore = true;
    };
  }, [debounced, show]);

  const onSubmit = (e) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(q)}`);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 bg-white rounded-2xl shadow-soft px-3 py-2 border border-slate-100"
      >
        <Search className="w-5 h-5 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search mobiles, cars, bikes, furniture..."
          className="w-full outline-none bg-transparent text-slate-800"
        />
        <div className="hidden md:flex items-center gap-1 text-slate-500 text-sm">
          <MapPin className="w-4 h-4" />
          <span>India</span>
        </div>
        <button className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold">
          Search
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl bg-white shadow-soft border overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/product/${s.id}`)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50"
            >
              {s.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
