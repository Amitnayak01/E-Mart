import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="rounded-3xl bg-white shadow-soft border p-10 text-center">
      <div className="font-black text-4xl text-slate-900">404</div>
      <div className="text-slate-500 mt-2">Page not found</div>
      <Link to="/" className="inline-block mt-6 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black">
        Go Home
      </Link>
    </div>
  );
}
