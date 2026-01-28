import React from "react";

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white shadow-soft p-3">
      <div className="h-40 w-full rounded-xl bg-slate-200" />
      <div className="mt-3 h-5 w-2/3 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/3 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
    </div>
  );
}

export function SkeletonList({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
