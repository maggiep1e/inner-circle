import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import { createMemberJournal, searchMemberJournal } from "../api/journals";

import SearchBar from "../components/SearchBar";

export default function MemberJournal() {

  const members = useSystemStore((s) => s.members);

  const [author, setAuthor] = useState("");
  const [taggedMembers, setTaggedMembers] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [results, setResults] = useState([]);

  async function submit() {

    const token = await getToken();

    const mentions = content.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];

    // Extract [[journal links]]
    const journalLinks = content.match(/\[\[(.*?)\]\]/g)?.map(j => j.slice(2,-2)) || [];

    await createMemberJournal({
    authorMemberId: author,
    taggedMembers: [...taggedMembers, ...mentions],
    linkedJournals: journalLinks,
    title,
    content
    }, token);

    setTitle("");
    setContent("");
  }

  async function search(memberId) {

    const token = await getToken();

    const data = await searchMemberJournal(memberId, token);

    setResults(data);

  }

  return (
<>

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Member Journal
      </h1>

      {/* author select */}
        <SearchBar />
      <select
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select Author</option>

        {members.map(m => (
          <option key={m._id} value={m._id}>
            {m.displayName || m.name}
          </option>
        ))}
      </select>


      {/* tag members */}

      <div className="flex gap-2 flex-wrap">

        {members.map(m => (

          <button
            key={m._id}
            onClick={() =>
              setTaggedMembers(prev =>
                prev.includes(m._id)
                  ? prev.filter(id => id !== m._id)
                  : [...prev, m._id]
              )
            }
            className="border px-2 py-1 rounded"
          >
            {m.displayName || m.name}
          </button>

        ))}

      </div>


      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full"
      />

        <textarea
        placeholder="Write entry... use @memberName or [[Journal Title]]"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 rounded w-full h-40"
        />

      <button
        onClick={submit}
        className="border px-4 py-2 rounded"
      >
        Save Entry
      </button>


      {/* search section */}

      <h2 className="font-bold mt-8">
        Search by Member
      </h2>

      <div className="flex gap-2 flex-wrap">

        {members.map(m => (

          <button
            key={m._id}
            onClick={() => search(m._id)}
            className="border px-2 py-1 rounded"
          >
            {m.displayName || m.name}
          </button>

        ))}

      </div>


      <div className="space-y-3">

        {results.map(entry => (

          <div
            key={entry._id}
            className="border p-3 rounded"
          >

            <h3 className="font-bold">
              {entry.title}
            </h3>

            <p>{entry.content}</p>

          </div>

        ))}

      </div>

    </div>

    </>

  );
}