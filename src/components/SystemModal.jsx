import { useEffect, useState } from "react";
import { useSystemStore } from "../store/systemStore";
import MemberMarkdown from "./MemberMarkdown";
import { supabase } from "../lib/supabase";

export default function SystemModal({ onDone }) {
  const currentSystem = useSystemStore((s) => s.currentSystem);
  const systemAvatarUrls = useSystemStore((s) => s.systemAvatarUrls);
  const saveSystem = useSystemStore((s) => s.saveSystem);
  const setSystemAvatarUrl = useSystemStore((s) => s.setSystemAvatarUrl);

  const sys = currentSystem;

  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#888");
  const [avatarPath, setAvatarPath] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!sys) return;

    setName(sys.name || "");
    setDescription(sys.description || "");
    setColor(sys.color || "#888");
    setAvatarPath(systemAvatarUrls?.[sys.id] || sys.avatar || "");
  }, [sys, systemAvatarUrls]);

  if (!sys) return null;

  const handleSave = async () => {
    await saveSystem(sys.id, {
      name,
      description,
      color,
      avatar: avatarPath,
    });

    setEditMode(false);
    onDone();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `system_avatars/system-${sys.id}.${ext}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      setAvatarPath(path);
      setSystemAvatarUrl(sys.id, path);
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl =
    systemAvatarUrls?.[sys.id] ||
    sys.avatar ||
    "/default-avatar.png";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="h-32 w-full" style={{ backgroundColor: color }} />

        <div className="p-6 flex flex-col items-center relative">

          {/* Avatar */}
          <div className="absolute -top-16 flex flex-col items-center">
            <img
              src={avatarUrl}
              className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              alt="System Avatar"
            />

            {editMode && (
              <label className="mt-2 px-3 py-1 bg-gray-200 rounded cursor-pointer">
                {uploading ? "Uploading..." : "Change Avatar"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-20 flex justify-between w-full">
            {!editMode ? (
              <button onClick={() => setEditMode(true)}>Edit</button>
            ) : (
              <button onClick={handleSave}>Save</button>
            )}

            <button onClick={onDone}>Close</button>
          </div>

          {/* Name */}
          {!editMode ? (
            <h2 className="text-2xl font-bold mt-2 text-center">
              {name || "Unnamed System"}
            </h2>
          ) : (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border rounded px-3 py-1"
            />
          )}

          {/* Description */}
          {!editMode ? (
            description ? (
              <div className="mt-4 w-full">
                <MemberMarkdown text={description} />
              </div>
            ) : (
              <p className="text-gray-400 mt-4 text-center">
                No description yet.
              </p>
            )
          ) : (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-4 w-full border rounded px-3 py-2"
            />
          )}

          {/* Color */}
          {editMode && (
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-4 w-full h-10"
            />
          )}
        </div>
      </div>
    </div>
  );
}