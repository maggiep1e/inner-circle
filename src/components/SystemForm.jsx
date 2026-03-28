import { useEffect, useState } from "react";
import { uploadFile, getPublicUrl } from "../api/avatar";

export default function SystemForm({
  initialData = {},
  onSubmit,
  submitting = false,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#ffffff",
    avatar: "",
  });

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // hydrate edit mode
  useEffect(() => {
    setForm({
      name: initialData.name || "",
      description: initialData.description || "",
      color: initialData.color || "#ffffff",
      avatar: initialData.avatar || "",
    });

    setAvatarUrl(getPublicUrl(initialData.avatar));
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const { path, url } = await uploadFile(file, "systems");

      setForm((prev) => ({
        ...prev,
        avatar: path,
      }));

      setAvatarUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <div className="space-y-4">

      <div className="flex flex-col items-center gap-2">
        <p className="text-zinc-400 text-sm">Avatar</p>

        <img
          src={avatarUrl || "/default-avatar.png"}
          className="w-20 h-20 rounded-full object-cover border"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          disabled={uploading}
        />
      </div>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="System Name"
        className="w-full border p-2 rounded"
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border p-2 rounded"
      />

      <input
        type="color"
        name="color"
        value={form.color}
        onChange={handleChange}
      />

      <button
        onClick={handleSubmit}
        disabled={uploading || submitting}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        {uploading ? "Uploading..." : submitting ? "Saving..." : "Save"}
      </button>
    </div>
  );
}