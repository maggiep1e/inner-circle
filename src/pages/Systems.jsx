import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import SystemProfile from "../components/SystemProfile";
import SystemEditor from "../components/SystemEditor";

export default function Systems() {
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const mode = useSessionStore((s) => s.mode);

  const systems = useSystemStore((s) => s.systems);
  const currentSystem = useSystemStore((s) => s.currentSystem);
  const setCurrentSystem = useSystemStore((s) => s.setCurrentSystem);
  const createAndSetSystem = useSystemStore((s) => s.createAndSetSystem);
  const loadMembers = useSystemStore((s) => s.loadMembers);

  // --- Local modal state ---
  const [modalMode, setModalMode] = useState("closed"); // "view" | "edit" | "closed"
  const [modalSystem, setModalSystem] = useState(null);

  if (!profile) return <div>Loading profile...</div>;
  if (mode !== "system") return <div className="text-gray-400">This feature is for systems only.</div>;

  const isPaid = user?.plan === "paid";

  // --- Create new system ---
  const handleCreateSystem = async () => {
    if (!user) return;
    if (!isPaid && systems.length >= 1) {
      alert("Free plan limit reached. Upgrade to add more systems!");
      return;
    }

    const name = prompt("Enter system name");
    if (!name) return;

    try {
      const newSystem = await createAndSetSystem(name);
      if (newSystem) await loadMembers();
    } catch (err) {
      console.error("Failed to create system:", err);
    }
  };

  // --- Open modal locally without touching global store ---
  const handleOpenModal = (sys, mode) => {
    setModalSystem(sys);
    setModalMode(mode);
  };

  // --- Close modal ---
  const handleCloseModal = () => {
    setModalMode("closed");
    setModalSystem(null);
  };

  // --- Save edits globally ---
  const handleSaveSystem = (updated) => {
    // Update global store only when saving
    setCurrentSystem(updated);
    setModalMode("closed");
    setModalSystem(null);
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-60 space-y-2">
        <h2 className="text-xl font-bold">Your System{isPaid ? "s" : ""}</h2>

        {systems.length === 0 ? (
          <p className="text-gray-400">No systems yet.</p>
        ) : (
          systems.map((sys) => (
            <div
              key={sys.id}
              className={`border p-2 rounded cursor-pointer ${
                currentSystem?.id === sys.id
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-gray-50 dark:bg-zinc-800"
              }`}
            >
              <div className="font-semibold">{sys.display_name || "Unnamed System"}</div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleOpenModal(sys, "view")}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-1"
                >
                  View
                </button>
                <button
                  onClick={() => handleOpenModal(sys, "edit")}
                  className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex-1"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}

        <button
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleCreateSystem}
        >
          + Create {isPaid ? "System" : "Your System"}
        </button>
      </div>

      {/* Main content / Modal */}
      <div className="flex-1">
        {modalMode !== "closed" && modalSystem && (
          modalMode === "view" ? (
            <SystemProfile
              system={modalSystem}
              onEdit={() => setModalMode("edit")}
              onDone={handleCloseModal}
            />
          ) : (
            <SystemEditor
              system={modalSystem}
              onDone={handleCloseModal}
              onSave={handleSaveSystem} // pass save callback
            />
          )
        )}
      </div>
    </div>
  );
}