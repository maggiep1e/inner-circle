import { useState } from "react";
import { updateSystem } from "../api/systems";
import { useSessionStore } from "../store/sessionStore";
import { useSystemStore } from "../store/systemStore";

export default function SystemEditor({ onDone }) {
  const currentSystem = useSystemStore((s) => s.currentSystem);
  const user = useSessionStore((s) => s.user);
  const systems = useSystemStore((s) => s.systems)
  const updateSystem = useSystemStore((s) => s.updateSystem)

  const [displayName, setDisplayName] = useState(currentSystem?.display_name || "");
  const [avatar, setAvatar] = useState(currentSystem?.avatar || "");
  const [color, setColor] = useState(currentSystem?.color || "#888");
  const [description, setDescription] = useState(currentSystem?.description || "");
  const [loading, setLoading] = useState(false);

  if (!currentSystem) return null; // safety

  async function handleSave() {
  if (!user) {
    alert("User not logged in");
    return;
  }
  if (!currentSystem) return;

  setLoading(true);

  const updated = {
    ...currentSystem,
    display_name: displayName,
    avatar,
    color,
    description,
  };

  try {
    updateSystem(updated);

    useSystemStore.setState({
      systems: systems.map((s) => (s.id === updated.id ? updated : s)),
    });

    alert("System updated!");
    onDone();
  } catch (err) {
    console.error(err);
    alert("Failed to update system.");
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-2">Edit System</h2>

        <label className="block text-gray-500 text-sm">Display Name</label>
        <input
          className="w-full border p-2 rounded mb-2"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <label className="block text-gray-500 text-sm">Avatar URL</label>
        <input
          className="w-full border p-2 rounded mb-2"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
        />

        <label className="block text-gray-500 text-sm">Banner Color</label>
        <input
          type="color"
          className="w-20 h-10 border rounded mb-2"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <label className="block text-gray-500 text-sm">Description</label>
        <textarea
          className="w-full border p-2 rounded mb-4"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-1 rounded bg-gray-300"
            onClick={onDone}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1 rounded bg-green-500 text-white"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}