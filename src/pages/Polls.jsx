import { useNavigate } from "react-router-dom"
import Card from "../components/Card"
import { useState, useEffect } from "react"
import { useSystemStore } from "../store/systemStore"
import { useSessionStore } from "../store/sessionStore"


export default function PollsPage() {
    const navigate = useNavigate()
    const systems = useSystemStore((s) => s.systems);
    const user = useSessionStore((s) => s.user);
    const polls = useSystemStore((s) => s.polls);
    const hydrateSystem = useSystemStore((s) => s.hydrateSystem);
    const currentSystem = useSystemStore((s) => s.currentSystem);
    const members = useSystemStore((s) => s.members);
    const updatePolls = useSystemStore((s) => s.updatePolls);
    const createPoll = useSystemStore((s) => s.createPoll);
    const deletePoll = useSystemStore((s) => s.deletePoll);


    const [form, setForm] = useState({
        id: null,
        question: "",
        options: [],
        answers: []
    })
    const [showPast, setShowPast] = useState(false);
    const [pollSystem, setPollSystem] = useState(systems?.[0]?.id || "");

    const systemPolls = polls?.filter(
    (p) => p.system_id === pollSystem
);

    useEffect(() => {
    if (systems?.length && !pollSystem) {
        setPollSystem(systems[0].id);
    }
    if (!pollSystem || !systemPolls?.length) return;
    setForm((prev) => prev.question ? prev : systemPolls[0]);

    }, [pollSystem, systemPolls, systems]);

    return (
        <div className="p-6 space-y-6">
        <button onClick={() => navigate("/dashboard")}>
          ← Back
        </button>

        <h1>Polls</h1>
        <div className="flex flex-wrap gap-4">
        <Card>
            <h2 className="text-xl font-bold m-2">Select System</h2>
            {systems?.map((sys) => (
                <div
                    key={sys.id}

                    onClick={() => {
                        setPollSystem(sys.id);
                        hydrateSystem(sys.id);
                    }}
                    className="cursor-pointer p-2 my-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                    style={{ backgroundColor: sys.color }}
                >
                    <p className="font-semibold">{sys.name}</p>
                </div>
            ))}
        </Card>
        <Card>
            <div className="space-y-2">
            <h2 className="text-xl font-bold m-2">Question</h2>
                <input
                    type="text"
                    name="question"
                    value={form.question || ""}
                    placeholder="Type question here..."
                    onChange={(e) =>
                        setForm({ ...form, question: e.target.value })
                    }
                    />
            <h2 className="text-xl font-bold m-2">Options</h2>
            {(form.options || []).map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                    <input
                        type="text"
                        name={`options[${i}]`}
                        value={opt}
                        placeholder="Type option here..."
                        onChange={(e) => {
                            const newOptions = [...form?.options];
                            newOptions[i] = e.target.value;
                            setForm({ ...form, options: newOptions });
                        }}
                    />
                    <button onClick={() => {
                        const newOptions = [...form?.options];
                        newOptions.splice(i, 1);
                        setForm({ ...form, options: newOptions });
                    }}>
                        Delete
                    </button>
                </div>
            ))}
            <button onClick={() => setForm({ ...form, options: [...(form?.options || []), ""], })}>
                Add Option
            </button>
                <div>
                    <h2 className="text-xl font-bold m-2">Members</h2>
                {members?.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                        <p>{member.name}</p>
                            <select
                                value={
                                    form.answers?.find(a => a.memberId === member.id)?.value || ""
                                }
                                onChange={(e) => {
                                    const newAnswers = [...(form.answers || [])];

                                    const index = newAnswers.findIndex(
                                        (a) => a.memberId === member.id
                                    );

                                    if (index !== -1) {
                                        newAnswers[index] = {
                                            memberId: member.id,
                                            value: e.target.value,
                                        };
                                    } else {
                                        newAnswers.push({
                                            memberId: member.id,
                                            value: e.target.value,
                                        });
                                    }

                                    setForm({
                                        ...form,
                                        answers: newAnswers,
                                    });
                                }}
                                className="p-1 rounded border dark:bg-zinc-800"
                            >
                            <option value="">Select option</option>

                            {(form.options || []).map((opt, i) => (
                                <option key={i} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            </div>
            <button
                onClick={() => {
                    if (form.id) {
                        updatePolls(form.id, currentSystem?.id, user?.id, form.answers)
                    } else {
                        createPoll({
                            question: form?.question,
                            options: form?.options,
                            system_id: currentSystem?.id,
                            answers: form?.answers,
                            user_id: user?.id,
                        })
                    }
                }}
            >
                Save Poll
            </button>
        </Card>
        <Card>
            <h2 className="text-xl font-bold m-2">Past Polls</h2>
            <button onClick={() => setShowPast(!showPast)}>
                {showPast ? "Hide Past Polls" : "Show Past Polls"}
            </button>
            
            {showPast && systemPolls?.length > 0 && (
                <div>
                    {systemPolls.map((poll) => (
                        <div key={poll.id}>
                            <button onClick={() => setForm(poll)}>
                                {poll.question}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
        </div>
        </div>
    )
}