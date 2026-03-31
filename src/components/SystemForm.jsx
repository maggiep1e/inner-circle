import { useEffect, useState } from "react";
import { uploadFile, uploadFileFromUrl } from "../api/avatar";
import { resolveAvatar } from "../api/avatar";

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
  const [avatarInput, setAvatarInput] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

useEffect(() => {
  setForm({
    name: initialData?.name || "",
    description: initialData?.description || "",
    color: initialData?.color || "#ffffff",
    avatar: initialData?.avatar || "",
  });



setAvatarUrl(resolveAvatar(initialData?.avatar));
}, [initialData]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 async function handleAvatarUpload(e) {
      e.preventDefault();

      let avatarPath = form.avatar;

      try {
        if (avatarFile) {
          const { path } = await uploadFile(avatarFile);
          avatarPath = path;
          form.avatar = path;
        } else if (avatarInput.trim()) {
          const { path } = await uploadFileFromUrl(avatarInput);
          avatarPath = path;
          form.avatar = path;
        }
      } catch (err) {
        console.error(err);
      }
  }


 const handleSubmit = async () => {
  let avatarPath = form.avatar;

  setUploading(true);

  try {
    if (avatarFile) {
      const { path } = await uploadFile(avatarFile);
      avatarPath = path;
    } else if (avatarInput.trim()) {
      const { path } = await uploadFileFromUrl(avatarInput);
      avatarPath = path;
    }

    onSubmit({
      ...form,
      avatar: avatarPath,
    });
  } catch (err) {
    console.error(err);
    alert("Avatar upload failed");
  }

  setUploading(false);
};

  return (
    <div className="space-y-4">

      <div className="flex flex-col items-center gap-2">
        <p className="text-zinc-400 text-sm">Avatar</p>

        <img
          src={avatarUrl || "/default-avatar.png"}
          className="w-20 h-20 rounded-full object-cover border"
        />

          <button className="flex  w-60">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarFile(file);
                setAvatarUrl(URL.createObjectURL(file));
              }
            }}
          /></button>
          <input
            type="text"
            placeholder="Or paste image URL..."
            value={avatarInput}
            onChange={(e) => {
              setAvatarInput(e.target.value);
              setAvatarUrl(e.target.value);
            }}
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