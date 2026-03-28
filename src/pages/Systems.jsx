import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSystemStore } from "../store/systemStore";
import { useProfileStore } from "../store/profileStore";
import { useSessionStore } from "../store/sessionStore";
import { getPublicUrl } from "../api/avatar";

import CurrentFront from "../components/CurrentFront";
import Card from "../components/Card";

export default function SystemsPage() {
  const navigate = useNavigate();

  // -----------------------------
  // STORES
  // -----------------------------
  const systems = useSystemStore((s) => s.systems);
  const loadSystems = useSystemStore((s) => s.loadSystems);
  const hydrateSystem = useSystemStore((s) => s.hydrateSystem);
  const ensureCurrentSystem = useSystemStore((s) => s.ensureCurrentSystem);

  const profile = useProfileStore((s) => s.profile);
  const userId = useSessionStore((s) => s.userId);

  // -----------------------------
  // LOAD SYSTEMS
  // -----------------------------
  useEffect(() => {
    if (!userId) return;
    loadSystems(userId);
  }, [userId, loadSystems]);

  // -----------------------------
  // AUTO-SELECT FIRST SYSTEM
  // -----------------------------
  useEffect(() => {
    if (!systems?.length) return;

    ensureCurrentSystem();
  }, [systems, ensureCurrentSystem]);

  // -----------------------------
  // HELPERS
  // -----------------------------
  const getAvatar = (path) =>
    path ? getPublicUrl(path) : "/default-avatar.png";

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="flex flex-wrap md:flex-nowrap gap-6 p-4">

      {/* CURRENT FRONT */}
      <CurrentFront />

      {/* SYSTEMS LIST */}
      <div className="w-84 space-y-3">
        <Card>
          <h2 className="text-xl font-bold p-2">Systems</h2>

          {systems?.map((sys) => {
            const avatar = getAvatar(sys.avatar);

            return (
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
                    src={avatar}
                    alt="system avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                  />

                  <div className="font-semibold text-sm">
                    {sys.name || "Unnamed System"}
                  </div>
                </div>

                {/* ACTION */}
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
            );
          })}

          <button
            onClick={() => navigate("/systems/new")}
            className="mt-3 w-full bg-green-500 text-white px-3 py-2 rounded"
          >
            + Create System
          </button>
        </Card>
      </div>

      {/* SETTINGS */}
      <Card>
        <h2 className="text-xl font-bold p-2">Settings</h2>

        <img
          src={
            profile?.avatar
              ? getPublicUrl(profile.avatar)
              : "/default-avatar.png"
          }
          onClick={() => navigate("/user")}
          className="w-24 h-24 rounded-full object-cover shadow cursor-pointer"
        />
      </Card>
    </div>
  );
}