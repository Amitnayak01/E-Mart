import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CitySelect from "../../components/common/CitySelect";


const categories = [
  "Mobiles","Electronics","Cars","Bikes","Furniture","Fashion","Books","Sports","Real Estate","Jobs","Services"
];

export default function AddProduct() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "Mobiles",
    condition: "used",
    description: "",
    location: "",
    images: []
  });

  const submit = async (e) => {
  e.preventDefault();

  // ✅ client-side validation
  if (!form.title.trim()) return toast.error("Title is required");
  if (!form.location.trim()) return toast.error("Location is required");
  if (!form.description.trim()) return toast.error("Description is required");

  const priceNum = Number(form.price);
  if (!priceNum || priceNum <= 0) return toast.error("Enter valid price");

  if (!form.images.length) return toast.error("Please select at least 1 image");

  setBusy(true);

  try {
    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("price", priceNum); // ✅ number
    fd.append("category", form.category);
    fd.append("condition", form.condition);
    fd.append("description", form.description.trim());
    fd.append("location", form.location.trim());

    for (const f of form.images) fd.append("images", f);

    await api.post("/api/products", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Product added");
    navigate("/dashboard/my-listings");
  } catch (err) {
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
    toast.error(err.response?.data?.message || "Upload failed");
  } finally {
    setBusy(false);
  }
};


  return (
    <div className="rounded-3xl bg-white shadow-soft border p-6">
      <div className="font-black text-2xl text-slate-900">Add Product</div>
      <div className="text-slate-500 text-sm mt-1">Create a new marketplace listing</div>

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

      <div className="md:col-span-2">
  <label className="text-sm font-semibold">City</label>
  <CitySelect
    value={form.location}
    onChange={(city) => setForm((p) => ({ ...p, location: city }))}
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
          <label className="text-sm font-semibold">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="mt-1 w-full"
            onChange={(e) => setForm((p) => ({ ...p, images: Array.from(e.target.files || []) }))}
          />
          <div className="text-xs text-slate-500 mt-1">Max 6 images</div>
        </div>

        <button disabled={busy} className="md:col-span-2 py-3 rounded-2xl bg-slate-900 text-white font-black disabled:opacity-60">
          {busy ? "Uploading..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
