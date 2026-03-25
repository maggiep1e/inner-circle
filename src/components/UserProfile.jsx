import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSessionStore } from "../store/sessionStore";

export default function UserProfile({ onEdit, onDone }) {
  const profile = useSessionStore((s) => s.profile);
  const user = useSessionStore((s) => s.user);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || null);

  // Convert avatar path to public URL if stored
  useEffect(() => {
    if (!profile?.avatar) return;

    const { publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(profile.avatar);

    setAvatarUrl(publicUrl);
  }, [profile]);

  if (!profile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow-lg">
          Loading profile...
        </div>
      </div>
    );
  }

  const {
    display_name,
    name,
    username,
    color = "#888",
    plan = "free",
    description = "",
    tags = [],
  } = profile;

  const safeUsername = (username || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="max-w-2xl w-full mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="h-32 w-full" style={{ backgroundColor: color }} />

        <div className="p-6 relative">
          <div className="absolute -top-12 left-6">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                alt="avatar"
              />
            ) : (
              <div
                style={{ backgroundColor: color }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white border-4 border-white"
              >
                {name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          {onEdit && (
            <div className="flex justify-end">
              <button
                onClick={onEdit}
                className="border px-4 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                Edit
              </button>
            </div>
          )}
          <div className="mt-12">
            <h2 className="text-2xl font-bold">{display_name || name || "Unknown"}</h2>
            <p className="text-gray-500">@{safeUsername}</p>
          </div>

          <div className="mt-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Plan: <strong>{plan === "paid" ? "Paid" : "Free"}</strong>
            </span>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4">
            {description ? (
              <p className="whitespace-pre-wrap">{description}</p>
            ) : (
              <p className="text-gray-400">No description yet.</p>
            )}
          </div>
          {onDone && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={onDone}
                className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}