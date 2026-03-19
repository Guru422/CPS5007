import { useEffect, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { createQualification, deleteQualification, listQualifications } from "../studentApi";

type Qualification = {
  id: number;
  title: string;
  organisation: string;
  year: string;
  certificateName?: string;
  certificateFile?: File | null;
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

    if (!title.trim() || !organisation.trim() || !year.trim()) {
      alert("Please fill all required fields.");
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
        Add your certificates and qualifications to support your development and placement readiness.
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

        <label className="label">
          Upload Certificate
          <input
            id="certificate-upload"
            className="input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <button className="btn primary" type="submit">
          Add Qualification
        </button>
      </form>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Saved Qualifications</h3>

        {qualifications.length === 0 ? (
          <p className="muted">No qualifications added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {qualifications.map((q) => (
              <div
                key={q.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "14px",
                  background: "#fff"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    alignItems: "flex-start"
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 6px" }}>{q.title}</h4>
                    <div className="muted">
                      {q.organisation} • {q.year}
                    </div>

                    {q.certificateName && (
                      <div className="muted" style={{ marginTop: "6px" }}>
                        Certificate: {q.certificateName}
                      </div>
                    )}
                  </div>

                  <button className="btn" type="button" onClick={() => removeQualification(q.id)}>
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