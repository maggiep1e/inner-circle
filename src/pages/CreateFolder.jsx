import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createFolder } from "../api/folders";
import { useSessionStore } from "../store/sessionStore";
import Card from "../components/Card";
import EmojiPicker from "emoji-picker-react";

export default function CreateFolder() {
  const {systemId} = useParams()
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user)

  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [folder, setFolder] = useState({name: "", color: "", emoji: ""});

  const handleCreate = async () => {
    if (!folder.name.trim()) return;

    setLoading(true);

    try {
      await createFolder({
        name: folder.name,
        system_id: systemId,
        user_id: user.id, 
        member_ids: [],
        emoji: folder.emoji,
        color: folder.color
      });

      navigate(-1);
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <>
    <Card>
         <button onClick={() => navigate(-1)}>
                ← Back
        </button>
        <div className="p-6 max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-4">Create Folder</h1>

        <input
              value={folder.name || ""}
              onChange={(e) => setFolder((prev) => ({...prev, name: e.target.value}))}
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
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {loading ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </Card>
    </>
  );
}