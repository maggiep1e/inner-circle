import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createFolder } from "../api/folders";
import { useSessionStore } from "../store/sessionStore";
import Card from "../components/Card";

export default function CreateFolder() {
  const { systemId } = useParams();
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user)

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);

    try {
      await createFolder({
        name,
        system_id: systemId,
        user_id: user.id, 
        member_ids: [],
      });

      navigate(-1);
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <>
    <Card>
         <button onClick={() => navigate(-1)}>
                ← Back
        </button>
        <div className="p-6 max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-4">Create Folder</h1>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            className="w-full border p-2 rounded mb-3"
          />

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {loading ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </Card>
    </>
  );
}