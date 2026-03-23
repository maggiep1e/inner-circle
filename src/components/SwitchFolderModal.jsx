import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { createFolder } from "../api/folders"; // your API for creating folders

export default function SwitchFolderModal({ onClose }) {
  const folders = useSystemStore((s) => s.folders);
  const systemId = useSystemStore((s) => s.systemId);
  const loadFolders = useSystemStore((s) => s.loadFolders);

  const [search, setSearch] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = folders.filter((f) =>
    (f.name ?? "").toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleSelect = (folder) => {
    console.log("Selected folder:", folder.id);
    onClose();
  };

  const handleCreate = async () => {
    if (!newFolderName.trim() || !systemId) return;
    setCreating(true);
    try {
      await createFolder({ name: newFolderName, system_id: systemId });
      await loadFolders();
      setNewFolderName("");
      onClose();
    } catch (err) {
      console.error("Failed to create folder:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-[400px] shadow-xl">
        <h2 className="text-lg font-bold mb-4">Folders</h2>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search folders..."
          className="w-full mb-4 px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
        />

        {/* List */}
        <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
          {filtered.map((folder) => (
            <button
              key={folder.id}
              onClick={() => handleSelect(folder)}
              className="flex items-center gap-3 p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center">
                {folder.name?.[0]?.toUpperCase()}
              </div>
              <span>{folder.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <span className="text-sm text-gray-500">No folders found</span>
          )}
        </div>

        {/* New Folder */}
        <div className="mt-4 flex gap-2">
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            className="flex-1 px-3 py-2 rounded border bg-zinc-200 dark:bg-zinc-700"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}