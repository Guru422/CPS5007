import { useState } from "react";

type DevelopmentEntry = {
  id: number;
  skill: string;
  category: "Technical" | "Communication" | "Leadership" | "Professional";
  description: string;
  date: string;
};

export default function DevelopmentLogPage() {
  const [entries, setEntries] = useState<DevelopmentEntry[]>([]);

  const [skill, setSkill] = useState("");
  const [category, setCategory] = useState<DevelopmentEntry["category"]>("Technical");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  function addEntry(e: React.FormEvent) {
    e.preventDefault();

    if (!skill.trim() || !description.trim() || !date) {
      alert("Please fill all fields.");
      return;
    }

    const newEntry: DevelopmentEntry = {
      id: Date.now(),
      skill: skill.trim(),
      category,
      description: description.trim(),
      date
    };

    setEntries([newEntry, ...entries]);

    setSkill("");
    setCategory("Technical");
    setDescription("");
    setDate("");
  }

  function removeEntry(id: number) {
    setEntries(entries.filter((entry) => entry.id !== id));
  }

  return (
    <div>
      <h2>Development Log</h2>
      <p className="muted">
        Record what you have improved, developed, or learned over time.
      </p>

      <form className="card" onSubmit={addEntry}>
        <label className="label">
          Skill / Area Developed
          <input
            className="input"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Example: SQL, Communication, Python"
          />
        </label>

        <label className="label">
          Category
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as DevelopmentEntry["category"])}
          >
            <option value="Technical">Technical</option>
            <option value="Communication">Communication</option>
            <option value="Leadership">Leadership</option>
            <option value="Professional">Professional</option>
          </select>
        </label>

        <label className="label">
          Description
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Example: Improved SQL query writing by working on football match data analysis."
            rows={4}
          />
        </label>

        <label className="label">
          Date
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <button className="btn primary" type="submit">
          Add Development Entry
        </button>
      </form>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Development History</h3>

        {entries.length === 0 ? (
          <p className="muted">No development entries added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "14px",
                  background: "#fff"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 6px" }}>{entry.skill}</h4>
                    <div className="muted">
                      {entry.category} • {entry.date}
                    </div>
                    <p style={{ margin: "10px 0 0" }}>{entry.description}</p>
                  </div>

                  <button className="btn" type="button" onClick={() => removeEntry(entry.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}