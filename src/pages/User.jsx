import { useState, useEffect } from "react";
import { useProfileStore } from "../store/profileStore";

export default function UserSettings() {
  const { profile, saveProfile, loading } = useProfileStore();

  // Form state mirrors profile fields
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [plan, setPlan] = useState("free");
  const [saving, setSaving] = useState(false);


  // Sync local form state when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.display_name || "");
      setAvatar(profile.avatar || "");
      setPlan(profile.plan || "free");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({ display_name: name, avatar, plan });
      alert("Profile saved!");
    } catch (err) {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Settings</h1>

      <section className="bg-white dark:bg-zinc-900 p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <div className="flex flex-col gap-2">
          <label>Name</label>
          <input
            className="p-2 border rounded bg-zinc-100 dark:bg-zinc-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>Avatar URL</label>
          <input
            className="p-2 border rounded bg-zinc-100 dark:bg-zinc-800"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
          {avatar && (
            <img
              src={avatar}
              alt="avatar preview"
              className="w-24 h-24 rounded-full mt-2"
            />
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Save Profile
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-900 p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Account</h2>
        <p>Plan: <strong>{plan === "paid" ? "Paid" : "Free"}</strong></p>
        {plan === "free" && (
          <button
            className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => alert("Redirect to upgrade page")}
          >
            Upgrade to Paid
          </button>
        )}
      </section>
    </div>
  );
}