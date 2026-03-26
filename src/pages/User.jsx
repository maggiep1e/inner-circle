import { useState, useEffect } from "react";
import { useProfileStore } from "../store/profileStore";
import { useSessionStore } from "../store/sessionStore";

export default function UserSettingsPage() {
  const profile = useSessionStore((s) => s.profile);
  const profileAvatarUrl = useSessionStore((s) => s.profileAvatarUrl);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);

  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [description, setDescription] = useState(profile.description || "");
  const [color, setColor] = useState(profile.color || "");
  const [plan, setPlan] = useState(profile.plan || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      await uploadAvatar(file);
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveProfile({ display_name: displayName, description, color });
      alert("Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-black dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6">User Settings</h1>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <img
            src={profileAvatarUrl}
            className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
            alt={displayName}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className="mt-2"
          />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        </div>

        {/* Profile Info Form */}
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            Display Name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700"
            />
          </label>

          <label className="flex flex-col gap-1">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700"
            />
          </label>

          <label className="flex flex-col gap-1">
            Profile Color
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 border rounded-lg cursor-pointer"
            />
          </label>

          <label className="flex flex-col gap-1">
            Plan
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
            >
              <option value="free">Free</option>
            </select>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}