import MemberMarkdown from "./MemberMarkdown";

export default function MemberProfile({ member = {}, onEdit, onDone }) {
  const username = member.name?.toLowerCase().replace(/[^a-z0-9]/g, "") || "unknown";

  // Helper to ensure arrays
  function ensureArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(",").map(v => v.trim()).filter(Boolean);
    return [];
  }

  return (
    // Full-screen overlay for centering
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="max-w-2xl w-full mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">

        {/* Banner */}
        <div
          className="h-32 w-full"
          style={{ backgroundColor: member.color || "#888" }}
        />

        {/* Avatar + Name */}
        <div className="p-6 relative">
          <div className="absolute -top-12 left-6">
            {member.avatar ? (
              <img
                src={member.avatar}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                alt="avatar"
              />
            ) : (
              <div
                style={{ backgroundColor: member.color || "#888" }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white border-4 border-white"
              >
                {member.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          {/* Edit Button */}
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

          {/* Name & Username */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold">{member.displayName || member.name || "Unknown"}</h2>
            <p className="text-gray-500">@{username}</p>
          </div>

          {/* Tags */}
          {ensureArray(member.tags).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {ensureArray(member.tags).map((tag, i) => (
                <span key={i} className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Folders */}
          {ensureArray(member.folders).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {ensureArray(member.folders).map((folder, i) => (
                <span key={i} className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                  📁 {folder}
                </span>
              ))}
            </div>
          )}

          {/* Bio / Description */}
          {member.description ? (
            <div className="mt-4">
              <MemberMarkdown text={member.description} />
            </div>
          ) : (
            <p className="text-gray-400 mt-4">No description yet.</p>
          )}

          {/* Cancel Button */}
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