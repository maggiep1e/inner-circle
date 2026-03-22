import { useState } from "react";
import MemberEditor from "./MemberEditor";
import { useSystemStore } from "../store/systemStore";

export default function MemberCard({ member, onFront }) {

  const [editing, setEditing] = useState(false);

  const currentFront = useSystemStore((s) => s.currentFront);

  return (

    <>
      <div
        className="bg-zinc-700 p-4 rounded-xl flex items-center gap-3 cursor-pointer"
        style={{ borderLeft: `6px solid ${member.color}` }}
        onClick={() => setEditing(true)}
      >

        <div className={`bg-zinc-700 p-4 rounded-xl flex items-center gap-3
        ${currentFront === member.id ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/40" : ""}
        `}>

          {member.avatar ? (
            <img
              src={member.avatar}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              {member.displayName[0]}
            </div>
          )}

        </div>

        <div className="flex-1">

          <h3 className="font-semibold">
            {member.displayName}
          </h3>

          <div className="flex items-center gap-2">

            {member.status === "front" && (
              <span className="text-green-400">●</span>
            )}

            {member.status === "co-front" && (
              <span className="text-yellow-400">●</span>
            )}

          </div>

          <div className="flex gap-2 flex-wrap mt-1">

            {member.tags?.map(tag => (
              <span
                key={tag}
                className="bg-purple-700 text-xs px-2 py-1 rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  updateMember(member.id, {
                    tags: member.tags.filter(t => t !== tag)
                  });
                }}
              >
                {tag}
              </span>
            ))}

            {member.folders?.map(folder => (
              <span
                key={folder}
                className="bg-zinc-700 text-xs px-2 py-1 rounded"
              >
                {folder}
              </span>
            ))}

          </div>

        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFront(member.id);
          }}
          className="bg-purple-600 px-3 py-1 rounded"
        >
          Front
        </button>

        <button
        onClick={(e) => {
          e.stopPropagation();
          const tag = prompt("New tag");

          if (!tag) return;

          updateMember(member.id, {
            tags: [...member.tags, tag]
          });
        }}
        className="text-xs bg-zinc-700 px-2 rounded"
      >
      +
      </button>

      </div>

      {editing && (
        <MemberEditor
          member={member}
          close={() => setEditing(false)}
        />
      )}

    </>
  );

}