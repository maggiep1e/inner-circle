import { useEffect, useState } from "react";
import { getSystems, createSystem } from "../api/systems";
import { useSessionStore } from "../store/sessionStore";

export default function SystemSwitcher() {

  const [systems, setSystems] = useState([]);
  const [newName, setNewName] = useState("");

  const systemId = useSessionStore(s => s.systemId);
  const setSystem = useSessionStore(s => s.setSystem);

  useEffect(() => {
    loadSystems();
  }, []);

  async function loadSystems() {
    const data = await getSystems();
    setSystems(data);
  }

  async function handleCreate() {
    if (!newName) return;

    const system = await createSystem(newName);

    setSystems(prev => [...prev, system]);
    setSystem(system.id);

    setNewName("");
  }

  return (
    <div className="flex flex-col gap-2 p-2 border-r border-black dark:border-zinc-700">

      {/* Existing systems */}
      {systems.map((sys) => (
        <button
          key={sys.id}
          onClick={() => setSystem(sys.id)}
          className={`
            px-3 py-2 rounded-xl text-left
            border-2
            ${systemId === sys.id
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white dark:bg-zinc-800 border-black dark:border-zinc-600"}
          `}
        >
          {sys.name}
        </button>
      ))}

      {/* Create system */}
      <div className="mt-2 flex flex-col gap-1">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New system"
          className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700"
        />

        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-2 py-1 rounded"
        >
          +
        </button>
      </div>

    </div>
  );
}