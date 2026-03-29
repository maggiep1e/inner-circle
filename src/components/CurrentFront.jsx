import Card from "./Card";
import { useSystemStore } from "../store/systemStore";
import { useState } from "react";
import SwitchFrontModal from "./SwitchFrontModal";

export default function CurrentFront() {
  const members = useSystemStore((s) => s.members);
  const currentFront = useSystemStore((s) => s.currentFront || []);
  const systemId = useSystemStore((s) => s.currentSystem?.id || s.systems[0]?.id);
  const removeFromFront = useSystemStore((s) => s.removeFromFront);

  const [open, setOpen] = useState(false);

  const currentMembers = members.filter((m) =>
    currentFront.includes(m.id)
  );

  return (
    <>
      <Card>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">CURRENT FRONT</h2>

            <button
              onClick={() => setOpen(true)}
              className="px-3 py-1 text-sm rounded-full bg-black text-white hover:opacity-80"
            >
              + Add
            </button>
          </div>
          {currentMembers.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="relative flex flex-col items-center w-20 group"
                >
                  <button
                    onClick={() => removeFromFront(member.id)}
                    className="absolute -top-2 -right-2 hidden group-hover:flex w-5 h-5 rounded-full bg-red-500 text-white"
                  >
                    X
                  </button>

                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-black dark:border-white">
                    {member?.avatar ? (
                      <img
                        src={member.avatar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold">
                        {member.display_name?.[0] ||
                          member.name?.[0] ||
                          "?"}
                      </div>
                    )}
                  </div>

                  <span className="text-xs mt-2 truncate w-full text-center">
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
                className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white"
              >
                Set Current Front
              </button>
            </div>
          )}
        </div>
      </Card>

      {open && systemId && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-[420px]">
            <SwitchFrontModal onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}