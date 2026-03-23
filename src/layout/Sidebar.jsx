import { Link, useLocation } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";
import { useSystemStore } from "../store/systemStore";

export default function Sidebar() {
  const user = useSessionStore((s) => s.user);
  const systems = useSystemStore((s) => s.systems);
  const location = useLocation();

  if (!user) return null;
  const userId = user.id;

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/systems", label: "Systems" },
    { to: "/folders", label: "Folders" },
    { to: "/members", label: "Members" },
    { to: "/friends", label: "Friends" },
    { to: "/system-journal", label: "System Journal" },
    { to: "/member-journal", label: "Member Journals" },
    { to: "/import", label: "Import" },
    { to: "/user", label: "User Settings" },
  ];

  return (
    <div className="w-64 p-4 flex flex-col gap-3 border-r-4 border-zinc-600">
      <h1 className="text-xl font-bold p-6">INNER CIRCLE</h1>

      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`px-3 py-2 rounded ${
            location.pathname === link.to
              ? "bg-blue-500 text-white"
              : "bg-zinc-200 dark:bg-zinc-700"
          }`}
        >
          {link.label}
        </Link>
      ))}

      {systems.length === 0 && (
        <div className="text-gray-400 mt-4 px-3 text-sm">
          You have no systems yet
        </div>
      )}
    </div>
  );
}