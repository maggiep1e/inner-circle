import { useSystemStore } from "../store/systemStore";

export default function MemberProfile({ member, onDone }) {
  const avatarUrls = useSystemStore((s) => s.avatarUrls);
  const allFolders = useSystemStore((s) => s.systemFolders);

  if (!member) return null;

  const folderIds = (member.folders || []).map(String);

  const selectedFolders = (allFolders || []).filter((f) =>
    folderIds.includes(String(f.id))
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center space-y-4">

        <img
          src={avatarUrls[member.id] || "/default-avatar.png"}
          alt={member.name}
          className="w-32 h-32 rounded-full object-cover shadow-lg"
        />

        <h2 className="text-2xl font-bold text-center">
          {member.name}
        </h2>

        {member.tags?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {member.tags.map((t) => (
              <span
                key={t}
                className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}


        {selectedFolders.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {selectedFolders.map((f) => (
              <span
                key={f.id}
                className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full"
              >
                {f.name}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={onDone}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}