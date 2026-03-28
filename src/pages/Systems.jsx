import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSystemStore } from "../store/systemStore";
import CurrentFront from "../components/CurrentFront";
import Card from "../components/Card";
import { useProfileStore } from "../store/profileStore";
import { useSessionStore } from "../store/sessionStore";

export default function SystemsPage() {
  const navigate = useNavigate();

  // -----------------------------
  // STORES
  // -----------------------------
  const systems = useSystemStore((s) => s.systems);
  const loadSystems = useSystemStore((s) => s.loadSystems);

  const hydrateSystem = useSystemStore((s) => s.hydrateSystem);

  const profile = useProfileStore((s) => s.profile);
  const userId = useSessionStore((s) => s.userId);

  // -----------------------------
  // INIT (FIXED: no loop / no double fetch)
  // -----------------------------
  useEffect(() => {
    if (!userId) return;
    loadSystems(userId);
  }, [userId, loadSystems]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="flex flex-wrap md:no-wrap gap-6 p-4">

      {/* ================= CURRENT FRONT ================= */}
      <CurrentFront />

      {/* ================= SYSTEMS LIST ================= */}
      <div className="w-84 space-y-3">
        <Card>
          <h2 className="text-xl font-bold p-2">Systems</h2>

          {systems?.map((sys) => (
            <div
              key={sys.id}
              onClick={() => {
                hydrateSystem(sys.id);
                navigate(`/systems/${sys.id}`);
              }}
              className="p-3 rounded cursor-pointer shadow-sm hover:opacity-90 transition flex flex-col gap-2"
              style={{ backgroundColor: sys.color || "#ffffff" }}
            >
              {/* TOP ROW */}
              <div className="flex items-center gap-3">
                <img
                  src={sys.avatarUrl || "/default-avatar.png"}
                  alt="system avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                />

                <div className="font-semibold text-sm">
                  {sys.name || "Unnamed System"}
                </div>
              </div>

              {/* ACTIONS */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/systems/${sys.id}/journal`);
                }}
                className="text-xs underline text-left"
              >
                System Journal
              </button>
            </div>
          ))}

          <button
            onClick={() => navigate("/systems/new")}
            className="mt-3 w-full bg-green-500 text-white px-3 py-2 rounded"
          >
            + Create System
          </button>
        </Card>
      </div>

      {/* ================= SETTINGS ================= */}
      <Card>
        <h2 className="text-xl font-bold p-2">Settings</h2>

        <img
          src={profile?.avatarUrl || "/default-avatar.png"}
          onClick={() => navigate("/user")}
          className="w-24 h-24 rounded-full object-cover shadow cursor-pointer"
        />
      </Card>
    </div>
  );
}