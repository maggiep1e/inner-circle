import { useSystemStore } from "../store/systemStore";

export default function FrontTracker() {

  const members = useSystemStore((s) => s.members);
  const currentFront = useSystemStore((s) => s.currentFront);

  const member = members.find((m) => m.id === currentFront);

  return (

    <div className="bg-zinc-800 p-6 rounded-xl">

      <h2 className="text-lg mb-2">Current Front</h2>

      {member ? (
        <div className="text-xl">{member.displayName}</div>
      ) : (
        <div className="opacity-60">Nobody fronting</div>
      )}

    </div>

  );

}