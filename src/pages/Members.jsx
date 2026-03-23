import { useEffect, useState } from "react";
import { useSystemStore } from "../store/systemStore";
import MemberProfile from "../components/MemberProfile";
import MemberEditor from "../components/MemberEditor";
import SearchBar from "../components/SearchBar";
import { useSessionStore} from "../store/sessionStore"

export default function Members() {
  const members = useSystemStore((s) => s.members);
  const loadMembers = useSystemStore((s) => s.loadMembers);
  const addMember = useSystemStore((s) => s.addMember);
  const systemFolders = useSystemStore((s) => s.systemFolders || []);
  const systemId = useSystemStore((s) => s.systemId);
  const system = useSystemStore((s) => s.systems.find(sys => sys.id === systemId));

  const mode = useSessionStore((s) => s.mode);

  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState("closed");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!systemId) return;
    setLoading(true);
    loadMembers().finally(() => setLoading(false));
  }, [systemId]);

  const handleCreateMember = async () => {
    if (!newName.trim()) return;
    const newMember = await addMember({ name: newName, systemId });
    setSelected(newMember);
    setModalMode("edit");
    setNewName("");
    setShowCreateModal(false);
  };

  if (mode !== "system") return <div className="text-gray-400">This feature is for systems only.</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Members</h1>
        <h2 className="text-sm text-gray-500">{system?.display_name || "No system selected"}</h2>
      </div>

      <div className="flex gap-4 mb-4"><SearchBar /></div>

      <div className="flex gap-4 mb-4">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={() => setShowCreateModal(true)}
          disabled={!systemId}
        >
          Add Member
        </button>
      </div>

      {loading ? (
        <div>Loading members...</div>
      ) : (
        <div className="flex gap-6">
          <div className="w-60 space-y-2">
            {members.map((m) => (
              <div key={m.id} className="border p-2 rounded bg-gray-50 dark:bg-zinc-800">
                <div className="font-semibold">{m.displayName || m.name}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-1"
                    onClick={() => { setSelected(m); setModalMode("view"); }}
                  >
                    View
                  </button>
                  <button
                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex-1"
                    onClick={() => { setSelected(m); setModalMode("edit"); }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1">
            {selected && (
              <>
                {modalMode === "view" && <MemberProfile member={selected} onEdit={() => setModalMode("edit")} onDone={() => setModalMode("closed")} />}
                {modalMode === "edit" && <MemberEditor member={selected} onDone={() => setModalMode("closed")} />}
              </>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Member</h2>
            <input
              className="w-full border p-2 rounded mb-4"
              placeholder="Member Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600" onClick={handleCreateMember}>Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}