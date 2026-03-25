import { useEffect, useState } from "react";
import { useFriendsStore } from "../store/friendStore";
import { useSessionStore } from "../store/sessionStore";
import SearchBar from "../components/SearchBar";
import FriendProfile from "../components/FriendProfile";
import FriendEditor from "../components/FriendEditor";
import { acceptRequest, rejectRequest } from "../api/friends";

export default function Friends({ userId }) {
  const profile = useSessionStore((s) => s.profile);

  const friends = useFriendsStore((s) => s.friends);
  const requests = useFriendsStore((s) => s.requests);
  const loadFriends = useFriendsStore((s) => s.loadFriends);
  const loadRequests = useFriendsStore((s) => s.loadRequests);

  const [selected, setSelected] = useState(null);
  const [modalMode, setModalMode] = useState("closed"); 
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    setLoadingFriends(true);
    loadFriends(profile.id)
      .catch(console.error)
      .finally(() => setLoadingFriends(false));
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;

    setLoadingRequests(true);
    loadRequests(profile.id)
      .catch(console.error)
      .finally(() => setLoadingRequests(false));
  }, [profile?.id]);

  if (loadingFriends || loadingRequests)
    return <div>Loading friends...</div>;

  return (
    <div className="flex gap-6">
      <div className="w-64 space-y-4 overflow-y-auto max-h-screen">
        <div className="flex flex-col mb-4">
          <h1 className="text-xl font-bold">Friends</h1>
        </div>
        <SearchBar />
        {requests.length > 0 && (
          <div className="p-2 border rounded bg-yellow-50 dark:bg-yellow-900">
            <h3 className="font-semibold mb-2">Friend Requests</h3>
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-1 mb-1 border rounded bg-white dark:bg-zinc-800"
              >
                <span>{r.requester.username}</span>
                <div className="flex gap-1">
                  <button
                    onClick={async () => {
                      await acceptRequest(r.id);
                      await loadFriends(profile.id);
                      await loadRequests(profile.id);
                    }}
                    className="px-2 py-0.5 bg-green-500 text-white rounded text-xs"
                  >
                    Accept
                  </button>
                  <button
                    onClick={async () => {
                      await rejectRequest(r.id);
                      await loadRequests(profile.id);
                    }}
                    className="px-2 py-0.5 bg-red-500 text-white rounded text-xs"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div>
          <h3 className="font-semibold mb-2">Friends</h3>
          {friends.length === 0 ? (
            <div className="text-gray-400 italic">No friends yet. Add some!</div>
          ) : (
            friends.map((f) => {
              const otherUser = f.requester.id === profile.id ? f.receiver : f.requester;

              return (
                <div
                  key={f.id}
                  className="border p-2 rounded bg-gray-50 dark:bg-zinc-800"
                >
                  <div className="font-semibold">{otherUser.username}</div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setSelected(f);
                        setModalMode("view");
                      }}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-1"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelected(f);
                        setModalMode("edit");
                      }}
                      className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex-1"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex-1">
        {selected ? (
          <>
            {modalMode === "view" && (
              <FriendProfile
                friend={selected}
                profileItemId={profile.id}
                onEdit={() => setModalMode("edit")}
                onDone={() => setModalMode("closed")}
              />
            )}
            {modalMode === "edit" && (
              <FriendEditor
                friend={selected}
                profileItemId={profile.id}
                onDone={() => setModalMode("view")}
              />
            )}
          </>
        ) : (
          <div className="text-gray-400 italic">
            Select a friend to view or edit
          </div>
        )}
      </div>
    </div>
  );
}