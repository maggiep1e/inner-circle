export default function TagSelector({ tags, setTags }) {

  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {tags.map((t) => (
        <span key={t} className="bg-purple-700 px-2 py-1 rounded">
          {t}
        </span>
      ))}

      <button
        onClick={() => addTag(prompt("New tag"))}
        className="bg-zinc-700 px-2 rounded"
      >
        +
      </button>
    </div>
  );
}