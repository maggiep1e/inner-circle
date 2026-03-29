import { useEffect, useState } from "react";
import { uploadFile, uploadFileFromUrl } from "../api/avatar";
import { useSystemStore } from "../store/systemStore";
import { useNavigate } from "react-router-dom";
import { resolveAvatar } from "../api/avatar";

export default function MemberForm({
  initialData = {},
  onSubmit,
  submitting = false,
}) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    display_name: "",
    pronouns: "",
    avatar: "",
    description: "",
    color: "#3b82f6",
    tags: [],
  });

  const [avatarInput, setAvatarInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const deleteMember = useSystemStore((s) => s.deleteMember)
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialData) return;

    setForm({
      id: initialData.id || "",
      name: initialData.name || "",
      display_name: initialData.display_name || "",
      pronouns: initialData.pronouns || "",
      avatar: initialData.avatar || "",
      description: initialData.description || "",
      color: initialData.color || "#3b82f6",
      tags: initialData.tags || [],
    });

    setAvatarUrl(resolveAvatar(initialData?.avatar));
  }, [initialData, resolveAvatar]);

    useEffect(() => {
      const delay = setTimeout(() => {
        if (avatarInput.startsWith("http")) {
          handleAvatarFromUrl();
        }
      }, 500);

      return () => clearTimeout(delay);
    }, [avatarInput]);




  async function handleAvatarUpload(e) {
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
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleAvatarFromUrl() {
    if (!avatarInput.trim()) return;

    setUploading(true);

    try {
      const { path, url } = await uploadFileFromUrl(
        avatarInput,
        form.name || "member"
      );

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
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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


  const handleDeleteMember = async () => {
    if (!initialData?.id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member? This cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await deleteMember(initialData.id);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete member:", err);
    }
  };




  const handleSubmit = () => {
    onSubmit(form);
  };

  
  return (
    <div className="space-y-4">

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
            />
          </button>
          <input
            type="text"
            placeholder="Or paste image URL..."
            value={avatarInput}
            onChange={(e) => setAvatarInput(e.target.value)}
          />

          <button
            type="button"
            onClick={handleAvatarFromUrl}
            disabled={uploading}
          >
            Use URL
          </button>

          {uploading && (
            <p className="text-xs text-blue-500">Uploading...</p>
          )}
        </div>

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

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description / Bio"
          className="w-full border p-2 rounded h-24"
        />

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

      <button
        onClick={handleSubmit}
        disabled={uploading || submitting}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Save Member
      </button>
      <button
        onClick={handleDeleteMember}
        className="w-full bg-blue-500 text-red-500 p-2 rounded"
      >
        Delete Member
      </button>
    </div>
  );
}