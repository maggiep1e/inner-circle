import { useState } from "react";
import EmojiPicker from "emoji-picker-react";

export default function CreateFolderModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [emoji, setEmoji] = useState("📁");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;

    await onCreate({
      name,
      color,
      emoji,
    });

    // reset
    setName("");
    setColor("#6366f1");
    setEmoji("📁");
    setShowEmojiPicker(false);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded w-[420px] md:w-[480px] flex flex-col gap-4">

        <h2 className="text-xl font-bold">Create Folder</h2>

        {/* NAME */}
        <input
          type="text"
          placeholder="Folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
        />

        {/* COLOR */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        {/* EMOJI PICKER (same pattern as edit modal) */}
        <div className="flex flex-col gap-2">

         <div className="relative">
  <button
    onClick={() => setShowEmojiPicker((s) => !s)}
    className="text-3xl"
  >
    {emoji}
  </button>

  {showEmojiPicker && (
    <div className="absolute z-50 mt-2 shadow-xl rounded overflow-hidden">
      <EmojiPicker
        width={350}
        height={400}
        onEmojiClick={(emojiData) => {
          setEmoji(emojiData.emoji);
          setShowEmojiPicker(false);
        }}
      />
    </div>
  )}
</div>

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleCreate}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
}