import { useState } from "react";

export default function TagEditor({ tags, setTags }) {

  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    if (!tagInput) return;

    setTags([...tags, tagInput]);
    setTagInput("");
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap gap-2">

      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-purple-600 px-2 py-1 rounded cursor-pointer"
          onClick={() => removeTag(tag)}
        >
          {tag}
        </span>
      ))}

      <input
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        placeholder="tag"
        className="bg-zinc-800 px-2 py-1 rounded"
      />

      <button
        onClick={addTag}
        className="bg-purple-600 px-2 rounded"
      >
        +
      </button>

    </div>
  );
}