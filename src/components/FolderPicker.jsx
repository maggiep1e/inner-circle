import { useState, useRef, useEffect } from "react";

export default function FolderPicker({ allFolders = [], selectedIds = [], onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const normalizedSelected = selectedIds.map(String);

  const toggleFolder = (id) => {
    const strId = String(id);

    if (normalizedSelected.includes(strId)) {
      onChange(normalizedSelected.filter((f) => f !== strId));
    } else {
      onChange([...normalizedSelected, strId]);
    }
  };

 
  const selectedFolders = allFolders.filter((f) =>
    normalizedSelected.includes(String(f.id))
  );


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      
      <div
        onClick={() => setOpen((o) => !o)}
        className="min-h-[42px] w-full px-3 py-2 border rounded-lg flex flex-wrap gap-2 cursor-pointer"
      >
        {selectedFolders.length === 0 && (
          <span className="text-gray-400">Select folders</span>
        )}

        {selectedFolders.map((f) => (
          <span
            key={f.id}
            className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
          >
            {f.name}
          </span>
        ))}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {allFolders.map((f) => {
            const isSelected = normalizedSelected.includes(String(f.id));

            return (
              <div
                key={f.id}
                onClick={() => toggleFolder(f.id)}
                className={`px-3 py-2 cursor-pointer flex justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isSelected ? "bg-blue-100 dark:bg-blue-900" : ""
                }`}
              >
                <span>{f.name}</span>
                {isSelected && <span>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}