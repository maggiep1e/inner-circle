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
    avatar: "",
    color: ""
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // -----------------------------
  // avatar upload (same pattern)
  // -----------------------------
 const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const { path, url } = await uploadFile(file, "members");

      setForm((prev) => ({
        ...prev,
        avatar: path, // 🔥 store DB path
      }));

      setAvatarPreview(url); // 🔥 instant UI preview
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };
  // -----------------------------
  // submit
  // -----------------------------
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

        {/* Avatar */}
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

        {/* Name */}
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="p-2 w-full border rounded"
        />

        {/* Display Name */}
        <input
          placeholder="Display Name"
          value={form.display_name}
          onChange={(e) =>
            setForm({ ...form, display_name: e.target.value })
          }
          className="p-2 w-full border rounded"
        />

        {/* Pronouns */}
        <input
          placeholder="Pronouns"
          value={form.pronouns}
          onChange={(e) =>
            setForm({ ...form, pronouns: e.target.value })
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

        {/* Submit */}
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