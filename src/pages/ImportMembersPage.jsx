import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import {
  importFromExcel,
  importFromPluralKit,
} from "../utils/memberImportAdapters";
import { useParams, useNavigate } from "react-router-dom";
import { importMembers } from "../api/members";

export default function ImportMembersPage() {
  const { systemId } = useParams();
  const navigate = useNavigate();

  const existingMembers = useSystemStore((s) => s.members);
  const system = useSystemStore((s) => s.currentSystem)

  const [step, setStep] = useState(1);
  const [source, setSource] = useState("");
  const [file, setFile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [rawMembers, setRawMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [results, setResults] = useState({
    added: [],
    skipped: [],
  });


  const loadData = async () => {
    setLoading(true);

    try {
      let members = [];

      if (source === "excel") {
        members = await importFromExcel(file);
      }

      if (source === "pluralkit") {
        members = await importFromPluralKit(apiKey);
      }

      setRawMembers(members);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };


  const runImport = async () => {
    setStep(3);
    setLoading(true);
    setProgress({ completed: 0, total: rawMembers.length });
    console.log('uploading')

    try {
      const { added, skipped } = await importMembers({
        systemId,
        rawMembers,
        existingMembers,
        onProgress: setProgress,
      });

      setResults({ added, skipped });
      setStep(4);
    } catch (err) {
      console.error(err);
      alert(err.message);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      <div className="text-sm text-zinc-500">
        Importing into system: <b>{system.name}</b>
      </div>

      <div className="flex gap-2 text-sm">
        {["Source", "Preview", "Importing", "Results"].map((s, i) => (
          <div
            key={s}
            className={`px-3 py-1 rounded ${
              step === i + 1 ? "bg-blue-500 text-white" : "bg-zinc-200"
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <select
            className="border p-2 rounded w-full"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Select Source</option>
            <option value="excel">Excel / CSV</option>
            <option value="pluralkit">PluralKit</option>
          </select>

          {source === "excel" && (
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
          )}

          {source !== "excel" && source && (
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Token"
              className="border p-2 rounded w-full"
            />
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Load Preview
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold">
            Preview ({rawMembers.length} members)
          </h2>

          <div className="max-h-80 overflow-y-auto border rounded p-2">
            {rawMembers.map((m, i) => (
              <div key={i} className="border-b py-1">
                {m.display_name || m.name}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Back
            </button>

            <button
              onClick={runImport}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Start Import
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="w-full bg-gray-200 h-4 rounded overflow-hidden">
            <div
              className="bg-green-500 h-4 transition-all"
              style={{
                width: progress.total
                  ? `${(progress.completed / progress.total) * 100}%`
                  : "0%",
              }}
            />
          </div>

          <p className="text-sm mt-2">
            Importing {progress.completed} / {progress.total}
          </p>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-green-600">
            Added: {results.added.length}
          </h2>

          <h2 className="font-semibold text-yellow-600">
            Skipped: {results.skipped.length}
          </h2>

          <button
            onClick={() => {
              setStep(1);
              setRawMembers([]);
              setResults({ added: [], skipped: [] });
              setApiKey("");
              setFile(null);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Import More
          </button>
        </div>
      )}
    </div>
  );
}