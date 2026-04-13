import Card from "./Card";
import { useSystemStore } from "../store/systemStore";
import { useState, useEffect } from "react";
import SwitchFrontModal from "./SwitchFrontModal";
import { resolveAvatar } from "../api/avatar";
import { getFronts, removeFromFront, updateFrontStatus } from "../api/front";
import RemoveCustomFront from "./RemoveCustomFront";

export default function CurrentFront() {
  const systems = useSystemStore((s) => s.systems);
  const members = useSystemStore((s) => s.members);
  const [frontData, setFrontData] = useState([]);
  const [openRemove, setOpenRemove] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const currentSystem = useSystemStore((s) => s.currentSystem);


  const [open, setOpen] = useState(false);
  const [selectedSystemId, setSelectedSystemId] = useState("all");

  useEffect(() => {
    async function load() {
      if (selectedSystemId === "all") {
        const all = await Promise.all(
          systems.map((sys) => getFronts(sys.id))
        );

        setFrontData(all.flat());
      } else if (selectedSystemId) {
        const data = await getFronts(selectedSystemId);
        setFrontData(data);
      }
    }

    if (systems?.length) load();
  }, [selectedSystemId, systems]);

  
  const systemId =
    selectedSystemId === "all"
      ? null
      : selectedSystemId;

  const filteredMembers =
    selectedSystemId === "all"
      ? members
      : members.filter((m) => m.system_id === selectedSystemId);

  const currentMembers = filteredMembers
    .map((m) => {
      const front = frontData.find((f) => f.member_id === m.id);
      if (!front) return null;

      return {
        ...m,
        front_status: front.front_status || null,
      };
    })
    .filter(Boolean);

  const handleRemove = async (member) => {
    if (!member) return;

    if (member.is_temporary) {
      setMemberToRemove(member);
    setOpenRemove(true);}
      else {
        await removeFromFront(member.id);

        setFrontData((prev) =>
          prev.filter((f) => f.member_id !== member.id)
        );
      }
  };

  return (
    <>
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Current Front</h2>
              <p className="text-sm ">{currentSystem?.name || "Unnamed System"}</p>
            <button
              onClick={() => setOpen(true)}
              className="px-3 py-1 text-sm rounded-full bg-black text-white hover:opacity-80"
            >
              + Add
            </button>
          </div>

          {currentMembers.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {currentMembers.map((member) => {
                const avatarUrl = resolveAvatar(member.avatar);

                return (
                  <div
                    key={member.id}
                    className="relative flex flex-col items-center w-20 group"
                  >

                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-black dark:border-white">
                      <img
                        src={avatarUrl}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <span className="text-xs mt-2 truncate w-full text-center">
                      {member.display_name || member.name}
                    </span>

                    <input
                      type="text"
                      placeholder="Front Status"
                      value={member.front_status || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        setFrontData((prev) =>
                          prev.map((f) =>
                            f.member_id === member.id
                              ? { ...f, front_status: value }
                              : f
                          )
                        );

                        updateFrontStatus(systemId, member.id, value);
                      }}
                      className="w-full border p-1 rounded mt-2 text-xs"
                    />
                    <button
                      onClick={() => {
                        handleRemove(member);
                      }}
                      className="my-2"                  
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
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
            <SwitchFrontModal
              onClose={async () => {
                setOpen(false);

                if (!systemId) return;
                const data = await getFronts(systemId);
                setFrontData(data);
              }}
            />
          </div>
        </div>
      )}

      {openRemove && systemId &&(
        <div
          onClick={() => setOpenRemove(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-[420px]">
            <RemoveCustomFront
              member={memberToRemove}
              systemId={systemId}
              onClose={() => setOpenRemove(false)}
              onRemoved={(id) =>
                setFrontData((prev) =>
                  prev.filter((f) => f.member_id !== id)
                )
              }
            />
          </div>
        </div>
      )}
    </>
  );
}