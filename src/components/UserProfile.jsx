// src/components/UserProfile.jsx
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";
import { useProfileStore } from "../store/profileStore";

export default function UserProfile({ onClose }) {
  const profile = useProfileStore((s) => s.profile);
  const avatarUrl = useProfileStore((s) => s.profileAvatarUrl);

  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md space-y-4">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl || "/default-avatar.png"}
            className="w-14 h-14 rounded-full object-cover"
          />

          <div>
            <div className="font-semibold">
              {profile?.display_name || "User"}
            </div>

            <div className="text-xs text-gray-500">
              {profile?.username || ""}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {profile?.description || "No bio yet."}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between pt-4 border-t">

          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              navigate("/user");
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Go to Settings
          </button>

        </div>
      </div>
    </div>
  );
}