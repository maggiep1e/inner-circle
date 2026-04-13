import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import Card from "../components/Card";
import { uploadFile } from "../api/avatar";

export default function SystemCreate() {
  const navigate = useNavigate();
  const { id: parentId} = useParams();

  const addSystem = useSystemStore((s) => s.addSystem);
  const addSubsystem = useSystemStore((s) => s.addSubsystem);
  const user = useSessionStore((s) => s.user);

  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#ffffff",
    avatar: "",
    parent_system_id: parentId || null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const { path, url } = await uploadFile(file, "systems");

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
    if (!user?.id) return;
 
    if (parentId) { try {
      const created = await addSubsystem({
        ...form,
        user_id: user.id,
        display_name: form.name,
        parent_system_id: parentId,
        created_at: new Date().toISOString(),
      });

      navigate('/systems/' + created.id);
    
    } catch (err) {
      console.error("Subsystem Create failed:", err);
    
    }} else {

    try {
    const created = await addSystem({
      ...form,
      user_id: user.id,
      display_name: form.name,
      created_at: new Date().toISOString(),
    });

    navigate('/systems/' + created.id);
    } catch  (err)  {
      console.error("System Create failed:", err);
  }
  };
};

  return (
    <>
    <button onClick={() => navigate("/dashboard")} className="mb-4">
                ← Back
      </button>
    <Card>
      <div className="p-6 w-full space-y-4">
        <h1 className="text-xl font-bold">Create System</h1>
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

        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          onClick={handleCreate}
          disabled={uploading}
        >
          Create System
        </button>
      </div>
    </Card>
    </>
  );
}