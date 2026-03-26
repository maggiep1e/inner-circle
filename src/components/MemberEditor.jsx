import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { supabase } from "../lib/supabase";
import FolderPicker from "./FolderPicker";

export default function MemberEditor({ member, onDone }) {
  const updateMember = useSystemStore((s) => s.updateMember);
  const allFolders = useSystemStore((s) => s.systemFolders);
  const avatarUrls = useSystemStore((s) => s.avatarUrls)

  const [name, setName] = useState(member.name || "");
  const [description, setDescription] = useState(member.description || "");
  const [tags, setTags] = useState(member.tags?.join(", ") || "");
  const [folderIds, setFolderIds] = useState(member.folders || []);
  const [avatarPath, setAvatarPath] = useState(member.avatar || "");
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

  const handleSave = async () => {
    await updateMember(member.id, {
      name,
      description,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      folders: folderIds,
      avatar: avatarPath,
    });

    onDone();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col space-y-4">


        <div className="flex flex-col items-center gap-2">
          <img
            src={avatarUrls[member.id] || "/default-avatar.png"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <button>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className="text-sm"
          /></button>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full px-4 py-2 border rounded-lg min-h-[80px]"
        />

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <FolderPicker
          allFolders={allFolders}
          selectedIds={folderIds}
          onChange={setFolderIds}
        />

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onDone}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}