import { useState } from "react";
import { updateFriendNote, removeFriend } from "../api/friends"; // implement these in backend

export default function FriendEditor({ friend, userId, onDone }) {
  const [note, setNote] = useState(friend.note || "");
  const [loading, setLoading] = useState(false);

  const otherUser = friend.requester.id === userId ? friend.receiver : friend.requester;

  // Save note
  async function saveNote() {
    setLoading(true);
    try {
      await updateFriendNote(friend.id, note);
      alert("Note saved!");
      onDone();
    } catch (err) {
      console.error(err);
      alert("Failed to save note.");
    }
    setLoading(false);
  }

  // Remove friend
  async function handleRemove() {
    if (!confirm(`Remove ${otherUser.username} from your friends?`)) return;
    setLoading(true);
    try {
      await removeFriend(friend.id);
      alert("Friend removed.");
      onDone();
    } catch (err) {
      console.error(err);
      alert("Failed to remove friend.");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-2">Edit Friend: {otherUser.username}</h2>

        <label className="block text-gray-500 text-sm mb-1">Personal Note / Nickname</label>
        <textarea
          className="w-full border p-2 rounded mb-4"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={loading}
        />

        <div className="flex justify-between gap-2">
          <button
            className="px-4 py-1 rounded bg-gray-300"
            onClick={onDone}
            disabled={loading}
          >
            Cancel
          </button>

          <div className="flex gap-2">
            <button
              className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={handleRemove}
              disabled={loading}
            >
              Remove Friend
            </button>

            <button
              className="px-4 py-1 rounded bg-green-500 text-white hover:bg-green-600"
              onClick={saveNote}
              disabled={loading}
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}