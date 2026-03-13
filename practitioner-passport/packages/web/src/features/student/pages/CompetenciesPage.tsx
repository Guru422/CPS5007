import { useState } from "react";

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
  const [role, setRole] = useState("Data Analyst");

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const submission = {
      role,
      attributes: values,
      date: new Date().toISOString(),
    };

    console.log("Competency submission:", submission);

    alert("Competency record submitted (console log for now)");
  }

  return (
    <div>
      <h2>Record Competency</h2>
      <p className="muted">
        Rate your skills and attributes for your selected role.
      </p>

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
    </div>
  );
}