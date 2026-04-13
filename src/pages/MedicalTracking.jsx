import { useEffect, useState } from "react";
import SimpleCalendar from "../components/Calendar";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useProfileStore } from "../store/profileStore";

export default function MedicalTrackingPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const createMedicalEntry = useProfileStore((s) => s.createMedicalEntry);
  const getMedicalEntries = useProfileStore((s) => s.getMedicalEntries);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    for_date: selectedDate || "",
    medication: false,
    appointments: false,
    symptoms: "",
    pain: "",
    mood: "",
    other: ""
  });
  const [entries, setEntries] = useState([]);

useEffect(() => {
  async function load() {
    const data = await getMedicalEntries();
    setEntries(data || []);
  }

  load();
}, [getMedicalEntries]);

const handleSelect = (date) => {
  setSelectedDate(date);

  const existing = getEntryForDate(date);

  if (existing) {
    setForm(existing); 
  } else {
    setForm({
      for_date: date,
      medication: false,
      appointments: false,
      symptoms: "",
      pain: "",
      mood: "",
      other: ""
    });
  }
};

  const handleSubmit = () => {
    createMedicalEntry(form)

  }

  const getEntryForDate = (date) => {
  if (!date) return null;

  const dateStr = date.toDateString();

  return entries.find(
    (e) => new Date(e.for_date).toDateString() === dateStr
  );
};

  return (
    <div className="p-6">
        <button onClick={() => navigate("/dashboard")} className="mb-4 px-3 py-1 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 transition">
          Back
        </button>
        <div className="flex flex-wrap space-x-6">
        <Card>
          <SimpleCalendar
            selectedDate={selectedDate}
            onSelectDate={handleSelect}
            entries={entries}
          />
      </Card>
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">
            {selectedDate
              ? `For ${selectedDate.toDateString()}`
              : "Select a date"}
          </h2>
        </div>
        <div className="flex flex-col space-y-4 p-6">
          <label htmlFor="medication">Medication</label>
          <input type="checkbox" id="medication" className="" onChange={() => {setForm((prev) => ({...prev, medication: !prev.medication}))}}/>
          
          <label htmlFor="appointments">Appointments</label>
          <input type="checkbox" id="appointments" className="" onChange={() => {setForm((prev) => ({...prev, appointments: !prev.appointments}))}} />

          <label htmlFor="symptoms">Symptoms</label>
          <input type="text" id="symptoms" className="mr-2" placeholder="Symptoms..." onChange={(e) => {setForm((prev) => ({...prev, symptoms: e.target.value}))}}/>

          <label htmlFor="pain">Pain Level</label>
          <input type="text" id="pain" className="mr-2" placeholder="Pain level..." onChange={(e) => {setForm((prev) => ({...prev, pain: e.target.value}))}} />

          <label htmlFor="mood">Mood</label>
          <input type="text" id="mood" className="mr-2" placeholder="Mood..." onChange={(e) => {setForm((prev) => ({...prev, mood: e.target.value}))}} />

          <label htmlFor="other">Other</label>
          <input type="text" id="other" className="mr-2" placeholder="Other..." onChange={(e) => {setForm((prev) => ({...prev, other: e.target.value}))}} />
        </div>

        {selectedDate && (
          <div>
            <button
              onClick={() => {
                handleSubmit();
                navigate("/dashboard");
              }}
            >
              Submit for {selectedDate?.toDateString()}
            </button>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}