import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSessionStore } from "../store/sessionStore";

export default function UserSettings() {
  const profile = useSessionStore((s) => s.profile);
  const user = useSessionStore((s) => s.user);
  const setProfile = useSessionStore((s) => s.setProfile);

  const [name, setName] = useState(profile?.display_name || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  const [plan, setPlan] = useState(profile?.plan || "free");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name || "");
      setAvatar(profile.avatar || "");
      setPlan(profile.plan || "free");
    }
  }, [profile]);

  const uploadAvatar = async (file) => {
    if (!user) throw new Error("User not logged in");

    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData, error: urlError } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (urlError) throw urlError;

    return urlData.publicUrl;
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const publicUrl = await uploadAvatar(file);
      setAvatar(publicUrl);
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return alert("User not logged in");

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: name,
          avatar,
          plan,
        })
        .eq("owner_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      alert("Profile saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div>Loading profile...</div>;

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
          <label>Avatar</label>
          {avatar && (
            <img src={avatar} alt="avatar preview" className="w-24 h-24 rounded-full mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
              saving || uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Save Profile
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-900 p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Account</h2>
        <p>
          Plan: <strong>{plan === "paid" ? "Paid" : "Free"}</strong>
        </p>
      </section>
    </div>
  );
}