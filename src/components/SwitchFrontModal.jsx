import { useState, useEffect } from "react";
import { useSystemStore } from "../store/systemStore";

export default function SwitchFrontModal({ onClose }) {
  const members = useSystemStore((s) => s.members);
  const systemId = useSystemStore((s) => s.systemId);
  const currentFront = useSystemStore((s) => s.currentFront);
  const setFront = useSystemStore((s) => s.setFront);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  // preload current front into local state
  useEffect(() => {
    setSelected(currentFront || []);
  }, [currentFront]);

  const filtered = members.filter((m) =>
    ((m.displayName || m.name) ?? "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleDone = async () => {
    if (!systemId) return;
    await setFront(selected); // 🔥 ONE DB CALL
    onClose();
  };

  const isSelected = (id) => selected.includes(id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-[400px] shadow-xl">
        <h2 className="text-lg font-bold mb-4">Select Front</h2>

        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full mb-4 px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
        />

        {/* LIST */}
        <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
          {filtered.map((member) => {
            const selectedState = isSelected(member.id);

            return (
              <button
                key={member.id}
                onClick={() => toggle(member.id)}
                className={`flex items-center gap-3 p-2 rounded transition
                  ${
                    selectedState
                      ? "bg-blue-500 text-white"
                      : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }
                `}
              >
                <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center">
                  {member.name?.[0]?.toUpperCase()}
                </div>

                <span className="flex-1 text-left">
                  {member.displayName || member.name}
                </span>

                {selectedState && <span className="text-xs">✓</span>}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <span className="text-sm text-gray-500">No members found</span>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-4">
          <button onClick={() => setSelected([])}>
            Clear
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2 rounded bg-zinc-300 dark:bg-zinc-700"
          >
            Cancel
          </button>

          <button
            onClick={handleDone}
            className="flex-1 py-2 rounded bg-blue-500 text-white"
          >
            Done ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}