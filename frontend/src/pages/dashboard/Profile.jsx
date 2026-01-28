import React, { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [busy, setBusy] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    location: user?.location || ""
  });

  const [pass, setPass] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const saveProfile = async () => {
    setBusy(true);
    try {
      await api.put("/api/auth/profile", profile);
      toast.success("Profile updated");
      await refreshMe();
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    setBusy(true);
    try {
      await api.put("/api/auth/change-password", pass);
      toast.success("Password updated");
      setPass({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } finally {
      setBusy(false);
    }
  };

  const uploadAvatar = async (file) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      await api.put("/api/auth/avatar", fd);
      toast.success("Avatar updated");
      await refreshMe();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white shadow-soft border p-6">
        <div className="font-black text-2xl text-slate-900">Profile</div>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="avatar" className="h-16 w-16 object-cover" />
            ) : null}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Location</label>
            <input
              value={profile.location}
              onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>
        </div>

        <button
          disabled={busy}
          onClick={saveProfile}
          className="mt-4 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black disabled:opacity-60"
        >
          Save Profile
        </button>
      </div>

      <div className="rounded-3xl bg-white shadow-soft border p-6">
        <div className="font-black text-xl text-slate-900">Change Password</div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="password"
            placeholder="Current password"
            value={pass.currentPassword}
            onChange={(e) => setPass((p) => ({ ...p, currentPassword: e.target.value }))}
            className="rounded-xl border px-3 py-2"
          />
          <input
            type="password"
            placeholder="New password"
            value={pass.newPassword}
            onChange={(e) => setPass((p) => ({ ...p, newPassword: e.target.value }))}
            className="rounded-xl border px-3 py-2"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={pass.confirmNewPassword}
            onChange={(e) => setPass((p) => ({ ...p, confirmNewPassword: e.target.value }))}
            className="rounded-xl border px-3 py-2"
          />
        </div>

        <button
          disabled={busy}
          onClick={changePassword}
          className="mt-4 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black disabled:opacity-60"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}
