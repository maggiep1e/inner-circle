import { useEffect, useState } from "react";
import { uploadFile } from "../api/avatar";
import { getPublicUrl } from "../api/avatar";

export default function MemberForm({
  initialData = {},
  onSubmit,
  submitting = false,
}) {
  const [form, setForm] = useState({
    name: "",
    display_name: "",
    pronouns: "",
    avatar: "",
    description: "",
    color: "#3b82f6",
    tags: [],
  });

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // -----------------------------
  // HYDRATE EDIT MODE
  // -----------------------------
  useEffect(() => {
    if (!initialData) return;

    setForm({
      name: initialData.name || "",
      display_name: initialData.display_name || "",
      pronouns: initialData.pronouns || "",
      avatar: initialData.avatar || "",
      description: initialData.description || "",
      color: initialData.color || "#3b82f6",
      tags: initialData.tags || [],
    });

    setAvatarUrl(getPublicUrl(initialData.avatar) || null);
  }, [initialData]);

  // -----------------------------
  // AVATAR UPLOAD
  // -----------------------------
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

      setAvatarUrl(url);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------
  // FIELD UPDATE (FIXED)
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------
  // TAGS
  // -----------------------------
  const addTag = () => {
    if (!tagInput.trim()) return;

    setForm((prev) => ({
      ...prev,
      tags: [...new Set([...prev.tags, tagInput.trim()])],
    }));

    setTagInput("");
  };

  const removeTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const handleSubmit = () => {
    onSubmit(form);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="space-y-4">

      {/* AVATAR */}
      <div className="flex flex-col items-center gap-2">
        <img
          src={avatarUrl || "/default-avatar.png"}
          className="w-20 h-20 rounded-full object-cover border"
        />
  <button>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          disabled={uploading}
        /></button>

        {uploading && (
          <p className="text-xs text-blue-500">Uploading...</p>
        )}
      </div>

      {/* BASIC INFO */}
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full border p-2 rounded"
      />

      <input
        name="display_name"
        value={form.display_name}
        onChange={handleChange}
        placeholder="Display Name"
        className="w-full border p-2 rounded"
      />

      <input
        name="pronouns"
        value={form.pronouns}
        onChange={handleChange}
        placeholder="Pronouns"
        className="w-full border p-2 rounded"
      />

      {/* DESCRIPTION */}
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description / Bio"
        className="w-full border p-2 rounded h-24"
      />

      {/* COLOR */}
      <div className="flex items-center gap-2">
        <label className="text-sm">Color:</label>

        <input
          type="color"
          name="color"
          value={form.color}
          onChange={handleChange}
          className="w-10 h-10 border rounded"
        />
      </div>

      {/* TAGS */}
      <div className="space-y-2">

        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag..."
            className="border p-2 rounded w-full"
          />

          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 border rounded"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 border rounded text-sm flex items-center gap-2"
            >
              {tag}
              <button onClick={() => removeTag(tag)}>×</button>
            </span>
          ))}
        </div>

      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={uploading || submitting}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Save Member
      </button>

    </div>
  );
}