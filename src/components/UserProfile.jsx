import { useProfileStore } from "../store/profileStore";

export default function UserProfile({ onEdit, onDone }) {
  const profile = useProfileStore((s) => s.profile);
  const profileAvatarUrl = useProfileStore((s) => s.profileAvatarUrl);

  if (!profile) return null;

  const safeUsername = (profile.username || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div
          className="h-32 w-full"
          style={{ backgroundColor: profile.color || "#888" }}
        />
        <div className="p-6 relative flex flex-col items-center">
          <div className="absolute -top-16">
            <img
              src={profileAvatarUrl || "/default-avatar.png"}
              className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              alt={profile.display_name || profile.name}
            />
          </div>

          <div className="mt-20 w-full flex justify-end">
            {onEdit && (
              <button
                onClick={onEdit}
                className="border px-4 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Edit
              </button>
            )}
          </div>

          <h2 className="text-2xl font-bold mt-2 text-center">
            {profile.display_name || profile.name || "Unknown"}
          </h2>
          <p className="text-gray-500">@{safeUsername}</p>

          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Plan: <strong>{profile.plan === "paid" ? "Paid" : "Free"}</strong>
          </p>

          {profile.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 text-center">
            {profile.description ? (
              <p className="whitespace-pre-wrap">{profile.description}</p>
            ) : (
              <p className="text-gray-400">No description yet.</p>
            )}
          </div>

          {onDone && (
            <button
              onClick={onDone}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}