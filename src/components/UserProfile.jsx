import { useSessionStore } from "../store/sessionStore";

export default function UserProfile({ userData = {}, onEdit, onDone }) {
  const profile = useSessionStore((s) => s.profile);

  // Prefer userData fields, fallback to session profile
  const displayName = userData.displayName || profile.displayName || profile.name || "Unknown";
  const name = userData.name || profile.name || "Unknown";
  const username = (userData.username || profile.username || "unknown").toLowerCase().replace(/[^a-z0-9]/g, "");

  const avatar = userData.avatar || profile.avatar;
  const color = userData.color || profile.color || "#888";
  const plan = userData.plan || profile.plan || "free";
  const description = userData.description || profile.description || "";
  
  const tags = Array.isArray(userData.tags) ? userData.tags.filter(Boolean) : [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="max-w-2xl w-full mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">

        {/* Banner */}
        <div className="h-32 w-full" style={{ backgroundColor: color }} />

        <div className="p-6 relative">
          {/* Avatar */}
          <div className="absolute -top-12 left-6">
            {avatar ? (
              <img
                src={avatar}
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

          {/* Edit button */}
          <div className="flex justify-end">
            {onEdit && (
              <button
                onClick={onEdit}
                className="border px-4 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                Edit
              </button>
            )}
          </div>

          {/* Name & username */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <p className="text-gray-500">@{username}</p>
          </div>

          {/* Plan */}
          <div className="mt-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Plan: <strong>{plan === "paid" ? "Paid" : "Free"}</strong>
            </span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, i) => (
                <span key={i} className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {description ? (
            <div className="mt-4">
              <p className="whitespace-pre-wrap">{description}</p>
            </div>
          ) : (
            <p className="text-gray-400 mt-4">No description yet.</p>
          )}

          {/* Close button */}
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