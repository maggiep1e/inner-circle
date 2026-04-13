import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import { uploadFile } from "../api/avatar";
import { addToFront } from "../api/front";

export default function SetCustomFront({ onClose }) {
  const systemId = useSystemStore(
    (s) => s.currentSystem?.id || s.systems[0]?.id
  );

  const user = useSessionStore((s) => s.user);
  const addMember = useSystemStore((s) => s.addMember);

  const [form, setForm] = useState({
    name: "",
    description: "",
    avatar: "",
    status: "",
    is_temporary: true,
    userId: user?.id || null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const { path, url } = await uploadFile(file, "members");

      setForm((prev) => ({
        ...prev,
        avatar: path,
      }));

      setAvatarPreview(url);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!user?.id || !systemId || !form.name.trim()) return;

    const created = await addMember({
      name: form.name,
      description: form.description,
      avatar: form.avatar,
      system_id: systemId,
      user_id: user.id,
      is_temporary: form.is_temporary,
      created_at: new Date().toISOString(),
    });

    if (!created?.id) return;

    await addToFront(systemId, created.id, form.status);

    onClose();
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-[400px] shadow-xl">
      <h2 className="text-lg font-bold mb-4">
        Create Custom Front
      </h2>

      <img
        src={avatarPreview || "/default-avatar.png"}
        className="w-20 h-20 rounded-full object-cover border mb-2"
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        disabled={uploading}
        className="mb-4"
      />

      <input
        placeholder="Avatar URL (optional)"
        value={form.avatar}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, avatar: e.target.value }))
        }
        className="border p-2 rounded w-full mb-4"
      />

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, name: e.target.value }))
        }
        className="border p-2 rounded w-full mb-4"
      />

      <textarea
        placeholder="Description (optional)"
        className="border p-2 rounded w-full h-24 mb-4"
        value={form.description}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, description: e.target.value }))
        }
      />

      <input
        placeholder="Status (optional)"
        className="border p-2 rounded w-full mb-4"
        value={form.status}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, status: e.target.value }))
        }
      />

      <div className="flex justify-between">
        <button onClick={onClose} className="py-2 rounded">
          Cancel
        </button>

        <button
          onClick={handleCreate}
          className="py-2 rounded bg-blue-500 text-white px-4"
        >
          Add
        </button>
      </div>
    </div>
  );
}