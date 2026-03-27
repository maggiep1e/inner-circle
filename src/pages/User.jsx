import { useState, useEffect } from "react";
import { useProfileStore } from "../store/profileStore";

export default function UserSettingsPage() {
  const profile = useProfileStore((s) => s.profile);
  const profileAvatarUrl = useProfileStore((s) => s.profileAvatarUrl);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);


  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [plan, setPlan] = useState("free");

  // sync store → local form state
  useEffect(() => {
    if (!profile) return;

    setDisplayName(profile.display_name || "");
    setDescription(profile.description || "");
    setColor(profile.color || "");
    setPlan(profile.plan || "free");
  }, [profile]);

  if (!profile) {
    return (
      <div className="p-6 text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-zinc-900 text-black dark:text-white">

      <h1 className="text-3xl font-bold mb-6">User Settings</h1>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl space-y-6">

        {/* AVATAR */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={profileAvatarUrl}
            className="w-32 h-32 rounded-full object-cover"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
            }}
          />
        </div>

        {/* FORM */}
        <div className="space-y-4">

          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
            className="w-full p-2 border rounded"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="free">Free</option>
          </select>

        </div>

        {/* SAVE */}
        <div className="flex justify-end">
          <button
            onClick={() =>
              saveProfile({
                display_name: displayName,
                description,
                color,
                plan,
              })
            }
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}