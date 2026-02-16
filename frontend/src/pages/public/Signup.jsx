import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signup(form);
      navigate("/");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-3xl bg-white shadow-soft border p-6">
        <div className="font-black text-2xl text-slate-900">Signup</div>
        <div className="text-slate-500 text-sm mt-1">Create your E-Mart account</div>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold">Username</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="amit"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="******"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Confirm Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.confirmPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="******"
            />
          </div>

          <button
            disabled={busy}
            className="w-full py-3 rounded-2xl bg-slate-900 text-white font-black disabled:opacity-60"
          >
            {busy ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-slate-900 underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
