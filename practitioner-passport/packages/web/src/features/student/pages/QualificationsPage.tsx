import { useEffect, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { createQualification, deleteQualification, listQualifications } from "../studentApi";

type Qualification = {
  id: number;
  title: string;
  organisation: string;
  year: string;
};

export default function QualificationsPage() {
  const { user } = useAuth();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    async function load() {
      if (!user.id) return;
      try {
        const data = await listQualifications(user.id);
        setQualifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load qualifications.");
      }
    }
    void load();
  }, [user.id]);

  async function addQualification(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !organisation || !year) {
      alert("Please fill all fields");
      return;
    }

    if (!user.id) {
      setError("Please log in again.");
      return;
    }
    setError("");
    try {
      const newQualification = await createQualification({
        userId: user.id,
        title,
        organisation,
        year,
      });
      setQualifications((prev) => [newQualification, ...prev]);
      setTitle("");
      setOrganisation("");
      setYear("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save qualification.");
    }
  }

  async function removeQualification(id: number) {
    if (!user.id) return;
    try {
      await deleteQualification(user.id, id);
      setQualifications((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete qualification.");
    }
  }

  return (
    <div>
      <h2>Qualifications</h2>
      <p className="muted">
        Add certificates and qualifications that support your professional
        development.
      </p>
      {error && (
        <p className="muted" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      <form className="card" onSubmit={addQualification}>
        <label className="label">
          Qualification / Certificate
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Google Data Analytics Certificate"
          />
        </label>

        <label className="label">
          Organisation
          <input
            className="input"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
            placeholder="Example: Coursera"
          />
        </label>

        <label className="label">
          Year
          <input
            className="input"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Example: 2026"
          />
        </label>

        <button className="btn primary" type="submit">
          Add Qualification
        </button>
      </form>

      {qualifications.length > 0 && (
        <div className="card">
          <h3>Saved Qualifications</h3>

          {qualifications.map((q) => (
            <div
              key={q.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <strong>{q.title}</strong>
                <div className="muted">
                  {q.organisation} • {q.year}
                </div>
              </div>

              <button
                className="btn"
                onClick={() => removeQualification(q.id)}
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