import { useEffect, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { createDevelopmentLog, deleteDevelopmentLog, listDevelopmentLogs } from "../studentApi";

type DevelopmentEntry = {
  id: number;
  skill: string;
  description: string;
  date: string;
};

export default function DevelopmentLogPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DevelopmentEntry[]>([]);
  const [error, setError] = useState("");

  const [skill, setSkill] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    async function load() {
      if (!user.id) return;
      try {
        const data = await listDevelopmentLogs(user.id);
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load development logs.");
      }
    }
    void load();
  }, [user.id]);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();

    if (!skill || !description || !date) {
      alert("Please fill all fields");
      return;
    }

    if (!user.id) {
      setError("Please log in again.");
      return;
    }
    setError("");
    try {
      const newEntry = await createDevelopmentLog({
        userId: user.id,
        skill,
        description,
        date,
      });
      setEntries((prev) => [newEntry, ...prev]);
      setSkill("");
      setDescription("");
      setDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save development entry.");
    }
  }

  async function removeEntry(id: number) {
    if (!user.id) return;
    try {
      await deleteDevelopmentLog(user.id, id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete development entry.");
    }
  }

  return (
    <div>
      <h2>Development Log</h2>
      <p className="muted">
        Record what you have improved, developed, or learned over time.
      </p>
      {error && (
        <p className="muted" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

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

      {entries.length > 0 && (
        <div className="card">
          <h3>Development History</h3>

          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <strong>{entry.skill}</strong>
                <div className="muted" style={{ margin: "4px 0" }}>
                  {entry.date}
                </div>
                <div>{entry.description}</div>
              </div>

              <button
                className="btn"
                type="button"
                onClick={() => removeEntry(entry.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}