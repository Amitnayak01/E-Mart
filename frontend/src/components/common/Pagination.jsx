import React from "react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-xl border bg-white disabled:opacity-40"
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-2 rounded-xl border ${
            p === page ? "bg-slate-900 text-white" : "bg-white"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-xl border bg-white disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
