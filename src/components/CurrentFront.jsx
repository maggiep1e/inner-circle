import Card from "./Card";
import { useSystemStore } from "../store/systemStore";
import { useState, useEffect } from "react";
import SwitchFrontModal from "./SwitchFrontModal";

export default function CurrentFront() {
  const members = useSystemStore((s) => s.members);
  const currentFront = useSystemStore((s) => s.currentFront || []);
  const systemId = useSystemStore((s) => s.systemId);
  const loadMembers = useSystemStore((s) => s.loadMembers);
  const loadCurrentFront = useSystemStore((s) => s.loadCurrentFront);
  const avatarUrls = useSystemStore((s) => s.memberAvatarUrls);
  const removeFromFront = useSystemStore((s) => s.removeFromFront);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentMembers = members.filter((m) =>
    currentFront.includes(m.id)
  );

  useEffect(() => {
    if (!systemId) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      await loadMembers();
      await loadCurrentFront();
      setLoading(false);
    }

    load();
  }, [systemId]);

  return (
    <>
      <Card>
        <div>

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">CURRENT FRONT</h2>

            <button
              onClick={() => setOpen(true)}
              className="px-3 py-1 text-sm rounded-full bg-black text-white hover:opacity-80 transition"
            >
              + Add
            </button>
          </div>

          {/* CONTENT */}
          {loading ? (
            <p className="text-sm text-gray-500">Loading front...</p>
          ) : currentMembers.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="relative flex flex-col items-center w-20 group"
                >
                  {/* REMOVE BUTTON (hover only) */}
                  <button
                    onClick={() => removeFromFront(member.id)}
                    className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
                    title="Remove from front"
                  >
                    ×
                  </button>

                  {/* AVATAR */}
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-black dark:border-white">
                    {member?.avatar ? (
                      <img
                        src={member?.avatar || "/default.png"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">
                        {member.display_name?.[0]?.toUpperCase() ||
                          member.name?.[0]?.toUpperCase() ||
                          "?"}
                      </div>
                    )}
                  </div>

                  <span className="text-xs mt-2 text-center truncate w-full">
                    {member.display_name || member.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">
                Nobody is fronting right now
              </p>

              <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Set Current Front
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* MODAL */}
      {open && systemId && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[420px]"
          >
            <SwitchFrontModal onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}