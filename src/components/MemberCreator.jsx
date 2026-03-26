import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { supabase } from "../lib/supabase";
import FolderPicker from "./FolderPicker";

export default function MemberCreator({ onDone }) {
  const addMember = useSystemStore((s) => s.addMember);
  const systemId = useSystemStore((s) => s.systemId);
  const allFolders = useSystemStore((s) => s.systemFolders);

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [tags, setTags] = useState([]);
  const [folders, setFolders] = useState([]); // ✅ this will store IDs
  const [avatarPath, setAvatarPath] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `avatars/${Date.now()}-${file.name}`;

      const { error } = await supabase
        .storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      setAvatarPath(path);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    await addMember({
      name,
      display_name: displayName,
      color,
      tags,
      folders,
      avatar: avatarPath,
      system_id: systemId, 
    });

    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="dark:bg-zinc-800 bg-white p-6 rounded-xl w-96 flex flex-col gap-4">

        <h2 className="text-xl font-bold">Create New Member</h2>

        <button>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          disabled={uploading}
        /></button>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="px-3 py-2 border rounded-lg"
        />

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          className="px-3 py-2 border rounded-lg"
        />

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <input
          placeholder="Tags (comma separated)"
          value={tags.join(", ")}
          onChange={(e) =>
            setTags(
              e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            )
          }
          className="px-3 py-2 border rounded-lg"
        />

  
        <FolderPicker
          allFolders={allFolders}
          selectedIds={folders}
          onChange={setFolders}
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCreate}
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Create
          </button>

          <button
            onClick={onDone}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}