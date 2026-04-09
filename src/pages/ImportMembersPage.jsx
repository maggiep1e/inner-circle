import { useState } from "react";
import { useSystemStore } from "../store/systemStore";
import {
  importFromExcel,
  importFromPluralKit,
  importFromJson,
  importFromSimplyPlural
} from "../utils/memberImportAdapters";
import {
  createImportJob,
  startImportJob,
  getImportJob,
} from "../api/importJobs";
import { useParams } from "react-router-dom";
import Fuse from "fuse.js";
import { useSessionStore } from "../store/sessionStore";
import { uploadFileFromUrl } from "../api/avatar";

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function createMemberMatcher(existingMembers) {
  return new Fuse(existingMembers, {
    keys: ["name", "display_name"],
    threshold: 0.2, 
    distance: 50, 
  });
}

export default function ImportMembersPage() {
  const { systemId } = useParams();
  const user = useSessionStore((s) => s.user)
  const userId = user.id

  const existingMembers = useSystemStore((s) => s.members);
  const system = useSystemStore((s) => s.currentSystem);

  const [step, setStep] = useState(1);
  const [source, setSource] = useState("");
  const [file, setFile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [SimplyPluralId, setSimplyPluralId] = useState("")

  const [rawMembers, setRawMembers] = useState([]);
  const [selected, setSelected] = useState({});
  const [decisions, setDecisions] = useState({});

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [results, setResults] = useState({
    added: [],
    updated: [],
    skipped: [],
  });

  const loadData = async () => {
    setLoading(true);

    try {
      let members = [];

      if (source === "excel") {
        members = await importFromExcel(file);
      }

      if (source === "json") {
        members = await importFromJson(file);
      }

      if (source === "pluralkit") {
        members = await importFromPluralKit(apiKey);
      }

      if (source === "simplyplural") {
        members = await importFromSimplyPlural(apiKey, SimplyPluralId);
      }

      const fuse = createMemberMatcher(existingMembers);

      const initialSelected = {};
      const initialDecisions = {};


      members.forEach((m, i) => {
        const query = normalize(m.display_name || m.name);
        const result = fuse.search(query);
        const match = result.length ? result[0].item : null;

        initialSelected[i] = true;

        initialDecisions[i] = match
          ? { type: "skip", match }
          : { type: "add", match: null };
      });

      setRawMembers(members)
      setSelected(initialSelected);
      setDecisions(initialDecisions);

      setStep(2);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

    const prepareMember = async (member) => {
    let avatar = member.avatar_raw || member.avatar || null;

    if (avatar && typeof avatar === "string" && avatar.startsWith("http")) {
      try {
        const uploaded = await uploadFileFromUrl(avatar, "avatar");
        avatar = uploaded?.path || null;
      } catch (err) {
        console.warn("Avatar upload failed:", err);
      }
    }

    return {
      ...member,
      avatar,
    };
  };

  const runImport = async () => {
      setStep(3);
      setLoading(true);
      try {
          const safeUserId = user?.id || userId;

          if (!safeUserId) {
            throw new Error("Not logged in");
          }

          if (!systemId) {
            throw new Error("Missing systemId");
          }

          const toAdd = [];
          const toUpdate = [];

          for (const [i, m] of rawMembers.entries()) {
            if (!selected[i]) continue;

            const decision = decisions[i];
            if (!decision) continue;

            if (decision.type === "add") {
              const prepared = await prepareMember(m);
              toAdd.push(prepared);
            }

            if (decision.type === "update" && decision.match) {
              toUpdate.push({
                existing: decision.match,
                incoming: await prepareMember(m)
              });
            }
          }

        const total = toAdd.length + toUpdate.length;
        setProgress({ completed: 0, total });

        const job = await createImportJob({
          systemId,
          userId: safeUserId,
          toAdd,
          toUpdate,
        });

        if (!job?.id) {
          throw new Error("Job creation failed");
        }

        await startImportJob(job.id);
        startPolling(job.id);
      } catch (err) {
        console.error(err);
        alert(err.message || "Import failed");
        setStep(2);
      } finally {
        setLoading(false);
      }
    };

  const startPolling = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const job = await getImportJob(jobId);

        setProgress({
          completed: job.progress_completed,
          total: job.progress_total,
        });

        if (job.status === "done") {
          clearInterval(interval);

          setResults({
            added: job.result?.added || [],
            updated: job.result?.updated || [],
            skipped: [],
          });

          setStep(4);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
      }
    }, 1000);
  };



  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-sm text-zinc-500">
        Importing into system: <b>{system?.name}</b>
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
            <option value="pluralkit">PluralKit Token</option>
            <option value="simplyplural">SimplyPlural Token</option>
            <option value="json">JSON (or SimplyPlural file)</option>
            <option value="excel">Excel / CSV</option>
          </select>

          {(source === "excel" || source === "json") && (
            <input type="file" accept={source === "json" ? ".json" : ".xlsx,.csv"} onChange={(e) => setFile(e.target.files[0])} />
          )}

          {source === "simplyplural" && (
            <div>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Token"
              className="border p-2 rounded w-full"
            />
            <input 
              value={SimplyPluralId}
              onChange={(e) => setSimplyPluralId(e.target.value)}
              placeholder="User/System Id"
              className="border p-2 rounded w-full"
            />
            </div>
          )}

          {source === "pluralkit" && (
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

          <div className="flex gap-2">
            <button
              onClick={() => {
                const all = {};
                rawMembers.forEach((_, i) => (all[i] = true));
                setSelected(all);
              }}
              className="text-sm px-2 py-1 bg-zinc-200 rounded"
            >
              Select All
            </button>

            <button
              onClick={() => setSelected({})}
              className="text-sm px-2 py-1 bg-zinc-200 rounded"
            >
              Select None
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto border rounded p-2 space-y-2">
            {rawMembers.map((m, i) => {
              const decision = decisions[i];
              const match = decision?.match;

              return (
                <div
                  key={i}
                  className="flex items-center justify-between border-b py-2"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selected[i]}
                      onChange={() =>
                        setSelected((prev) => ({
                          ...prev,
                          [i]: !prev[i],
                        }))
                      }
                    />

                    <div>
                      <div className="font-medium">
                        {m.display_name || m.name}
                      </div>

                      {match && (
                        <div className="text-xs text-yellow-600">
                          Match: {match.display_name || match.name}
                        </div>
                      )}
                    </div>
                  </label>

                  <select
                    value={decision?.type || "add"}
                    onChange={(e) =>
                      setDecisions((prev) => ({
                        ...prev,
                        [i]: {
                          ...prev[i],
                          type: e.target.value,
                        },
                      }))
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="add">Add</option>
                    <option value="update" disabled={!match}>
                      Update
                    </option>
                    <option value="skip">Skip</option>
                  </select>
                </div>
              );
            })}
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
            Added: {results.added}
          </h2>

          <h2 className="font-semibold text-blue-600">
            Updated: {results.updated}
          </h2>

          <h2 className="font-semibold text-yellow-600">
            Skipped: {results.skipped}
          </h2>

          <button
            onClick={() => {
              setStep(1);
              setRawMembers([]);
              setResults({ added: [], updated: [], skipped: [] });
              setApiKey("");
              setFile(null);
              setSelected({});
              setDecisions({});
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