import { useState } from "react";
import { useSystemStore } from "../store/systemStore";

export default function FolderSidebar({ folders, setFolder }) {

  const addFolder = useSystemStore((s) => s.addFolder);

  const [newFolder, setNewFolder] = useState("");

  return (
    <div className="flex flex-col gap-2">

      <div className="flex gap-2">

        <input
          value={newFolder}
          onChange={(e) => setNewFolder(e.target.value)}
          placeholder="New folder"
          className="bg-zinc-800 px-2 py-1 rounded"
        />

        <button
          onClick={() => {
            if (!newFolder) return;
            addFolder(newFolder);
            setNewFolder("");
          }}
          className="bg-purple-600 px-3 py-1 rounded"
        >
          Add
        </button>

      </div>

      {folders.map((f) => (
        <button
          key={f}
          onClick={() => setFolder(f)}
          className="text-left px-3 py-2 bg-zinc-800 rounded"
        >
          {f}
        </button>
      ))}

    </div>
  );
}