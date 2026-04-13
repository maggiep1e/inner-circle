import { useState, useEffect } from "react";
import { useSystemStore } from "../store/systemStore";
import { resolveAvatar } from "../api/avatar";
import SetCustomFront from "./SetCustomFront";
import {
  getFronts,
  addToFront,
  removeFromFront,
} from "../api/front";
import { useSessionStore } from "../store/sessionStore";

export default function SwitchFrontModal({ onClose }) {
  const members = useSystemStore((s) => s.members);
  const systemId = useSystemStore((s) => s.currentSystem?.id);
  const user = useSessionStore((s) => s.user);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [initialFront, setInitialFront] = useState([]);
  const [openCustom, setOpenCustom] = useState(false);

  useEffect(() => {
    if (!systemId) return;

    async function load() {
      const data = await getFronts(systemId);

      const ids = data.map((f) => f.member_id);

      setSelected(ids);
      setInitialFront(ids);
    }
    load();
  }, [systemId]);

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

    const toAdd = selected.filter((id) => !initialFront.includes(id));
    const toRemove = initialFront.filter((id) => !selected.includes(id));
    for (const id of toAdd) {
      await addToFront(systemId, id, user?.id, "");
    }
    for (const id of toRemove) {
      await removeFromFront(systemId, id);
    }

    onClose();
  };

  return (
    <div>
 {!openCustom && ( 
     <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-[400px] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Select Front</h2>

          <button onClick={() => {setOpenCustom(true);}}>
            Custom
          </button>
        </div>

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
                className={`flex items-center gap-3 p-2 rounded transition border-2`}
                style={
                    isSelected ? { border: "3px solid #00e658" } : {}
                }
              >
                <img
                  src={resolveAvatar(member.avatar)}
                  className="w-8 h-8 rounded-full"
                />

                <span className="flex-1 text-left">
                  {member.display_name || member.name}
                </span>
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
            Done
          </button>
        </div>
      </div>)}

      {openCustom && (
        <div
          onClick={() => {setOpenCustom(false);}}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-[420px]">
            <SetCustomFront
              onClose={async () => {
                setOpenCustom(false);

                if (!systemId) return;

                const data = await getFronts(systemId);
                const ids = data.map((f) => f.member_id);

                setSelected(ids);
                setInitialFront(ids);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}