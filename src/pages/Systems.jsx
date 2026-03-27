import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSystemStore } from "../store/systemStore";
import { getPublicUrl } from "../api/avatar";
import CurrentFront from "../components/CurrentFront";
import Card from "../components/Card";
import { useProfileStore } from "../store/profileStore";

export default function SystemsPage() {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile)

  const systems = useSystemStore((s) => s.systems);
  const loadSystems = useSystemStore((s) => s.loadSystems);

  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  // Precompute avatar URLs (prevents recalculating every render)
  const systemsWithAvatars = useMemo(() => {
    return systems.map((sys) => ({
      ...sys,
      avatarUrl: sys.avatar ? getPublicUrl(sys.avatar) : null,
    }));
  }, [systems]);

  return (
  
    <div className="flex gap-6 p-4">
                {/* ================= CURRENT FRONT (TOP PRIORITY) ================= */}
      <CurrentFront />
      <div className="w-84 space-y-3">
<Card>
        <h2 className="text-xl font-bold p-2">Systems</h2>

       {systemsWithAvatars.map((sys) => (
  <div
    key={sys.id}
    onClick={() => navigate(`/systems/${sys.id}`)}
    className="p-3 rounded cursor-pointer shadow-sm hover:opacity-90 transition flex flex-col gap-2"
    style={{ backgroundColor: sys.color || "#ffffff" }}
  >
    {/* TOP ROW: avatar + name */}
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

    {/* BOTTOM ACTIONS */}
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
        <Card>
          <h2 className="text-xl font-bold p-2">Settings</h2>
          <button className="w-24 h-24"
            onClick={(e) => {
        e.stopPropagation();
        navigate(`/user`);
      }}
          >
            <img src={getPublicUrl(profile.avatar)}/>
          </button>
        </Card>
    </div>

  );
}