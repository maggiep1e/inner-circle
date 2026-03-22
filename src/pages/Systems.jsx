import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSystems } from "../api/systems";
import { useSessionStore } from "../store/sessionStore";
import { useSystemStore } from "../store/systemStore";

export default function Systems() {
  const [systems, setSystems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const setSystem = useSessionStore((s) => s.setSystem);
  const createAndSetSystem = useSystemStore((s) => s.createAndSetSystem);
  const navigate = useNavigate(); // ✅ hook to navigate programmatically

  async function load() {
    try {
      const data = await getSystems();
      setSystems(data || []);
    } catch (err) {
      console.error("❌ Failed to load systems:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // CREATE SYSTEM
  async function handleCreate() {
    if (!name.trim()) return;

    try {
      const newSystem = await createAndSetSystem(name); // uses Zustand flow
      setSystems((prev) => [...prev, newSystem]);
      setName("");
      console.log("Created system:", newSystem);

      // automatically select and navigate
      setSystem(newSystem.id);
      navigate("/members");

    } catch (err) {
      console.error("❌ Failed to create system:", err);
    }
  }

  // SELECT SYSTEM
  function handleSelect(id) {
    setSystem(id);
    navigate("/members"); // ✅ navigate when clicking a system
  }

  if (loading) return <div>Loading systems...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Systems</h1>

{ systems.length === 0 && (  
  <>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="System name"
          className="border p-2"
        />
        <button onClick={handleCreate}>Create System</button>
      </div>
        <p className="text-gray-500">
          No systems yet — create one to continue.
        </p>
        </>
      )}

      {/* LIST */}
      {systems.map((s) => (
        <div
          key={s.id}
          onClick={() => handleSelect(s.id)}
          className="border p-3 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          {s.name}
        </div>
      ))}
    </div>
  );
}