import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-ink-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="rounded-lg border border-border bg-card px-3 py-2.5 text-[13px] text-ink-900 outline-none focus:border-primary"
      />
    </label>
  );
}

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const storageKey = `profile_${currentUser?.id}`;

  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const data = JSON.parse(stored);
      setFullName(data.fullName || currentUser?.name || "");
      setTargetRole(data.targetRole || "");
      setLocation(data.location || "");
    }
  }, [storageKey]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ fullName, targetRole, location }));
      await new Promise((r) => setTimeout(r, 400));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <main className="flex flex-col gap-6 p-6">
      <PageHeader title="Profile" subtitle="Manage your account details and preferences." />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="text-[14.5px] font-semibold">Account details</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Field label="Email" value={currentUser?.email || ""} type="email" />
            <Field label="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            <Field label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-fit rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved && <span className="text-[12.5px] font-medium text-green-600">✓ Saved</span>}
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="text-[14.5px] font-semibold">Plan</div>
          <div className="rounded-lg bg-primary-soft p-4">
            <div className="text-[13px] font-semibold text-primary">Free plan</div>
            <div className="mt-1 text-[12px] text-ink-500">Upgrade for unlimited analyses</div>
          </div>
          <button className="rounded-lg border border-border bg-canvas py-2.5 text-[12.5px] font-semibold text-ink-700">
            Manage billing
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-200 bg-red-50 py-2.5 text-[12.5px] font-semibold text-red-600"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}
