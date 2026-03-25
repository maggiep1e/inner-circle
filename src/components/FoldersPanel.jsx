import Card from "./Card";
import { useSystemStore } from "../store/systemStore";
import { useState, useEffect } from "react";
import SwitchFolderModal from "./SwitchFolderModal";
import { Link } from "react-router-dom";

export default function FoldersPanel() {
  const folders = useSystemStore((s) => s.systemFolders);
  const systemId = useSystemStore((s) => s.systemId);
  const loadFolders = useSystemStore((s) => s.loadFolders);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const onClose = () => setOpen(false);

  useEffect(() => {
    if (!systemId) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      await loadFolders();
      setLoading(false);
    }
    load();
  }, [systemId, loadFolders]);

  return (
    <>
      <Card>
        <div className="border-4 border-black rounded-3xl p-6">
          <h2 className="font-bold mb-4 ">Folders</h2>

          {loading ? (
            <div>Loading folders...</div>
          ) : (
            <div className="flex gap-2 align-center">
              {folders.length <= 0 ? (
                <span className="text-gray-500">No folders yet</span>
              ) : (
                folders.map((f) => (
                    <Link to={`/folders`} key={f.id}>
                      <button>{f.name}</button>
                    </Link>
                ))
              )}
              <button
            onClick={() => setOpen(true)}
            className="text-xl font-bold m-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            +
          </button>
            </div>
          )}
        </div>
      </Card>

      {open && systemId && (
        <SwitchFolderModal onClose={onClose} />
      )}
    </>
  );
}