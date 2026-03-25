import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import MemberMarkdown from "./MemberMarkdown";

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [banner, setBanner] = useState("#888");

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setProfile(data);
      setUsername(data.username || "");
      setDisplayName(data.display_name || "");
      setAvatar(data.avatar || "");
      setBio(data.bio || "");
      setBanner(data.banner || "#888");
      setLoading(false);
    }

    loadProfile();
  }, []);

  // Save changes
  async function handleSave() {
    if (!profile) return;

    const updates = {
      username,
      display_name: displayName,
      avatar,
      bio,
      banner,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      console.error(error);
      alert("Failed to update profile.");
      return;
    }

    alert("Profile updated!");
    setProfile({ ...profile, ...updates });
  }

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">
      <div className="h-32 w-full" style={{ backgroundColor: banner }} />

      <div className="p-6 relative">
        <div className="absolute -top-12 left-6">
          {avatar ? (
            <img
              src={avatar}
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
              alt="avatar"
            />
          ) : (
            <div
              style={{ backgroundColor: banner }}
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white border-4 border-white"
            >
              {displayName?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="mt-12">
          <label className="block text-gray-500 text-sm">Display Name</label>
          <input
            className="w-full border p-2 rounded mb-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <label className="block text-gray-500 text-sm">Username</label>
          <input
            className="w-full border p-2 rounded mb-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mt-2">
          <label className="block text-gray-500 text-sm">Avatar URL</label>
          <input
            className="w-full border p-2 rounded mb-2"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>
        <div className="mt-2">
          <label className="block text-gray-500 text-sm">Banner Color</label>
          <input
            type="color"
            className="w-20 h-10 border rounded mb-2"
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
          />
        </div>
        <div className="mt-2">
          <label className="block text-gray-500 text-sm">Bio</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <div className="mt-2 text-gray-400">Preview:</div>
          <div className="border p-2 rounded mt-1 bg-gray-50 dark:bg-zinc-800">
            <MemberMarkdown text={bio} />
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}