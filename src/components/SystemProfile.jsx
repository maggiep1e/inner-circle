import MemberMarkdown from "./MemberMarkdown";
import { useSystemStore } from "../store/systemStore";

export default function SystemProfile({ onEdit, onDone }) {
  const currentSystem = useSystemStore((s) => s.currentSystem);

  if (!currentSystem) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="max-w-2xl w-full mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">
        <div
          className="h-32 w-full"
          style={{ backgroundColor: currentSystem.color || "#888" }}
        />

        <div className="p-6 relative">
          <div className="absolute -top-12 left-6">
            {currentSystem.avatar ? (
              <img
                src={currentSystem.avatar}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                alt="avatar"
              />
            ) : (
              <div
                style={{ backgroundColor: currentSystem.color || "#888" }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white border-4 border-white"
              >
                {currentSystem.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
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
          <div className="mt-12">
            <h2 className="text-2xl font-bold">
              {currentSystem.display_name || "Unnamed System"}
            </h2>
          </div>
          {currentSystem.description ? (
            <div className="mt-4">
              <MemberMarkdown text={currentSystem.description} />
            </div>
          ) : (
            <p className="text-gray-400 mt-4">No description yet.</p>
          )}
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