import Card from "./Card";
import { useSystemStore } from "../store/systemStore";
import { useState, useEffect } from "react";
import SwitchFrontModal from "./SwitchFrontModal";

export default function CurrentFront() {
  const members = useSystemStore((s) => s.members); // this always tracks current system
  const systemId = useSystemStore((s) => s.systemId);
  const loadMembers = useSystemStore((s) => s.loadMembers);
const currentFront = useSystemStore((s) => s.currentFront);
const loadCurrentFront = useSystemStore((s) => s.loadCurrentFront);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const onClose = () => setOpen(false);

  const currentMembers = members.filter((m) =>
  currentFront.includes(m.id)
);

  // Load members automatically if a system exists
useEffect(() => {
  if (!systemId) {
    setLoading(false);
    return;
  }

  async function load() {
    setLoading(true);
    await loadMembers();
    await loadCurrentFront(); // 🔥 ADD THIS
    setLoading(false);
  }

  load();
}, [systemId]);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* CARD */}
      <Card>
        <div className="border-4 border-black rounded-3xl p-6">
          <h2 className="font-bold mb-4">CURRENT FRONT:</h2>

          <div className="flex gap-6 items-center">
            {currentMembers.length > 0 ? (
              <div className="flex gap-4 flex-wrap">
                {currentMembers.map((member) => (
                  <div key={member.id} className="flex flex-col items-center">
                    <div className="relative">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold">
                          {member.display_name?.[0]?.toUpperCase() ||
                            member.name?.[0]?.toUpperCase() ||
                            "?"}
                        </span>
                      )}
                    </div>
                    <span className="text-sm mt-2">
                      {member.display_name || member.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-500">Nobody fronting</span>
            )}

            {/* + button only works if a system exists */}

              <button
                onClick={() => setOpen(true)}
                className="text-4xl font-bold"
              >
                +
              </button>
          </div>
        </div>
      </Card>

      {/* MODAL */}
      {open && systemId && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-[400px]">
            <SwitchFrontModal onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
}