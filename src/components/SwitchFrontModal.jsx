import { useState, useEffect } from "react";
import { useSystemStore } from "../store/systemStore";
import { resolveAvatar } from "../api/avatar";

export default function SwitchFrontModal({ onClose }) {
  const members = useSystemStore((s) => s.members);
  const systemId = useSystemStore((s) => s.currentSystem?.id);
  const currentFront = useSystemStore((s) => s.currentFront || []);
  const setFront = useSystemStore((s) => s.setFront);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);


  useEffect(() => {
  setSelected(Array.isArray(currentFront) ? currentFront : []);
}, [currentFront, systemId]);



  const filtered = members.filter((m) =>
    (m.display_name || m.name || "")
      .toLowerCase()
      .includes(search.toLowerCase().trim())
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

    await setFront(systemId, Array.isArray(selected) ? selected : []);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-[400px] shadow-xl">
      
      <h2 className="text-lg font-bold mb-4">
        Select Front
      </h2>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search members..."
        className="w-full mb-4 px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
      />

      <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
        {filtered.map((member) => {
          const isSelected = selected.includes(member.id);

          return (
            <button
              key={member.id}
              onClick={() => toggle(member.id)}
              className={`flex items-center gap-3 p-2 rounded transition ${
                isSelected
                  ? "bg-blue-500 text-white"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center">
                <img src={resolveAvatar(member.avatar)} alt={member.display_name} className="w-8 h-8 rounded-full"/>
              </div>

              <span className="flex-1 text-left">
                {member.display_name || member.name}
              </span>

              {isSelected && <span className="text-xs">✓</span>}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <span className="text-sm text-gray-500">
            No members found
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setSelected([])}
          className="text-sm text-gray-500"
        >
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
          Done
        </button>
      </div>
    </div>
  );
}