import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import { startFront } from "../api/front";


export default function SwitchFrontModal({ onClose }) {
  const members = useSystemStore((s) => s.members);
  const systemId = useSessionStore((s) => s.systemId);
  const setCurrentFront = useSystemStore((s) => s.setCurrentFront);


  const [search, setSearch] = useState("");

  const filtered = members.filter((m) =>
    ((m.displayName || m.name) ?? "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const handleSelect = async (member) => {
    setCurrentFront(member.id);
    if (systemId) await startFront(member.id, systemId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-[400px] shadow-xl">
        <h2 className="text-lg font-bold mb-4">Switch Front</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full mb-4 px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
            />
            <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
              {filtered.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelect(member)}
                  className="flex items-center gap-3 p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center">
                    {member.name?.[0]?.toUpperCase()}
                  </div>
                  <span>{member.displayName || member.name}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <span className="text-sm text-gray-500">No members found</span>
              )}
            </div>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}