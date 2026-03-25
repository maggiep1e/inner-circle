import { useState, useEffect } from "react";
import { useSystemStore } from "../store/systemStore";

export default function AddMemberModal({ 
  isOpen, 
  onClose, 
  folder, 
  folderMembers = [], 
  onAdd 
}) {
  const [selectedMember, setSelectedMember] = useState("");
  const members = useSystemStore((s) => s.members);
  const loadMembers = useSystemStore((s) => s.loadMembers);

  useEffect(() => {
    if (!isOpen) {
      setSelectedMember("");
      return;
    }

    const fetchMembers = async () => {
      await loadMembers();
      setSelectedMember("");
    };

    fetchMembers();
  }, [isOpen, loadMembers]);

  if (!isOpen || !folder) return null;

  const availableMembers = members.filter(
    (m) => !folderMembers.some((fm) => fm.id === m.id)
  );

  const handleAdd = () => {
    if (!selectedMember) return;
    onAdd(selectedMember);
    setSelectedMember("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded shadow-lg w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Add Member to "{folder.name}"</h2>
        <select
          className="w-full px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">Select member</option>
          {availableMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName || m.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}