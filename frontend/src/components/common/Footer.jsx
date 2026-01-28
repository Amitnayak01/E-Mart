import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <div className="font-black text-slate-900 text-lg">E-Mart</div>
          <div className="text-slate-500 text-sm">
            Buy & Sell Marketplace • OLX-style UI • Real-time chat
          </div>
        </div>
        <div className="text-slate-500 text-sm">
          © {new Date().getFullYear()} E-Mart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
