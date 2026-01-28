import React from "react";
import CitySelect from "../common/CitySelect";


export default function FiltersSidebar({ filters, onChange, onApply }) {
  return (
    <div className="rounded-2xl bg-white shadow-soft border p-5 space-y-4">
      <div className="font-black text-lg">Filters</div>

      {/* CATEGORY */}
      <div>
        <label className="text-sm font-semibold">Category</label>
        <select
          className="w-full mt-1 rounded-xl border px-3 py-2"
          value={filters.category || "All"}
          onChange={(e) =>
            onChange({
              category: e.target.value === "All" ? "" : e.target.value
            })
          }
        >
          <option>All</option>
          <option>Mobiles</option>
          <option>Electronics</option>
          <option>Cars</option>
          <option>Bikes</option>
          <option>Furniture</option>
          <option>Fashion</option>
          <option>Books</option>
        </select>
      </div>

      {/* CONDITION */}
      <div>
        <label className="text-sm font-semibold">Condition</label>
        <select
          className="w-full mt-1 rounded-xl border px-3 py-2"
          value={filters.condition || "Any"}
          onChange={(e) =>
            onChange({
              condition: e.target.value === "Any" ? "" : e.target.value
            })
          }
        >
          <option>Any</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>
      </div>

<div>
  <label className="text-sm font-semibold text-slate-700">City</label>
  <CitySelect
    value={filters.location}
    onChange={(city) => onChange({ location: city })}
  />
</div>



      {/* PRICE */}
      <div>
        <label className="text-sm font-semibold">Min Price</label>
        <input
          type="number"
          className="w-full mt-1 rounded-xl border px-3 py-2"
          value={filters.minPrice}
          onChange={(e) =>
            onChange({
              minPrice: e.target.value ? Number(e.target.value) : ""
            })
          }
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Max Price</label>
        <input
          type="number"
          className="w-full mt-1 rounded-xl border px-3 py-2"
          value={filters.maxPrice}
          onChange={(e) =>
            onChange({
              maxPrice: e.target.value ? Number(e.target.value) : ""
            })
          }
        />
      </div>

      <button
        onClick={onApply}
        className="w-full rounded-xl bg-slate-900 text-white py-3 font-black"
      >
        Apply Filters
      </button>
    </div>
  );
}
