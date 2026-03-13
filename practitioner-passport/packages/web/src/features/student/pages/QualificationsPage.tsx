import { useState } from "react";

type Qualification = {
  id: number;
  title: string;
  organisation: string;
  year: string;
};

export default function QualificationsPage() {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);

  const [title, setTitle] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [year, setYear] = useState("");

  function addQualification(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !organisation || !year) {
      alert("Please fill all fields");
      return;
    }

    const newQualification: Qualification = {
      id: Date.now(),
      title,
      organisation,
      year,
    };

    setQualifications([...qualifications, newQualification]);

    setTitle("");
    setOrganisation("");
    setYear("");
  }

  function removeQualification(id: number) {
    setQualifications(qualifications.filter((q) => q.id !== id));
  }

  return (
    <div>
      <h2>Qualifications</h2>
      <p className="muted">
        Add certificates and qualifications that support your professional
        development.
      </p>

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