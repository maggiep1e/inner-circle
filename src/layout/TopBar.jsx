import { useEffect, useState } from "react";
import { useSessionStore } from "../store/sessionStore";
import { useProfileStore } from "../store/profileStore";
import { useNavigate } from "react-router-dom";
import UserProfile from "../components/UserProfile";

export default function TopBar() {
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);
  const { loadProfile, profile, loading } = useProfileStore();
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (!user) return null;

  if (loading || !profile) return <div className="p-4">Loading profile...</div>;

  return (
    <>
      <div className="flex w-full justify-end p-4 space-x-2 bg-white dark:bg-zinc-800">
        <button
          onClick={logout}
          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </button>

        <div className="relative">
          <button
            className="w-18 h-14 rounded-full overflow-hidden border-0 p-0 hover:ring-2 hover:ring-blue-500 transition"
            onClick={() => setShowProfile(true)}
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt="avatar"
                className="w-full h-full rounded-full object-cover overflow-hidden"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">
                {profile.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </button>
        </div>
      </div>

      {showProfile && (
        <UserProfile
          onEdit={() => navigate("/user")}
          onDone={() => setShowProfile(false)}
        />
      )}
    </>
  );
}