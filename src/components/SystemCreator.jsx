import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { supabase } from "../lib/supabase";
import { useSessionStore } from "../store/sessionStore";

export default function SystemCreator({ onDone }) {
  const addSystem = useSystemStore((s) => s.addSystem);
  const user = useSessionStore((s) => s.user);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#ffffff",
    avatar: "",
  });

  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

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

      setFormData((p) => ({ ...p, avatar: path }));
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    const created = await addSystem({
      ...formData,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

    onDone(created);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="dark:bg-zinc-800 p-6 rounded-xl w-96 flex flex-col gap-4">

        <h2 className="text-xl font-bold">Create System</h2>

        <input type="file" onChange={handleAvatarUpload} />

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="System Name"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />

        <input
          type="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
        />

        <button onClick={handleCreate} disabled={uploading}>
          Create
        </button>

        <button onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}