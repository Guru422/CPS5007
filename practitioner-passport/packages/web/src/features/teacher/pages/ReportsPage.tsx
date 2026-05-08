import { useEffect, useState } from "react";
import { AiCvRecord, listSubmittedCvs } from "../../student/studentApi";

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

export default function ReportsPage() {
  const [cvs, setCvs] = useState<AiCvRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listSubmittedCvs()
      .then(setCvs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load CVs."));
  }, []);

  const selected = cvs.find((c) => c.id === selectedId);
  const p = selected?.cvPreview;

  return (
    <div>
      <h2>Student CVs</h2>
      <p className="muted">Review CVs submitted by students.</p>
      {error && <p style={{ color: "#b42318" }}>{error}</p>}

      {cvs.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <p className="muted">No CVs have been submitted yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
          {/* Student list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cvs.map((cv) => (
              <div
                key={cv.id}
                onClick={() => setSelectedId(cv.id)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  background: cv.id === selectedId ? "#e9f5ff" : "#fff",
                  transition: "background 0.15s",
                }}
              >
                <strong style={{ fontSize: 14 }}>{cv.studentName || "Student"}</strong>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {cv.jobRole} · {cv.tone}
                </div>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                  {new Date(cv.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            ))}
          </div>

          {/* CV Document view */}
          {!selected ? (
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
              <p className="muted" style={{ fontSize: 15 }}>Select a student CV to view.</p>
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
            }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", letterSpacing: "0.5px", color: "#111827" }}>
                  {selected.studentName || "Student"}
                </h1>
                <p style={{ fontSize: 15, color: "#4b5563", margin: "0 0 6px", fontStyle: "italic" }}>
                  {selected.jobRole} {selected.tone !== "Professional" ? `· ${selected.tone} Profile` : ""}
                </p>
                <div style={{ width: 60, height: 2, background: "#1a3c5e", margin: "16px auto 0" }} />
              </div>

              {p?.summary && (
                <section style={{ marginBottom: 28 }}>
                  <h3 style={sectionTitle}>Professional Summary</h3>
                  <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>{String(p.summary)}</p>
                </section>
              )}

              {Array.isArray(p?.skills) && p.skills.length > 0 && (
                <section style={{ marginBottom: 28 }}>
                  <h3 style={sectionTitle}>Key Skills</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {p.skills.map((s, i) => (
                      <span key={i} style={{
                        padding: "5px 14px", borderRadius: 4,
                        border: "1px solid #1a3c5e", color: "#1a3c5e",
                        fontSize: 13, fontFamily: "sans-serif", fontWeight: 600,
                      }}>
                        {String(s)}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {Array.isArray(p?.qualifications) && p.qualifications.length > 0 && (
                <section style={{ marginBottom: 28 }}>
                  <h3 style={sectionTitle}>Education & Qualifications</h3>
                  {p.qualifications.map((q, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6, fontSize: 14 }}>
                      <span style={{ color: "#1a3c5e", fontWeight: 700, fontSize: 16 }}>&#8226;</span>
                      <span>{String(q)}</span>
                    </div>
                  ))}
                </section>
              )}

              {Array.isArray(p?.development) && p.development.length > 0 && (
                <section style={{ marginBottom: 28 }}>
                  <h3 style={sectionTitle}>Professional Development</h3>
                  {p.development.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6, fontSize: 14 }}>
                      <span style={{ color: "#1a3c5e", fontWeight: 700, fontSize: 16 }}>&#8226;</span>
                      <span>{String(d)}</span>
                    </div>
                  ))}
                </section>
              )}

              {Array.isArray(p?.placements) && p.placements.length > 0 && (
                <section style={{ marginBottom: 28 }}>
                  <h3 style={sectionTitle}>Work & Placement Experience</h3>
                  {p.placements.map((pl, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6, fontSize: 14 }}>
                      <span style={{ color: "#1a3c5e", fontWeight: 700, fontSize: 16 }}>&#8226;</span>
                      <span>{String(pl)}</span>
                    </div>
                  ))}
                </section>
              )}

              <div style={{ borderTop: "1px solid #d1d5db", paddingTop: 12, marginTop: 20 }}>
                <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: 0, fontFamily: "sans-serif" }}>
                  Generated by Practitioner Passport · {new Date(selected.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}