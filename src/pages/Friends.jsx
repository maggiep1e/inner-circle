import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useFriendsStore } from "../store/friendStore";
import Auth from "./auth";
import SearchBar from "../components/SearchBar";

export default function Friends() {

  const { user } = useUser();
  const { getToken } = useAuth();

  const friends = useFriendsStore((s) => s.friends);
  const loadFriends = useFriendsStore((s) => s.loadFriends);

  useEffect(() => {

    async function load() {

      const token = await getToken();

      await loadFriends(user.id, token);

    }

    if (user) load();

  }, [user]);

  return (
    <>
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Friends
      </h1>
      <SearchBar />
      {friends.map((f) => (

        <div
          key={f._id}
          className="border p-3 rounded"
        >
          {f.requesterId === user.id
            ? f.receiverId
            : f.requesterId}
        </div>

      ))}

    </div>
    </>

  );

}