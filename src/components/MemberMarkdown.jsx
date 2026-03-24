import { useState } from "react";
import MemberMarkdown from "./MemberMarkdown";
import { useSystemStore } from "../store/systemStore";

export default function MemberEditor({ memberID, onDone }) {

  const updateMember = useSystemStore((s) => s.updateMember);

  const [description, setDescription] = useState("");

  function save() {

    updateMember(memberID, { description });

    onDone();

  }

  return (

    <div className="border rounded-xl p-6 space-y-4">

      <h2 className="text-xl font-bold">
        Edit Member
      </h2>

      <div className="grid grid-cols-2 gap-6">

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded h-64"
        />

        <div className="border p-4 rounded overflow-auto">
          <MemberMarkdown text={description} />
        </div>

      </div>

      <button
        onClick={save}
        className="border px-4 py-2 rounded"
      >
        Save
      </button>

    </div>

  );
}