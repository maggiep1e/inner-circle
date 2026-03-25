// Members.jsx
import { useEffect, useState, useMemo } from "react";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import MemberProfile from "../components/MemberProfile";
import MemberEditor from "../components/MemberEditor";
import SearchBar from "../components/SearchBar";
import MemberCreator from "../components/MemberCreator";

export default function Members() {
  const members = useSystemStore((s) => s.members);
  const systemId = useSystemStore((s) => s.systemId);
const systems = useSystemStore((s) => s.systems);

const system = useMemo(
  () => systems.find((sys) => sys.id === systemId),
  [systems, systemId]
);

  const mode = useSessionStore((s) => s.mode);

  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState("closed");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const term = search.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(term));
  }, [members, search]);

    useEffect(() => {
  if (members) setLoading(false);
}, [members]);

  if (mode !== "system") return <div className="text-gray-400">This feature is for systems only.</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Members</h1>
        <h2 className="text-sm text-gray-500">{system?.display_name || "No system selected"}</h2>
      </div>

      <div className="flex gap-4 mb-4">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

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
          <div className="w-60 max-h-[600px] overflow-auto space-y-2">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="border p-2 rounded bg-gray-50 dark:bg-zinc-800"
              >
                <div className="font-semibold">{m.display_name || m.name}</div>
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
                {modalMode === "view" && (
                  <MemberProfile
                    member={selected}
                    onEdit={() => setModalMode("edit")}
                    onDone={() => setModalMode("closed")}
                  />
                )}
                {modalMode === "edit" && (
                  <MemberEditor
                    member={selected}
                    onDone={() => setModalMode("closed")}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        < MemberCreator 
        onDone={() => setShowCreateModal(false)
        }
        />
      )}
    </>
  );
}