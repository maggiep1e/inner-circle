import { useSystemStore } from "../store/systemStore";
import { removeFromFront } from "../api/front";
import { supabase } from "../lib/supabase";

export default function RemoveCustomFront({
  member,
  systemId,
  onClose,
  onRemoved,
}) {
  const hydrateSystem = useSystemStore((s) => s.hydrateSystem);

  const handleRemoveMember = async () => {
    if (!member || !systemId) return;

    await removeFromFront(systemId, member.id);

    if (member.is_temporary) {
      const confirmDelete = window.confirm(
        "This is a temporary member. Delete permanently?"
      );

      if (confirmDelete) {
        await supabase
          .from("members")
          .delete()
          .eq("id", member.id);

        await hydrateSystem(systemId);
      }
    }

    onRemoved?.(member.id);
    onClose();
  };

  const handleSaveTemporary = async () => {
    if (!member || !systemId) return;

    await removeFromFront(systemId, member.id);

    await supabase
      .from("members")
      .update({ is_temporary: false })
      .eq("id", member.id);

    await hydrateSystem(systemId);

    onRemoved?.(member.id);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl w-[320px]">
      <h2 className="font-bold mb-3">Remove from Front</h2>

      <p className="text-sm mb-4">
        {member.display_name || member.name}
      </p>

      <div className="flex flex-col gap-2">
            <button
              onClick={handleSaveTemporary}
              className="py-2"
            >
              Save as Permanent Member
            </button>

            <button
              onClick={handleRemoveMember}
              className="py-2"
            >
              Delete Temporary Member
            </button>

        <button
          onClick={onClose}
          className="py-2 rounded bg-zinc-300 dark:bg-zinc-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}