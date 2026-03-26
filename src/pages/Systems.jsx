import { useEffect, useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import SystemModal from "../components/SystemModal";
import SystemCreator from "../components/SystemCreator";

export default function Systems() {
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const mode = useSessionStore((s) => s.mode);

  const systems = useSystemStore((s) => s.systems);
  const currentSystem = useSystemStore((s) => s.currentSystem);
  const setCurrentSystem = useSystemStore((s) => s.setCurrentSystem);
  const loadSystems = useSystemStore((s) => s.loadSystems);

  const [modeUI, setModeUI] = useState("closed"); // view | create

  useEffect(() => {
    loadSystems();
  }, []);

  useEffect(() => {
    if (!currentSystem && systems.length > 0) {
      setCurrentSystem(systems[0]);
    }
  }, [systems]);

  if (!profile) return <div>Loading...</div>;
  if (mode !== "system") return <div>System mode only</div>;

  return (
    <div className="flex gap-6">

      {/* Sidebar */}
      <div className="w-60 space-y-2">

        {systems.map((sys) => (
          <div
            key={sys.id}
            className="p-2 rounded cursor-pointer"
            style={{
              backgroundColor:
                currentSystem?.id === sys.id ? sys.color : undefined,
            }}
            onClick={() => setCurrentSystem(sys)}
          >
            <div className="font-semibold">
              {sys.name}
            </div>

            <button
              onClick={() => setModeUI("view")}
              className="mt-2 w-full bg-blue-500 text-white rounded"
            >
              View
            </button>
          </div>
        ))}

        <button
          className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
          onClick={() => setModeUI("create")}
        >
          + Create
        </button>
      </div>

      {/* Main */}
      <div className="flex-1">

        {modeUI === "view" && (
          <SystemModal onDone={() => setModeUI("closed")} />
        )}

        {modeUI === "create" && (
          <SystemCreator onDone={() => setModeUI("closed")} />
        )}

      </div>
    </div>
  );
}