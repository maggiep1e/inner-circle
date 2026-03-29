import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";

export default function SearchBar({
  items = [],
  onSelect,
  placeholder = "Search members...",
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: ["name", "display_name"],
      threshold: 0.35, 
    });
  }, [items]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const res = fuse.search(query).map((r) => r.item);

    setResults(res);
    setActiveIndex(0);
    setOpen(true);
  }, [query, fuse]);

  
  
  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[activeIndex];
      if (selected) {
        onSelect?.(selected);
        setQuery("");
        setOpen(false);
      }
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="
          w-full px-3 py-2 rounded-md
          bg-zinc-200 dark:bg-zinc-700
          outline-none
          focus:ring-2 focus:ring-blue-500
        "
      />
      {open && results.length > 0 && (
        <div className="
          absolute z-50 mt-2 w-full
          bg-white dark:bg-zinc-800
          border border-zinc-300 dark:border-zinc-700
          rounded-md shadow-lg
          max-h-64 overflow-auto
        ">
          {results.map((item, i) => (
            <div
              key={item.id || i}
              onMouseDown={() => {
                onSelect?.(item);
                setQuery("");
                setOpen(false);
              }}
              className={`
                px-3 py-2 cursor-pointer
                ${i === activeIndex ? "bg-blue-500 text-white" : "hover:bg-zinc-100 dark:hover:bg-zinc-700"}
              `}
            >
              <div className="font-medium">
                {item.display_name || item.name}
              </div>
              <div className="text-xs opacity-70">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}