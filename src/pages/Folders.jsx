import { useEffect, useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { useSessionStore } from "../store/sessionStore";
import { supabase } from "../lib/supabase";
import { getMembersByFolder, createFolder, deleteFolder } from "../api/folders";
import AddMemberModal from "../components/AddMemberModal";
import EditFolderModal from "../components/EditFolderModal";
import CreateFolderModal from "../components/CreateFolderModal";

export default function Folders() {
  const profile = useSessionStore((s) => s.profile);
  const mode = useSessionStore((s) => s.mode);
  const user = useSessionStore((s) => s.user);

  const systemId = useSystemStore((s) => s.systemId);
  const systemMembers = useSystemStore((s) => s.members);
  const folders = useSystemStore((s) => s.systemFolders);
  const loadFolders = useSystemStore((s) => s.loadFolders);

  const [expandedFolderId, setExpandedFolderId] = useState(null);
  const [folderMembers, setFolderMembers] = useState({});
  const [membersLoading, setMembersLoading] = useState(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedFolderForAdd, setSelectedFolderForAdd] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editingFolder, setEditingFolder] = useState(null);

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

  const handleCreateFolder = async (data) => {
  await createFolder({
    name: data.name,
    system_id: systemId,
    user_id: user.id,
    color: data.color,
    emoji: data.emoji,
  });

  await loadFolders();
};

  const handleDeleteFolder = async (folderId) => {
    if (!confirm("Delete this folder?")) return;

    await deleteFolder(folderId);
    await loadFolders();

    if (expandedFolderId === folderId) {
      setExpandedFolderId(null);
    }
  };

  const handleAddMember = async (memberId) => {
    if (!memberId || !selectedFolderForAdd) return;

    const folder = folders.find(f => f.id === selectedFolderForAdd);
    const member = systemMembers.find(m => m.id === memberId);

    const updatedFolders = Array.from(new Set([
      ...(member.folders || []),
      folder.id
    ]));

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

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Folders</h1>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Folder
        </button>
      </div>

      {/* Folder Grid */}
      {folders.length === 0 ? (
        <div className="text-gray-400 italic">No folders yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
         {folders.map((folder) => {
  const isExpanded = expandedFolderId === folder.id;

  return (
    <div key={folder.id} className="flex flex-col">

      {/* Header */}
      <div
        onClick={() => toggleFolder(folder.id)}
        className="flex items-center justify-between px-3 py-2 cursor-pointer rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
        style={{
          boxShadow: `inset 4px 0 0 ${folder.color || "#6366f1"}`
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {folder.emoji || "📁"}
          </span>

          <span className="font-medium">
            {folder.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`transition ${isExpanded ? "rotate-90" : ""}`}>
          ▶
        </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingFolder(folder);
            }}
            className="text-xs text-blue-500 hover:underline"
          >
            Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFolder(folder.id);
            }}
            className="text-xs text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Members */}
      {isExpanded && (
        <div className="ml-4 pl-3 border-l border-zinc-300 dark:border-zinc-700 space-y-1 mt-1">

          {membersLoading ? (
            <div className="text-sm opacity-60">Loading...</div>
          ) : folderMembers[folder.id]?.length ? (
            folderMembers[folder.id].map((m) => (
              <div
                key={m.id}
                className="text-sm px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
              >
                {m.display_name || m.name}
              </div>
            ))
          ) : (
            <div className="text-sm opacity-50 italic">
              No members
            </div>
          )}

          <button
            className="text-xs text-blue-500 mt-1 hover:underline"
            onClick={() => {
              setSelectedFolderForAdd(folder.id);
              setShowAddMemberModal(true);
            }}
          >
            + Add Member
          </button>
        </div>
      )}
    </div>
  );
})}
        </div>
      )}

      {/* Create Modal */}
    <CreateFolderModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onCreate={handleCreateFolder}
/>

      {/* Edit Modal */}
      <EditFolderModal
        folder={editingFolder}
        onClose={() => setEditingFolder(null)}
        onSave={async (updated) => {
          await supabase
            .from("folders")
            .update(updated)
            .eq("id", updated.id);

          await loadFolders();
          setEditingFolder(null);
        }}
      />

      {/* Add Member Modal */}
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