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
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="relative flex w-full items-center justify-end px-6 py-4 md:py-3 gap-3 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">

        {/* DESKTOP BUTTONS */}
        <div className="hidden md:flex items-center gap-3">

          <button
            onClick={() => navigate("/")}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition"
          >
            Home
          </button>


            {avatarUrl ? (
              <img
                src={avatarUrl}
                onClick={() => setShowProfile(true)}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover shadow"
              />
            ) : (
              <div onClick={() => setShowProfile(true)} className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">
                {profile?.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}

          <button
            onClick={logout}
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* MOBILE HAMBURGER (styled like button) */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden transition flex items-center justify-center"
        >
          <div className="flex flex-col gap-[3px]">
            <span className="w-5 h-0.5 bg-black dark:bg-white"></span>
            <span className="w-5 h-0.5 bg-black dark:bg-white"></span>
            <span className="w-5 h-0.5 bg-black dark:bg-white"></span>
          </div>
        </button>

        {/* DROPDOWN (aligned right, same style) */}
        {menuOpen && (
          <div className="absolute top-14 right-6 w-40 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded shadow-md p-2 flex flex-col gap-1 md:hidden z-50">

            <button
              onClick={() => {
                navigate("/");
                setMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition"
            >
              Home
            </button>

            <button
              onClick={() => {
                navigate("/user");
                setMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition"
            >
              Profile
            </button>

            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}