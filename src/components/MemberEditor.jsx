import { useState } from "react";
import { useSystemStore } from "../store/systemStore";

export default function MemberEditor({ member, onDone }) {
  const updateMember = useSystemStore((s) => s.updateMember);
  const [name, setName] = useState(member.name || "");
  const [tags, setTags] = useState(member.tags?.join(", ") || "");
  const [folders, setFolders] = useState(member.folders?.join(", ") || "");

  const handleSave = async () => {
    await updateMember(member.id, {
      name,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      folders: folders.split(",").map((f) => f.trim()).filter(Boolean),
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
          placeholder="Name"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          value={folders}
          onChange={(e) => setFolders(e.target.value)}
          placeholder="Folders (comma separated)"
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