import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import EmojiPicker from "emoji-picker-react";

export default function EditFolder() {
  const { folderId, systemId } = useParams();
  const navigate = useNavigate();

  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("folders")
        .select("*")
        .eq("id", folderId)
        .single();

      setFolder(data);
    };

    load();
  }, [folderId]);

  const updateField = (key, value) => {
    setFolder((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("folders")
      .update({
        name: folder.name,
        emoji: folder.emoji,
        color: folder.color,
      })
      .eq("id", folderId);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate(`/systems/${systemId}`);
  };

  if (!folder) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">

      <h1 className="text-xl font-bold">Edit Folder</h1>

        <input
          value={folder.name || ""}
          onChange={(e) => updateField("name", e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Folder name"
        />

        <div className="relative">

          <label className="text-sm block mb-1">Folder Emoji</label>

          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="w-full border p-2 rounded text-left"
          >
            {folder.emoji || "Pick an emoji 🙂"}
          </button>

          {showPicker && (
            <div className="absolute z-50 mt-2">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setFolder((prev) => ({
                    ...prev,
                    emoji: emojiData.emoji,
                  }));
                  setShowPicker(false);
                }}
              />
            </div>
          )}

        </div>
        <div className="mt-4">

          <label className="text-sm block mb-1">Folder Color</label>

          <input
            type="color"
            value={folder.color || "#3b82f6"}
            onChange={(e) =>
              setFolder((prev) => ({
                ...prev,
                color: e.target.value,
              }))
            }
            className="w-full h-10 border rounded cursor-pointer"
          />

        </div>
      <div
        className="p-3 rounded text-white text-lg flex items-center gap-2"
        style={{ backgroundColor: folder.color || "#3b82f6" }}
      >
        <span className="text-2xl">{folder.emoji}</span>
        <span>{folder.name}</span>
      </div>

      <button
        onClick={save}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Saving..." : "Save Folder"}
      </button>

    </div>
  );
}