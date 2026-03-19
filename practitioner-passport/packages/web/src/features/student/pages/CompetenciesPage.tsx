import { useEffect, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { createCompetency, listCompetencies } from "../studentApi";

const attributes = [
  "Communication",
  "Python",
  "SQL",
  "Problem Solving",
  "Teamwork",
  "Leadership",
  "Data Analysis",
  "Critical Thinking",
];

export default function CompetenciesPage() {
  const { user } = useAuth();
  const [role, setRole] = useState("Data Analyst");
  const [history, setHistory] = useState<
    { id: number; role: string; submittedAt: string; attributes: Record<string, number> }[]
  >([]);
  const [error, setError] = useState("");

  const [values, setValues] = useState<Record<string, number>>(
    attributes.reduce((acc, attr) => {
      acc[attr] = 5;
      return acc;
    }, {} as Record<string, number>)
  );

  function updateAttribute(attr: string, value: number) {
    setValues((prev) => ({
      ...prev,
      [attr]: value,
    }));
  }

  useEffect(() => {
    async function load() {
      if (!user.id) return;
      try {
        const data = await listCompetencies(user.id);
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load competencies.");
      }
    }
    void load();
  }, [user.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user.id) {
      setError("Please log in again.");
      return;
    }
    setError("");
    try {
      const saved = await createCompetency({
        userId: user.id,
        role,
        attributes: values,
      });
      setHistory((prev) => [saved, ...prev]);
      alert("Competency record submitted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save competency.");
    }
  }

  return (
    <div>
      <h2>Record Competency</h2>
      <p className="muted">
        Rate your skills and attributes for your selected role.
      </p>
      {error && (
        <p className="muted" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      <form className="card" onSubmit={handleSubmit}>
        <label className="label">
          Role
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Data Analyst</option>
            <option>Software Developer</option>
            <option>Football Analyst</option>
            <option>Cyber Security Analyst</option>
          </select>
        </label>

        {attributes.map((attr) => (
          <div key={attr} className="label">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{attr}</span>
              <span>{values[attr]}</span>
            </div>

            <input
              type="range"
              min={0}
              max={10}
              value={values[attr]}
              onChange={(e) =>
                updateAttribute(attr, Number(e.target.value))
              }
            />
          </div>
        ))}

        <button className="btn primary" type="submit">
          Submit Competency
        </button>
      </form>

      {history.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Submitted Competency Records</h3>
          {history.map((item) => (
            <div key={item.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <strong>{item.role}</strong>
              <div className="muted">{new Date(item.submittedAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}