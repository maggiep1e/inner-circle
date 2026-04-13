import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSystemStore } from "../store/systemStore";
import MemberForm from "../components/MemberForm";

import { createMemberJournal, searchMemberJournal } from "../api/journals";
import Card from "../components/Card";

export default function MemberView() {
  const { systemId, memberId } = useParams();
  const navigate = useNavigate();

  const members = useSystemStore((s) => s.members);
  const loadMembers = useSystemStore((s) => s.loadMembers);
  const updateMember = useSystemStore((s) => s.updateMember);

  const [member, setMember] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (systemId) loadMembers(systemId);
  }, [systemId]);

  useEffect(() => {
    const found = members.find((m) => m._id === memberId || m.id === memberId);
    setMember(found || null);
  }, [members, memberId]);

  useEffect(() => {
    if (!memberId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await searchMemberJournal(memberId);
        setEntries(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [memberId]);



  const handleSave = async (form) => {
    await updateMember(memberId, form);
  };

  const submitJournal = async () => {
    if (!title && !content) return;

    await createMemberJournal({
    system_id: systemId,
      author_member_id: memberId,
      title,
      content,
      tagged_members: [],
      links: [],
    });

    setTitle("");
    setContent("");

    const updated = await searchMemberJournal(memberId);
    setEntries(updated || []);
  };



  if (!member) {
    return <div className="p-6">Loading member...</div>;
  }


  
  return (
      <div className="md:p-6 md:w-1/2 space-y-8">

        <button onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1 className="text-2xl font-bold">
          {member.display_name || member.name}
        </h1>


        <Card>
          <h2 className="font-semibold">Profile</h2>

          <MemberForm
            initialData={member}
            onSubmit={handleSave}
          />
        </Card>


        <Card>

          <h2 className="font-semibold">Journal</h2>


          <div className="space-y-2">
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <textarea
              placeholder="Write entry..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border p-2 rounded w-full h-32"
            />

            <button
              onClick={submitJournal}
              className="border px-4 py-2 rounded"
            >
              Add Entry
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {loading ? (
              <div>Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-gray-400">No entries yet</div>
            ) : (
              entries.map((e) => (
                <div key={e._id || e.id} className="border p-3 rounded">
                  <div className="font-bold">{e.title}</div>
                  <div className="text-sm opacity-70">
                    {e.content}
                  </div>
                </div>
              ))
            )}
          </div>

        </Card>

      </div>
  );
}