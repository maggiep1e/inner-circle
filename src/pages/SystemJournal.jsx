import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";
import { createSystemJournal, getSystemJournals } from "../api/journals";

export default function SystemJournal() {
  const { systemId } = useParams();

  const user = useSessionStore((s) => s.user);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    if (!systemId) return;

    const loadEntries = async () => {
      setLoading(true);
      try {
        const data = await getSystemJournals(systemId);
        setEntries(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [systemId]);

  const submit = async () => {
    if (!title && !content) return;

    setSaving(true);

    try {
      await createSystemJournal({
        system_id: systemId,
        user_id: user.id,
        title,
        content,
      });

      setTitle("");
      setContent("");

      const data = await getSystemJournals(systemId);
      setEntries(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to save entry");
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold">System Journal</h1>

      <div className="space-y-2 border p-4 rounded bg-white dark:bg-zinc-900">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <textarea
          placeholder="Write entry..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 rounded w-full h-32"
        />

        <button
          onClick={submit}
          disabled={saving}
          className={`px-4 py-2 rounded text-white ${
            saving ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Previous Entries</h2>

       {loading ? (
  <div>Loading entries...</div>
) : entries.filter(e => e.author_member_id === null).length === 0 ? (
  <div className="text-gray-400 italic">
    No journal entries yet.
  </div>
) : (
  entries
    .filter((e) => e.author_member_id === null)
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    )
    .map((e) => (
      <div
        key={e.id}
        className="border p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700"
        onClick={() => setSelectedEntry(e)}
      >
        <div className="font-semibold">
          {e.title || "Untitled"}
        </div>

        <div className="text-gray-500 text-sm">
          {new Date(e.created_at).toLocaleString()}
        </div>

        <div className="truncate">{e.content}</div>
      </div>
    ))
)}
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="max-w-2xl w-full mx-4 bg-white dark:bg-zinc-900 rounded-xl p-6">
            <h2 className="text-2xl font-bold">
              {selectedEntry.title || "Untitled"}
            </h2>

            <p className="text-gray-500 text-sm mb-4">
              {new Date(selectedEntry.created_at).toLocaleString()}
            </p>

            <div className="whitespace-pre-wrap">
              {selectedEntry.content}
            </div>

            <button
              onClick={() => setSelectedEntry(null)}
              className="mt-4 px-4 py-2 bg-gray-300 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}