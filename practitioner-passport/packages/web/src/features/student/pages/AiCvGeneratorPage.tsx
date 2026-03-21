import { useEffect, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { createAiCvGeneration, listAiCvGenerations, submitCvToTeacher } from "../studentApi";

type CvTone = "Professional" | "Academic" | "Creative";
type JobRole =
  | "Data Analyst"
  | "Software Developer"
  | "Football Analyst"
  | "Cyber Security Analyst"
  | "Business Analyst";

type CvData = {
  summary: string;
  skills: string[];
  qualifications: string[];
  development: string[];
  placements: string[];
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "1.2px",
  color: "#1a3c5e",
  borderBottom: "2px solid #1a3c5e",
  paddingBottom: 6,
  marginBottom: 12,
};

const emptyCv: CvData = { summary: "", skills: [], qualifications: [], development: [], placements: [] };

function parseCv(raw: Record<string, unknown>): CvData {
  return {
    summary: String(raw.summary || ""),
    skills: Array.isArray(raw.skills) ? raw.skills.map(String) : [],
    qualifications: Array.isArray(raw.qualifications) ? raw.qualifications.map(String) : [],
    development: Array.isArray(raw.development) ? raw.development.map(String) : [],
    placements: Array.isArray(raw.placements) ? raw.placements.map(String) : [],
  };
}

export default function AiCvGeneratorPage() {
  const { user } = useAuth();
  const [jobRole, setJobRole] = useState<JobRole>("Data Analyst");
  const [tone, setTone] = useState<CvTone>("Professional");
  const [includeQualifications, setIncludeQualifications] = useState(true);
  const [includeDevelopment, setIncludeDevelopment] = useState(true);
  const [includePlacements, setIncludePlacements] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentCvId, setCurrentCvId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [cv, setCv] = useState<CvData>(emptyCv);

  useEffect(() => {
    async function load() {
      if (!user.id) return;
      try {
        const data = await listAiCvGenerations(user.id);
        if (data.length > 0) {
          const latest = data[0];
          setCv(parseCv(latest.cvPreview));
          setCurrentCvId(latest.id);
          setSubmitted(latest.submittedToTeacher);
          setGenerated(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load previous CV generations.");
      }
    }
    void load();
  }, [user.id]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!user.id) { setError("Please log in again."); return; }
    setError("");
    setLoading(true);
    try {
      const created = await createAiCvGeneration({
        userId: user.id, jobRole, tone,
        includeQualifications, includeDevelopment, includePlacements,
        cvPreview: {},
      });
      setCv(parseCv(created.cvPreview));
      setCurrentCvId(created.id);
      setSubmitted(false);
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate CV.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>AI CV Generator</h2>
      <p className="muted">
        Generate a tailored CV using your profile data, powered by AI.
      </p>
      {error && <p style={{ color: "#b42318", fontSize: 14 }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
        {/* Controls panel */}
        <form className="card" onSubmit={handleGenerate} style={{ position: "sticky", top: 20 }}>
          <label className="label">
            Target Job Role
            <select className="input" value={jobRole} onChange={(e) => setJobRole(e.target.value as JobRole)}>
              <option>Data Analyst</option>
              <option>Software Developer</option>
              <option>Football Analyst</option>
              <option>Cyber Security Analyst</option>
              <option>Business Analyst</option>
            </select>
          </label>

          <label className="label">
            CV Tone
            <select className="input" value={tone} onChange={(e) => setTone(e.target.value as CvTone)}>
              <option>Professional</option>
              <option>Academic</option>
              <option>Creative</option>
            </select>
          </label>

          <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, marginBottom: 14 }}>
            <strong style={{ display: "block", marginBottom: 10, fontSize: 13 }}>Include in CV</strong>
            {[
              { label: "Qualifications", checked: includeQualifications, set: setIncludeQualifications },
              { label: "Development Log", checked: includeDevelopment, set: setIncludeDevelopment },
              { label: "Placements", checked: includePlacements, set: setIncludePlacements },
            ].map((item) => (
              <label key={item.label} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                <input type="checkbox" checked={item.checked} onChange={(e) => item.set(e.target.checked)} />
                {item.label}
              </label>
            ))}
          </div>

          <button className="btn primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Generating..." : "Generate CV"}
          </button>

          {generated && currentCvId && (
            <div style={{ marginTop: 12 }}>
              {submitted ? (
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  color: "#166534", fontWeight: 600, fontSize: 14, textAlign: "center",
                }}>
                  Submitted to teacher
                </div>
              ) : (
                <button
                  className="btn"
                  type="button"
                  style={{
                    width: "100%", background: "#166534", color: "#fff",
                    fontWeight: 600, border: "none",
                  }}
                  onClick={async () => {
                    if (!user.id || !currentCvId) return;
                    try {
                      await submitCvToTeacher(user.id, currentCvId);
                      setSubmitted(true);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed to submit CV.");
                    }
                  }}
                >
                  Submit to Teacher
                </button>
              )}
            </div>
          )}
        </form>

        {/* CV Document */}
        {!generated ? (
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <p className="muted" style={{ fontSize: 15 }}>Configure options and generate your CV.</p>
          </div>
        ) : (
          <div style={{
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: 4,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: "48px 52px",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            color: "#1f2937",
            lineHeight: 1.6,
            minHeight: 600,
          }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{
                fontSize: 28, fontWeight: 700, margin: "0 0 4px",
                letterSpacing: "0.5px", color: "#111827",
              }}>
                {user.fullName || "Your Name"}
              </h1>
              <p style={{
                fontSize: 15, color: "#4b5563", margin: "0 0 6px",
                fontStyle: "italic",
              }}>
                {jobRole} {tone !== "Professional" ? `· ${tone} Profile` : ""}
              </p>
              {user.email && (
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{user.email}</p>
              )}
              <div style={{
                width: 60, height: 2, background: "#1a3c5e",
                margin: "16px auto 0",
              }} />
            </div>

            {/* Summary */}
            {cv.summary && (
              <section style={{ marginBottom: 28 }}>
                <h3 style={sectionTitle}>Professional Summary</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>{cv.summary}</p>
              </section>
            )}

            {/* Skills */}
            {cv.skills.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <h3 style={sectionTitle}>Key Skills</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {cv.skills.map((skill, i) => (
                    <span key={i} style={{
                      padding: "5px 14px",
                      borderRadius: 4,
                      border: "1px solid #1a3c5e",
                      color: "#1a3c5e",
                      fontSize: 13,
                      fontFamily: "'Segoe UI', Arial, sans-serif",
                      fontWeight: 600,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Qualifications */}
            {cv.qualifications.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <h3 style={sectionTitle}>Education & Qualifications</h3>
                {cv.qualifications.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "baseline", gap: 10,
                    marginBottom: 6, fontSize: 14,
                  }}>
                    <span style={{ color: "#1a3c5e", fontWeight: 700, fontSize: 16, lineHeight: 1 }}>&#8226;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Development */}
            {cv.development.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <h3 style={sectionTitle}>Professional Development</h3>
                {cv.development.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "baseline", gap: 10,
                    marginBottom: 6, fontSize: 14,
                  }}>
                    <span style={{ color: "#1a3c5e", fontWeight: 700, fontSize: 16, lineHeight: 1 }}>&#8226;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Placements */}
            {cv.placements.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <h3 style={sectionTitle}>Work & Placement Experience</h3>
                {cv.placements.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "baseline", gap: 10,
                    marginBottom: 6, fontSize: 14,
                  }}>
                    <span style={{ color: "#1a3c5e", fontWeight: 700, fontSize: 16, lineHeight: 1 }}>&#8226;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Footer line */}
            <div style={{ borderTop: "1px solid #d1d5db", paddingTop: 12, marginTop: 20 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: 0, fontFamily: "sans-serif" }}>
                Generated by Practitioner Passport · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
