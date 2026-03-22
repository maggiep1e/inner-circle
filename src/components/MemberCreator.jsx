import { useState } from "react";
import { useSystemStore } from "../store/systemStore";

export default function MemberCreator({ close }) {
  const addMember = useSystemStore((s) => s.addMember);

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [tags, setTags] = useState([]);
  const [folders, setFolders] = useState([]);

  const create = async () => {
    if (!name.trim()) return;

    try {
      const newMember = await addMember({
        name,
        displayName,
        color,
        tags,
        folders,
      });

      // Optionally select the new member in the parent component
      close(newMember);
    } catch (err) {
      console.error("Failed to create member:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="dark:bg-zinc-800 p-6 rounded-xl w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Create New Member</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="dark:bg-zinc-700 px-3 py-2 rounded"
        />

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          className="dark:bg-zinc-700 px-3 py-2 rounded"
        />

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <input
          placeholder="tags (comma separated)"
          value={tags.join(",")}
          onChange={(e) => setTags(e.target.value.split(","))}
          className="dark:bg-zinc-700 px-3 py-2 rounded"
        />

        <input
          placeholder="folders (comma separated)"
          value={folders.join(",")}
          onChange={(e) => setFolders(e.target.value.split(","))}
          className="dark:bg-zinc-700 px-3 py-2 rounded"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={create}
            className="bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-700"
          >
            Create
          </button>
          <button
            onClick={() => close()}
            className="bg-zinc-200 px-4 py-2 rounded hover:bg-zinc-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}