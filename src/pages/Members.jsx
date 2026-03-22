import { useState, useEffect } from "react";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import SearchBar from "../components/SearchBar";
import MemberProfile from "../components/MemberProfile";
import MemberEditor from "../components/MemberEditor";

export default function Members() {
  const members = useSystemStore((s) => s.members);
  const loadMembers = useSystemStore((s) => s.loadMembers);
  const addMember = useSystemStore((s) => s.addMember);
  const systemId = useSessionStore((s) => s.systemId);
  const setSystemId = useSystemStore((s) => s.setSystemId);

  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("view");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (systemId) setSystemId(systemId);
  }, [systemId, setSystemId]);

  useEffect(() => {
    if (!systemId) return;
    async function load() {
      setLoading(true);
      await loadMembers();
      setLoading(false);
    }
    load();
  }, [systemId, loadMembers]);

  async function handleCreateMember() {
    if (!newName.trim()) return;
    try {
      const newMember = await addMember({ name: newName });
      setSelected(newMember);
      setMode("edit");
      setNewName("");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <SearchBar />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
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
          {/* LEFT SIDEBAR */}
          <div className="w-60 space-y-2">
            {members.map((m) => (
              <div
                key={m._id || m.id}
                className="border p-2 rounded bg-gray-50 dark:bg-zinc-800"
              >
                <div className="font-semibold">{m.displayName || m.name}</div>

                {/* View/Edit buttons under each member */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setSelected(m);
                      setMode("view");
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-1"
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      setSelected(m);
                      setMode("edit");
                    }}
                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex-1"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {selected ? (
              <>
                {mode === "view" && (
                  <MemberProfile
                    member={selected}
                    onEdit={() => setMode("edit")}
                    onDone={() => setMode("")}
                  />
                )}
                {mode === "edit" && (
                  <MemberEditor
                    member={selected}
                    onDone={() => setMode("view")}
                  />
                )}
              </>
            ) : (
              <div className="text-gray-400 italic">
                Select "View" or "Edit" on a member to open
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
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
              <button
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                onClick={handleCreateMember}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}