import { useState } from "react";
import { useSystemStore } from "../store/systemStore";

export default function SystemEditor({ onDone }) {
  const currentSystem = useSystemStore((s) => s.currentSystem);
  const updateSystem = useSystemStore((s) => s.updateSystem);

  const [name, setName] = useState(currentSystem?.display_name || "");
  const [description, setDescription] = useState(currentSystem?.description || "");
  const [color, setColor] = useState(currentSystem?.color || "#888");

  if (!currentSystem) return null;

  const handleSave = async () => {
    await updateSystem(currentSystem.id, {
      display_name: name,
      description,
      color,
    });
    onDone();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="System Name"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 border rounded-lg cursor-pointer"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onDone}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}