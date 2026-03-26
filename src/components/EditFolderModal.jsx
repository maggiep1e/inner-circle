import { useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";

export default function EditFolderModal({ folder, onClose, onSave }) {
  const [localFolder, setLocalFolder] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    setLocalFolder(folder);
  }, [folder]);

  if (!folder || !localFolder) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded w-[420px] md:w-[480px] flex flex-col gap-4">

        <h2 className="text-xl font-bold">Edit Folder</h2>

        {/* Name */}
        <input
          type="text"
          value={localFolder.name}
          onChange={(e) =>
            setLocalFolder({ ...localFolder, name: e.target.value })
          }
          className="px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
        />

        {/* Color */}
        <input
          type="color"
          value={localFolder.color}
          onChange={(e) =>
            setLocalFolder({ ...localFolder, color: e.target.value })
          }
        />

        {/* Emoji */}
                <div className="flex flex-col gap-2">
                   <div className="relative">
  <button
    onClick={() => setShowEmojiPicker((s) => !s)}
    className="text-3xl"
  >
    {localFolder.emoji}
  </button>

  {showEmojiPicker && (
    <div className="absolute z-50 mt-2 shadow-xl rounded overflow-hidden">
      <EmojiPicker
        width={350}
        height={400}
        onEmojiClick={(emojiData) => {
          setLocalFolder({ ...localFolder, emoji: emojiData.emoji})
          setShowEmojiPicker(false);
        }}
      />
    </div>
  )}
</div>
                </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={() => onSave(localFolder)}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}