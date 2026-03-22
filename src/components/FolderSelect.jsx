export default function FolderSelect({ folders, setFolder }) {

  return (
    <select
      onChange={(e) => setFolder(e.target.value)}
      className="bg-zinc-200 dark:bg-zinc-700 px-3 py-2 rounded"
    >
      <option value="">All folders</option>

      {folders.map((f) => (
        <option key={f}>{f}</option>
      ))}

    </select>
  );

}