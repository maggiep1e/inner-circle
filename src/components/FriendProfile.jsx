
export default function FriendProfile({ friend, userId, onEdit, onDone }) {
  const otherUser = friend.requester.id === userId ? friend.receiver : friend.requester;
  const username = otherUser.username?.toLowerCase().replace(/[^a-z0-9]/g, "") || "unknown";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="max-w-2xl w-full mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="h-32 w-full" style={{ backgroundColor: otherUser.banner || "#888" }} />

        <div className="p-6 relative">
          <div className="absolute -top-12 left-6">
            {otherUser.avatar ? (
              <img
                src={otherUser.avatar}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                alt="avatar"
              />
            ) : (
              <div
                style={{ backgroundColor: otherUser.banner || "#888" }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white border-4 border-white"
              >
                {otherUser.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            {onEdit && (
              <button
                onClick={onEdit}
                className="border px-4 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                Edit
              </button>
            )}
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold">{otherUser.display_name || otherUser.username}</h2>
            <p className="text-gray-500">@{username}</p>
          </div>

          {otherUser.bio ? (
            <div className="mt-4">
              <p>{otherUser.bio} </p>
            </div>
          ) : (
            <p className="text-gray-400 mt-4">No bio yet.</p>
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