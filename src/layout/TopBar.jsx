import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";
import { useProfileStore } from "../store/profileStore";
import UserProfile from "../components/UserProfile";

export default function TopBar() {
  const user = useSessionStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const avatarUrl = useProfileStore((s) => s.profileAvatarUrl);
  const logout = useSessionStore((s) => s.logout);

  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="flex w-full items-center justify-end h-16 px-6 py-10 gap-3 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">

        {/* HOME BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition"
        >
          Home
        </button>

        {/* AVATAR */}
        <button
          onClick={() => setShowProfile(true)}
          className="h-12 w-12 rounded-full overflow-hidden border hover:ring-2 hover:ring-blue-500 transition"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">
              {profile?.display_name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </button>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* PROFILE MODAL */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}