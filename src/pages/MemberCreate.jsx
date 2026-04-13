import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import Card from "../components/Card";
import { uploadFile } from "../api/avatar";

export default function MemberCreate() {
  const navigate = useNavigate();
  const { systemId } = useParams();

  const addMember = useSystemStore((s) => s.addMember);
  const user = useSessionStore((s) => s.user);

  const [form, setForm] = useState({
    name: "",
    display_name: "",
    pronouns: "",
    description: "",
    avatar: "",
    color: "",
    tags: [],
    custom_fields: []
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
   const [tagInput, setTagInput] = useState("");


 const handleAvatarChange = async (e) => {
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

   const handleCustomFieldChange = (index, key, value) => {
  setForm((prev) => {
    const updated = [...prev.custom_fields];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    return {
      ...prev,
      custom_fields: updated,
    };
  });
};

const addCustomField = () => {
  setForm((prev) => ({
    ...prev,
    custom_fields: [...prev.custom_fields, { title: "", value: "" }],
  }));
};

const removeCustomField = (index) => {
  setForm((prev) => ({
    ...prev,
    custom_fields: prev?.custom_fields?.filter((_, i) => i !== index),
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


  const handleCreate = async () => {
    if (!user?.id || !systemId) return;

    const created = await addMember({
      ...form,
      system_id: systemId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

    navigate(`/systems/${systemId}/members/${created.id}`);
  };

  return (
    <>
     <button onClick={() => navigate(-1)}>
                ← Back
      </button>
       <Card>
        <div className="p-6 w-full space-y-4">

        <h1 className="text-xl font-bold">Create Member</h1>

        <div className="space-y-2">
          <p className="text-zinc-400 text-sm">Avatar</p>

          <img
            src={avatarPreview || "/default-avatar.png"}
            className="w-20 h-20 rounded-full object-cover border"
          />
          <button className="flex  w-60">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={uploading}
          /></button>

          {uploading && (
            <p className="text-xs text-blue-500">Uploading...</p>
          )}
        </div>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="p-2 w-full border rounded"
        />

        <input
          placeholder="Display Name"
          value={form.display_name}
          onChange={(e) =>
            setForm({ ...form, display_name: e.target.value })
          }
          className="p-2 w-full border rounded"
        />

        <input
          placeholder="Pronouns"
          value={form.pronouns}
          onChange={(e) =>
            setForm({ ...form, pronouns: e.target.value })
          }
          className="p-2 w-full border rounded"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="p-2 w-full border rounded"
        />

               <div>
          <p className="text-zinc-400 text-sm mb-1">Color</p>
          <input
            type="color"
            value={form.color}
            onChange={(e) =>
              setForm({ ...form, color: e.target.value })
            }
          />
        </div>

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

         <div className="space-y-2">
            {form.custom_fields && form.custom_fields?.map((field, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={field.title}
                  onChange={(e) =>
                    handleCustomFieldChange(index, "title", e.target.value)
                  }
                  placeholder="Field name"
                  className="w-1/2 border p-2 rounded"
                />

                <input
                  value={field.value}
                  onChange={(e) =>
                    handleCustomFieldChange(index, "value", e.target.value)
                  }
                  placeholder="Field value"
                  className="w-1/2 border p-2 rounded"
                />

                <button
                  type="button"
                  onClick={() => removeCustomField(index)}
                  className="px-2 text-red-500"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addCustomField}
              className="px-3 py-2 border rounded"
            >
              + Add Custom Field
            </button>
          </div>


        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          onClick={handleCreate}
          disabled={uploading}
        >
          Create Member
        </button>
      </div>
    </Card>
    </>
  );
}