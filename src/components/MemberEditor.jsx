import { useState, useEffect } from "react";
import { useSystemStore } from "../store/systemStore";
import { useNavigate } from "react-router-dom";

export default function MemberEditor({ member = {}, onDone }) {
  const updateMember = useSystemStore((s) => s.updateMember);
  const systemFolders = useSystemStore((s) => s.systemFolders || []);
  const systemId = useSystemStore((s) => s.systemId);
  const navigate = useNavigate();

  const normalizeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {}
      return value.split(",").map((v) => v.trim()).filter(Boolean);
    }
    return [];
  };

  const [name, setName] = useState(member.name || "");
  const [displayName, setDisplayName] = useState(member.displayName || "");
  const [color, setColor] = useState(member.color || "#ffffff");
  const [tags, setTags] = useState(normalizeArray(member.tags));
  const [folders, setFolders] = useState(normalizeArray(member.folders)); // folder IDs
  const [avatar, setAvatar] = useState(member.avatar || "");
  const [folderSearch, setFolderSearch] = useState("");

  
const save = async () => {
    // Update member’s folders in Supabase
    await supabase
      .from("members")
      .update({ folders })
      .eq("id", member.id);

    // Optionally update folder.member_ids in each folder
    for (const f of folders) {
      const folder = systemFolders.find(x => x.id === f);
      if (!folder) continue;
      const updatedMemberIds = Array.from(new Set([...(folder.member_ids || []), member.id]));
      await supabase
        .from("folders")
        .update({ member_ids: updatedMemberIds })
        .eq("id", f);
    }

    // Update local store
    updateMember(member.id, { name, displayName, color, tags, folders, avatar });

    // Close editor
    onDone();
  };

  const addFolder = (folderId) => {
    if (!folders.includes(folderId)) setFolders([...folders, folderId]);
    setFolderSearch("");
  };

  const removeFolder = (folderId) => {
    setFolders(folders.filter((f) => f !== folderId));
  };

  // Filter system folders for autocomplete
  const filteredFolders = systemFolders.filter(
    (f) =>
      f.name.toLowerCase().includes(folderSearch.toLowerCase()) &&
      !folders.includes(f.id)
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="dark:bg-zinc-800 p-6 rounded-xl w-96 flex flex-col gap-4">

        <h2 className="text-xl font-bold">Edit Member</h2>

        {/* Avatar */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setAvatar(reader.result);
            reader.readAsDataURL(file);
          }}
        />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="bg-zinc-700 px-3 py-2 rounded"
        />

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          className="bg-zinc-700 px-3 py-2 rounded"
        />

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-16 h-8 p-0 border-none"
        />

        <input
          placeholder="tags (comma separated)"
          value={tags.join(",")}
          onChange={(e) =>
            setTags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
          }
          className="bg-zinc-700 px-3 py-2 rounded"
        />

        {/* Folder selector */}
        <div className="flex flex-col gap-2">
          {/* Selected folders */}
          <div className="flex flex-wrap gap-2">
            {folders.map((id) => {
              const folder = systemFolders.find((f) => f.id === id);
              if (!folder) return null;
              return (
                <span
                  key={id}
                  className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                >
                  📁 {folder.name}
                  <button onClick={() => removeFolder(id)} className="text-xs font-bold">×</button>
                </span>
              );
            })}
          </div>

          {/* Folder search / add */}
          <div className="flex flex-wrap gap-2">
            {filteredFolders.map((sf) => (
              <button
                key={sf.id}
                onClick={() => addFolder(sf.id)}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
              >
                {sf.name}
              </button>
            ))}
            <button
              onClick={() => navigate("/folders")}
              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
            >
              + New Folder
            </button>
          </div>
        </div>

        {/* Save / Cancel */}
        <div className="flex gap-2 mt-2">
          <button onClick={save} className="bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-700">
            Save
          </button>
          <button onClick={onDone} className="bg-gray-500 px-4 py-2 rounded text-white hover:bg-gray-600">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}