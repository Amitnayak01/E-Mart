import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const categories = [
  "Mobiles","Electronics","Cars","Bikes","Furniture","Fashion","Books","Sports","Real Estate","Jobs","Services"
];

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const run = async () => {
      const res = await api.get(`/api/products/${id}`);
      const p = res.data.data.product;
      setForm({
        title: p.title,
        price: p.price,
        category: p.category,
        condition: p.condition,
        description: p.description,
        location: p.location,
        status: p.status,
        images: []
      });
    };
    run();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "images") return;
        fd.append(k, v);
      });
      for (const f of form.images) fd.append("images", f);

      await api.put(`/api/products/${id}`, fd);
      toast.success("Updated");
      navigate("/dashboard/my-listings");
    } finally {
      setBusy(false);
    }
  };

  if (!form) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="rounded-3xl bg-white shadow-soft border p-6">
      <div className="font-black text-2xl text-slate-900">Edit Product</div>

      <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
        <div>
          <label className="text-sm font-semibold">Title</label>
          <input className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.title}
            onChange={(e)=>setForm(p=>({...p, title:e.target.value}))}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Price</label>
          <input className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.price}
            onChange={(e)=>setForm(p=>({...p, price:e.target.value}))}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Category</label>
          <select className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.category}
            onChange={(e)=>setForm(p=>({...p, category:e.target.value}))}
          >
            {categories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Condition</label>
          <select className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.condition}
            onChange={(e)=>setForm(p=>({...p, condition:e.target.value}))}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>

      

        <div>
          <label className="text-sm font-semibold">Location</label>
          <input className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.location}
            onChange={(e)=>setForm(p=>({...p, location:e.target.value}))}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold">Description</label>
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[120px]"
            value={form.description}
            onChange={(e)=>setForm(p=>({...p, description:e.target.value}))}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold">Replace Images (optional)</label>
          <input type="file" multiple accept="image/*"
            onChange={(e)=>setForm(p=>({...p, images:Array.from(e.target.files||[])}))}
          />
        </div>

        <button disabled={busy} className="md:col-span-2 py-3 rounded-2xl bg-slate-900 text-white font-black disabled:opacity-60">
          {busy ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
