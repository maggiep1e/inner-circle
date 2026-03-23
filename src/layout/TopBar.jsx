import { useState } from "react";
import { useSessionStore } from "../store/sessionStore";
import { useNavigate } from "react-router-dom";
import UserProfile from "../components/UserProfile";

export default function TopBar() {
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);

  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <>
      <div className="flex w-full justify-end p-4 space-x-2 bg-white dark:bg-zinc-800">
        <button onClick={logout} className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">
          Logout
        </button>

        {/* Avatar clickable */}
        <div className="relative">
          <button
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-zinc-600 hover:ring-2 hover:ring-blue-500 transition"
            onClick={() => setShowProfile(true)}
          >
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">
                {user.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </button>
        </div>
      </div>

      {showProfile && (
        <UserProfile
          userData={user}
          onEdit={() => navigate("/user")}
          onDone={() => setShowProfile(false)}
        />
      )}
    </>
  );
}