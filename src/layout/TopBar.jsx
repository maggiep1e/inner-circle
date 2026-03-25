// src/layout/TopBar.jsx
import { useEffect, useState } from "react";
import { useSessionStore } from "../store/sessionStore";
import UserProfile from "../components/UserProfile"

export default function TopBar() {
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const avatarUrl = useSessionStore((s) => s.profileAvatarUrl);
  const logout = useSessionStore((s) => s.logout);

  const [showProfilePage, setShowProfilePage] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="flex w-full justify-end p-4 space-x-2 bg-white dark:bg-zinc-800">
        {/* Logout button */}
        <button
          onClick={logout}
          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </button>

        {/* Profile avatar */}
        <div className="relative">
          <button
            className="w-12 h-12 rounded-full overflow-hidden border-0 p-0 hover:ring-2 hover:ring-blue-500 transition"
            onClick={() => setShowProfilePage(true)}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">
                {profile?.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Full-page profile */}
      {showProfilePage && (
        <UserProfile
          onDone={() => setShowProfilePage(false)}
        />
      )}
    </>
  );
}