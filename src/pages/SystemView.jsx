import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSystemStore } from "../store/systemStore";
import SystemForm from "../components/SystemForm";
import SearchBar from "../components/SearchBar";
import { supabase } from "../lib/supabase";
import {
  getMembersByFolder,
  deleteFolder,
} from "../api/folders";

export default function SystemView() {
  const navigate = useNavigate();
  const { id: systemId } = useParams();

  // -----------------------------
  // STORE
  // -----------------------------
  const currentSystem = useSystemStore((s) => s.currentSystem);
  const members = useSystemStore((s) => s.members);
  const folders = useSystemStore((s) => s.systemFolders);
  const currentFront = useSystemStore((s) => s.currentFront || []);

  const setCurrentSystem = useSystemStore((s) => s.setCurrentSystem);
  const loadMembers = useSystemStore((s) => s.loadMembers);
  const loadFolders = useSystemStore((s) => s.loadFolders);
  const updateSystem = useSystemStore((s) => s.updateSystem);

  // -----------------------------
  // LOCAL STATE
  // -----------------------------
  const [edit, setEdit] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderMembers, setFolderMembers] = useState({});

  // -----------------------------
  // HYDRATION (FIXED)
  // -----------------------------
  useEffect(() => {
    if (!systemId) return;

    // ensure correct system is selected
    if (currentSystem?.id !== systemId) {
      setCurrentSystem(systemId);
      return;
    }

    // once system is ready → load dependent data
    loadMembers(systemId);
    loadFolders();
  }, [systemId, currentSystem?.id, setCurrentSystem, loadMembers, loadFolders]);

  // -----------------------------
  // DERIVED VALUES
  // -----------------------------
  const systemAvatar =
    currentSystem?.avatarUrl || "/default-avatar.png";

  const sortedMembers = useMemo(() => {
    const frontSet = new Set(currentFront);

    return [...members].sort((a, b) => {
      const aFront = frontSet.has(a.id);
      const bFront = frontSet.has(b.id);
      if (aFront === bFront) return 0;
      return aFront ? -1 : 1;
    });
  }, [members, currentFront]);

  const currentFolderMemberIds = new Set(
    (folderMembers[activeFolder?.id] || []).map((m) => m.id)
  );

  // -----------------------------
  // FOLDERS
  // -----------------------------
  const openFolder = async (folder) => {
    if (activeFolder?.id === folder.id) {
      setActiveFolder(null);
      return;
    }

    setActiveFolder(folder);

    const membersInFolder = await getMembersByFolder(folder.id);

    setFolderMembers((prev) => ({
      ...prev,
      [folder.id]: membersInFolder,
    }));
  };

  const addToFolder = async (memberId) => {
    if (!activeFolder) return;

    const member = members.find((m) => m.id === memberId);

    const updatedFolders = Array.from(
      new Set([...(member.folders || []), activeFolder.id])
    );

    await supabase
      .from("members")
      .update({ folders: updatedFolders })
      .eq("id", member.id);

    const updated = await getMembersByFolder(activeFolder.id);

    setFolderMembers((prev) => ({
      ...prev,
      [activeFolder.id]: updated,
    }));
  };

  const removeFromFolder = async (memberId) => {
    if (!activeFolder) return;

    const member = members.find((m) => m.id === memberId);

    const updatedFolders = (member.folders || []).filter(
      (f) => f !== activeFolder.id
    );

    await supabase
      .from("members")
      .update({ folders: updatedFolders })
      .eq("id", member.id);

    const updated = await getMembersByFolder(activeFolder.id);

    setFolderMembers((prev) => ({
      ...prev,
      [activeFolder.id]: updated,
    }));
  };

  // -----------------------------
  // SYSTEM SAVE (FIXED)
  // -----------------------------
  const handleSave = async (form) => {
    await updateSystem(currentSystem.id, form);
    setEdit(false);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6 space-y-6">

      {/* BACK + IMPORT */}
      <div className="flex gap-2">
        <button onClick={() => navigate("/systems")}>
          ← Back
        </button>

        <button
          onClick={() => navigate(`/import/${currentSystem.id}`)}
          className="text-xs border rounded px-2 py-1"
        >
          Import
        </button>
      </div>

      {/* ================= HEADER ================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow overflow-hidden">

        <div
          className="h-32 flex items-end p-4 relative"
          style={{ backgroundColor: currentSystem?.color || "#888" }}
        >
          <h1 className="text-2xl pl-24 font-bold text-white">
            {currentSystem?.name}
          </h1>

          <img
            src={systemAvatar}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow absolute -bottom-12 left-4"
          />
        </div>

        <div className="p-4 pt-14">
          {currentSystem?.description || (
            <p className="text-gray-400">No description yet.</p>
          )}
        </div>

        <div className="p-4 pt-0">
          <button
            onClick={() => setEdit(true)}
            className="border px-3 py-1 rounded"
          >
            Edit
          </button>
        </div>
      </div>

      {/* ================= FOLDERS ================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-4">

        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Folders</h2>

          <button
            onClick={() =>
              navigate(`/systems/${currentSystem.id}/folders/new`)
            }
            className="px-3 py-1 text-sm border rounded"
          >
            + Add Folder
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {folders.map((folder) => {
            const isOpen = activeFolder?.id === folder.id;

            return (
              <div
                key={folder.id}
                className="border rounded"
                style={{ borderColor: folder.color }}
              >
                <div
                  onClick={() => openFolder(folder)}
                  className="flex justify-between items-center p-2 cursor-pointer"
                >
                  <span>📁 {folder.name}</span>

                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/systems/${currentSystem.id}/folders/${folder.id}/edit`
                        );
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm("Delete folder?")) return;
                        await deleteFolder(folder.id);
                        loadFolders();
                      }}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="p-3 border-t">

                    {(folderMembers[folder.id] || []).map((m) => (
                      <div
                        key={m.id}
                        className="flex justify-between text-sm p-1"
                      >
                        <span>{m.display_name || m.name}</span>

                        <button
                          onClick={() => removeFromFolder(m.id)}
                          className="text-red-500 text-xs"
                        >
                          remove
                        </button>
                      </div>
                    ))}

                    <div className="border-t pt-2">
                      <SearchBar
                        items={members.filter(
                          (m) => !currentFolderMemberIds.has(m.id)
                        )}
                        placeholder="Search members..."
                        onSelect={(member) => addToFolder(member.id)}
                      />
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MEMBERS ================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-4">

        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">
            All Members ({members.length})
          </h2>

          <button
            onClick={() =>
              navigate(`/systems/${currentSystem.id}/members/new`)
            }
          >
            Add member
          </button>
        </div>

        <SearchBar
          items={members}
          placeholder="Search members..."
          onSelect={(member) =>
            navigate(
              `/systems/${currentSystem.id}/members/${member.id}`
            )
          }
        />

        <div className="gap-2 mt-3">
          {sortedMembers.map((m) => {
            const isFront = currentFront.includes(m.id);

            return (
              <div
                key={m.id}
                className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
                  isFront ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""
                }`}
                onClick={() =>
                  navigate(
                    `/systems/${currentSystem.id}/members/${m.id}`
                  )
                }
              >
                <img
                  src={m.avatarUrl || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full object-cover"
                />

                <span>
                  {m.display_name || m.name}
                  {isFront && (
                    <span className="ml-2 text-xs text-green-500">
                      • fronting
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {edit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded w-96">
            <SystemForm
              initialData={currentSystem}
              onSubmit={handleSave}
            />

            <button
              onClick={() => setEdit(false)}
              className="mt-2 w-full border p-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}