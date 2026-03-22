import { useState } from "react";

export default function SearchBar({ onSearch }) {

  const [value, setValue] = useState("");

  return (

    <input
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        setValue(v);
        onSearch(v);
      }}
      placeholder="Search..."
      className="bg-zinc-200 dark:bg-zinc-700 px-3 py-2 rounded w-full"
    />

  );
}