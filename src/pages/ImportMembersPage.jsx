import { useState } from "react";
import * as XLSX from "xlsx";
import { useSystemStore } from "../store/systemStore";
import {
  readExcelFile,
  fetchPluralkitMembers,
  fetchSimplyPluralMembers,
  fetchOctoconMembers,
} from "../utils/importHelpers";

export default function ImportMembersPage() {
  const systemId = useSystemStore((s) => s.systemId);
  const addMember = useSystemStore((s) => s.addMember);
  const existingMembers = useSystemStore((s) => s.members);

  const [source, setSource] = useState("");
  const [file, setFile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [importedMembers, setImportedMembers] = useState([]);
  const [skippedMembers, setSkippedMembers] = useState([]);

  const normalizeName = (name) => name?.trim().toLowerCase();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleImport = async () => {
    if (!systemId) return alert("No system selected");
    setLoading(true);
    setImportedMembers([]);
    setSkippedMembers([]);
    setProgress({ completed: 0, total: 0 });

    try {
      let members = [];

      if (source === "excel" && file) {
        members = await readExcelFile(file);
      } else if (source === "pluralkit") {
        members = await fetchPluralkitMembers(apiKey);
      } else if (source === "simplyplural") {
        members = await fetchSimplyPluralMembers(apiKey);
      } else if (source === "octocon") {
        members = await fetchOctoconMembers(apiKey);
      }

      if (!members.length) throw new Error("No members found");

      setProgress({ completed: 0, total: members.length });

      const added = [];
      const skipped = [];
      const existingNames = existingMembers.map((m) => normalizeName(m.name || m.displayName));

      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const norm = normalizeName(m.name || m.displayName);
        if (existingNames.includes(norm)) {
          skipped.push(m);
        } else {
          try {
            const newMember = await addMember({
            name: m.name,
            displayName: m.displayName,
            folders: m.folders || [],

            });
            added.push(newMember);
          } catch (err) {
            console.error(`Failed to add member ${m.name}:`, err);
            skipped.push(m);
          }
        }
        setProgress({ completed: i + 1, total: members.length });
      }

      setImportedMembers(added);
      setSkippedMembers(skipped);
      alert(`Added ${added.length}, skipped ${skipped.length} duplicate(s)`);
    } catch (err) {
      console.error(err);
      alert("Failed to import members");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Import Members</h1>

      <div className="flex flex-col gap-2">
        <label>Choose Source:</label>
        <select
          className="border p-2 rounded"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">Select Source</option>
          <option value="excel">Excel / CSV</option>
          <option value="pluralkit">PluralKit</option>
          <option value="simplyplural">Simply Plural</option>
          <option value="octocon">Octocon</option>
        </select>
      </div>

      {source === "excel" && (
        <div className="flex flex-col gap-2">
          <label>Upload Excel/CSV File:</label>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
        </div>
      )}

      {(source === "pluralkit" || source === "simplyplural" || source === "octocon") && (
        <div className="flex flex-col gap-2">
          <label>API Key / Token:</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={
          loading ||
          !source ||
          (source === "excel" && !file) ||
          (source !== "excel" && !apiKey)
        }
        className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
      >
        {loading ? "Importing..." : "Import Members"}
      </button>

      {loading && progress.total > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-300 rounded h-4 overflow-hidden">
            <div
              className="bg-green-500 h-4 transition-all"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm mt-1">{`Processed ${progress.completed} of ${progress.total} members`}</p>
        </div>
      )}

      {importedMembers.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold">Added Members:</h2>
          <ul className="list-disc pl-6">
            {importedMembers.map((m) => (
              <li key={m.id}>{m.displayName || m.name}</li>
            ))}
          </ul>
        </div>
      )}

      {skippedMembers.length > 0 && (
        <div className="mt-4 text-yellow-600">
          <h2 className="font-semibold">Skipped Duplicates:</h2>
          <ul className="list-disc pl-6">
            {skippedMembers.map((m, i) => (
              <li key={i}>{m.displayName || m.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}