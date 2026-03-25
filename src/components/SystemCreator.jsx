// src/components/SystemCreator.jsx
import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { supabase } from "../lib/supabase";
import { useSessionStore } from "../store/sessionStore";

export default function SystemCreator({ onDone }) {
  const addSystem = useSystemStore((s) => s.addSystem);
  const user = useSessionStore((s) => s.user); // assuming you store the current user's id

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [tags, setTags] = useState([]);
  const [avatarPath, setAvatarPath] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `system_avatars/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      setAvatarPath(path);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return; // simple validation

    const newSystem = {
      name,
      description,
      color,
      avatar: avatarPath,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    await addSystem(newSystem);
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="dark:bg-zinc-800 p-6 rounded-xl w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Create New System</h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          disabled={uploading}
        />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="System Name"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="resize-none h-20"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <div className="flex gap-2 justify-end">
          <button onClick={handleCreate} disabled={uploading}>
            Create
          </button>
          <button onClick={onDone}>Cancel</button>
        </div>
      </div>
    </div>
  );
}