import { useSystemStore } from "../store/systemStore";
import MemberMarkdown from "./MemberMarkdown";

export default function SystemProfile({ onEdit, onDone }) {
  const currentSystem = useSystemStore((s) => s.currentSystem);
  const systemAvatarUrls = useSystemStore((s) => s.systemAvatarUrls);

  if (!currentSystem) return null;

  const avatarUrl = systemAvatarUrls[currentSystem.id];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div
          className="h-32 w-full"
          style={{ backgroundColor: currentSystem.color || "#888" }}
        />
        <div className="p-6 relative flex flex-col items-center">
          <div className="absolute -top-16">
            <img
              src={avatarUrl || "/default-avatar.png"}
              className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              alt={currentSystem.name}
            />
          </div>

          <div className="mt-20 flex justify-end w-full">
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
            {currentSystem.display_name || "Unnamed System"}
          </h2>

          {currentSystem.description ? (
            <div className="mt-4 w-full">
              <MemberMarkdown text={currentSystem.description} />
            </div>
          ) : (
            <p className="text-gray-400 mt-4">No description yet.</p>
          )}

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