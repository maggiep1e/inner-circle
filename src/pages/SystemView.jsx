import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSystemStore } from "../store/systemStore";
import { supabase } from "../lib/supabase";
import { getPublicUrl } from "../api/avatar";

import SystemForm from "../components/SystemForm";
import SearchBar from "../components/SearchBar";
import { getMembersByFolder, deleteFolder } from "../api/folders";
import { resolveAvatar } from "../api/avatar";

export default function SystemView() {
  const navigate = useNavigate();
  const { id: systemIdParam } = useParams();

  const systems = useSystemStore((s) => s.systems);
  const currentSystem = useSystemStore((s) => s.currentSystem);
  const members = useSystemStore((s) => s.members);
  const folders = useSystemStore((s) => s.systemFolders);
  const currentFront = useSystemStore((s) => s.currentFront);
  const setCurrentFront = useSystemStore((s) => s.setCurrentFront);
  const hydrateSystem = useSystemStore((s) => s.hydrateSystem);
  const loadMembers = useSystemStore((s) => s.loadMembers);
  const loadFolders = useSystemStore((s) => s.loadFolders);
  const updateSystem = useSystemStore((s) => s.updateSystem);
  const deleteSystem = useSystemStore((s) => s.deleteSystem);

  const [edit, setEdit] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderMembers, setFolderMembers] = useState({});


  useEffect(() => {
    if (!systems?.length) return;

    const targetId =
      systemIdParam || currentSystem?.id || systems[0].id;

    if (!targetId) return;

    if (currentSystem?.id !== targetId) {
      hydrateSystem(targetId);
    }
  }, [systemIdParam, systems, currentSystem?.id, hydrateSystem]);

  useEffect(() => {
    if (!currentSystem?.id) return;

    loadMembers(currentSystem.id);
    loadFolders(currentSystem.id);
  }, [currentSystem?.id, loadMembers, loadFolders]);




  const toggleFront = (memberId) => {
    const current = Array.isArray(currentFront) ? currentFront : [];

    const updated = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];

    setCurrentFront(updated);
  };

  const systemAvatar = useMemo(() => {
    if (!currentSystem?.avatar) return "/default-avatar.png";
    return resolveAvatar(currentSystem?.avatar);
  }, [currentSystem?.avatar]);

  const sortedMembers = useMemo(() => {
    const frontSet = new Set(currentFront || []);

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


  const openFolder = async (folder) => {
    if (activeFolder?.id === folder.id) {
      setActiveFolder(null);
      return;
    }

    setActiveFolder(folder);

    const data = await getMembersByFolder(folder.id);

    setFolderMembers((prev) => ({
      ...prev,
      [folder.id]: data,
    }));
  };

  const addToFolder = async (memberId) => {
    if (!activeFolder) return;

    const member = members.find((m) => m.id === memberId);
    if (!member) return;

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
    if (!member) return;

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


  const handleSave = async (form) => {
    await updateSystem(currentSystem.id, form);
    hydrateSystem(currentSystem.id);
    setEdit(false);
  };

  const handleDeleteSystem = async () => {
  if (!currentSystem?.id) return;

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this system? This will delete all members and cannot be undone."
  );

  if (!confirmDelete) return;

  try {
    await deleteSystem(currentSystem.id);
    navigate("/");
  } catch (err) {
    console.error("Failed to delete system:", err);
  }
};


  if (!currentSystem) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Loading system...</p>
      </div>
    );
  }

 
  return (
    <div className="p-6 space-y-6">

      <div className="flex gap-2">
        <button onClick={() => navigate("/systems")}>
          ← Back
        </button>

        <button
          onClick={() =>
            navigate(`/import/${currentSystem?.id}`)
          }
          className="text-xs border rounded px-2 py-1"
        >
          Import
        </button>
      </div>



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

       <div className="p-4 pt-0 flex gap-2">
          <button
            onClick={() => setEdit(true)}
            className="border px-3 py-1 rounded"
          >
            Edit
          </button>

          <button
            onClick={handleDeleteSystem}
            className="border px-3 py-1 rounded text-red-500 border-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
        </div>


      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Folders</h2>

        {folders.map((folder) => {
          const isOpen = activeFolder?.id === folder.id;

          return (
            <div
              key={folder.id}
              className="border rounded mb-2"
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
                      loadFolders(currentSystem.id);
                    }}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="p-3 border-t space-y-2">
                  {(folderMembers[folder.id] || []).map((m) => (
                    <div
                      key={m.id}
                      className="flex justify-between text-sm"
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

                  <SearchBar
                    items={members.filter(
                      (m) => !currentFolderMemberIds.has(m.id)
                    )}
                    placeholder="Add member..."
                    onSelect={(m) => addToFolder(m.id)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>



      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-4">
        <div className="flex justify-between">
        <h2 className="font-semibold mb-3">
          Members ({members.length})
        </h2>
        <button className=" mb-3" onClick={() =>
    navigate(`/systems/${currentSystem.id}/members/new`)}>+ Add Member</button>
        </div>
        <SearchBar
          items={members}
          placeholder="Search members..."
          onSelect={(m) =>
            navigate(`/systems/${currentSystem.id}/members/${m.id}`)
          }
        />

        <div className="mt-3 space-y-2">
          {sortedMembers.map((m) => {
            const isFront = (currentFront || []).includes(m.id);

            return (
              <div
                key={m.id}
                className={`flex items-center justify-between gap-2 p-2 border rounded ${
                  isFront
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : ""
                }`}
              >


                <div
                  className="flex items-center gap-2 flex-1 cursor-pointer"
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



                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFront(m.id);
                  }}
                  className="text-xs border px-2 py-1 rounded"
                >
                  {isFront ? "Remove Front" : "Set Front"}
                </button>
              </div>
            );
          })}
        </div>
      </div>


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