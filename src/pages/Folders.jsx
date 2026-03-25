import { useEffect, useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import { supabase } from "../lib/supabase";
import { getMembersByFolder, createFolder, deleteFolder } from "../api/folders";
import AddMemberModal from "../components/AddMemberModal";

export default function Folders() {
  const profile = useSessionStore((s) => s.profile);
  const mode = useSessionStore((s) => s.mode);

  const systemId = useSystemStore((s) => s.systemId);
  const systemMembers = useSystemStore((s) => s.members);
  const folders = useSystemStore((s) => s.systemFolders);
  const loadFolders = useSystemStore((s) => s.loadFolders);

  const [expandedFolderId, setExpandedFolderId] = useState(null);
  const [folderMembers, setFolderMembers] = useState({});
  const [membersLoading, setMembersLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedFolderForAdd, setSelectedFolderForAdd] = useState(null);

  if (mode !== "system") return <div className="text-gray-400">This feature is for systems only.</div>;
  if (!profile) return <div>Loading profile...</div>;

  useEffect(() => {
    if (!systemId) return;
    loadFolders();
  }, [systemId, loadFolders]);

  const toggleFolder = async (folderId) => {
    if (expandedFolderId === folderId) return setExpandedFolderId(null);

    setMembersLoading(true);
    const members = await getMembersByFolder(folderId);
    setFolderMembers((prev) => ({ ...prev, [folderId]: members }));
    setExpandedFolderId(folderId);
    setMembersLoading(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder({ name: newFolderName, system_id: systemId });
    await loadFolders();
    setShowCreateModal(false);
    setNewFolderName("");
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm("Are you sure you want to delete this folder?")) return;
    await deleteFolder(folderId);
    await loadFolders();
    if (expandedFolderId === folderId) setExpandedFolderId(null);
  };

  const handleAddMember = async (memberId) => {
    if (!memberId || !selectedFolderForAdd) return;

    const folder = folders.find(f => f.id === selectedFolderForAdd);
    const member = systemMembers.find(m => m.id === memberId);

    const updatedFolders = Array.from(new Set([...(member.folders || []), folder.id]));
    await supabase
      .from("members")
      .update({ folders: updatedFolders })
      .eq("id", member.id);

    const members = await getMembersByFolder(folder.id);
    setFolderMembers(prev => ({ ...prev, [folder.id]: members }));

    setShowAddMemberModal(false);
    setSelectedFolderForAdd(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Folders</h1>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Folder
        </button>
      </div>

      {folders.length === 0 ? (
        <div className="text-gray-400 italic">No folders yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div key={folder.id} className="bg-zinc-100 dark:bg-zinc-600 p-4 rounded">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center cursor-pointer" onClick={() => toggleFolder(folder.id)}>
                  <h2 className="font-semibold text-xl">{folder.name}</h2>
                  <span>{expandedFolderId === folder.id ? "▾" : "▸"}</span>
                </div>
                <button
                  className="text-red-600 font-bold"
                  onClick={() => handleDeleteFolder(folder.id)}
                >
                  ✕
                </button>
              </div>

              {expandedFolderId === folder.id && (
                <div className="mt-2 pl-4 border-l border-gray-300 dark:border-zinc-600 space-y-1">
                  {membersLoading ? (
                    <div>Loading members...</div>
                  ) : folderMembers[folder.id]?.length ? (
                    folderMembers[folder.id].map((m) => (
                      <div key={m.id} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                        {m.displayName || m.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 italic">No members in this folder</div>
                  )}

                  <button
                    className="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    onClick={() => { setSelectedFolderForAdd(folder.id); setShowAddMemberModal(true); }}
                  >
                    + Add Member
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded shadow-lg w-96 flex flex-col gap-4">
            <h2 className="text-xl font-bold">Create New Folder</h2>
            <input
              type="text"
              placeholder="Folder Name"
              className="w-full px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600" onClick={handleCreateFolder}>Create</button>
            </div>
          </div>
        </div>
      )}

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        folder={folders.find(f => f.id === selectedFolderForAdd)}
        systemMembers={systemMembers}
        folderMembers={folderMembers[selectedFolderForAdd] || []}
        onAdd={handleAddMember}
      />
    </div>
  );
}