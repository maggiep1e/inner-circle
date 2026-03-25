// MemberProfile.jsx
import { useState } from "react";
import MemberMarkdown from "./MemberMarkdown";

export default function MemberProfile({ member = {}, onEdit, onDone }) {
  const [folderSearch, setFolderSearch] = useState("");
  const username = member.name?.toLowerCase().replace(/[^a-z0-9]/g, "") || "unknown";

  const normalizeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return value.toString().split(",").map((v) => v.trim()).filter(Boolean);
  };

  const tags = normalizeArray(member.tags);
  const folders = normalizeArray(member.folders); // directly from member

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="max-w-2xl w-full mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">
  
        <div className="h-32 w-full" style={{ backgroundColor: member.color || "#888" }} />

        <div className="p-6 relative">
          <div className="absolute -top-12 left-6">
            {member.avatar ? (
              <img
                src={member.avatar}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                alt="avatar"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white border-4 border-white"
                style={{ backgroundColor: member.color || "#888" }}
              >
                {member.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          {onEdit && (
            <div className="flex justify-end">
              <button
                onClick={onEdit}
                className="border px-4 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                Edit
              </button>
            </div>
          )}
          <div className="mt-12">
            <h2 className="text-2xl font-bold">{member.display_name || member.name || "Unknown"}</h2>
            <p className="text-gray-500">@{username}</p>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, i) => (
                <span key={i} className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {folders.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {folders.map((folder, i) => (
                <span key={i} className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                  📁 {folder}
                </span>
              ))}
            </div>
          )}
          {member.description ? (
            <div className="mt-4">
              <MemberMarkdown text={member.description} />
            </div>
          ) : (
            <p className="text-gray-400 mt-4">No description yet.</p>
          )}

          {onDone && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={onDone}
                className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}