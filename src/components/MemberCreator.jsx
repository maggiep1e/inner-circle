import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { supabase } from "../lib/supabase";

export default function MemberCreator({ onDone }) {
  const addMember = useSystemStore((s) => s.addMember);
  const systemId = useSystemStore((s) => s.systemId);

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [tags, setTags] = useState([]);
  const [folders, setFolders] = useState([]);
  const [avatarPath, setAvatarPath] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `avatars/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      setAvatarPath(path);
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
    });
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="dark:bg-zinc-800 p-6 rounded-xl w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Create New Member</h2>

        <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />

        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input
          placeholder="tags (comma separated)"
          value={tags.join(",")}
          onChange={(e) => setTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
        />
        <input
          placeholder="folders (comma separated)"
          value={folders.join(",")}
          onChange={(e) => setFolders(e.target.value.split(",").map(f => f.trim()).filter(Boolean))}
        />

        <div className="flex gap-2 justify-end">
          <button onClick={handleCreate} disabled={uploading}>Create</button>
          <button onClick={onDone}>Cancel</button>
        </div>
      </div>
    </div>
  );
}