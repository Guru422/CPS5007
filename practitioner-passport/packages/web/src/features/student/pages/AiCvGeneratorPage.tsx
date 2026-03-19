import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { createAiCvGeneration, listAiCvGenerations } from "../studentApi";

type CvTone = "Professional" | "Academic" | "Creative";
type JobRole =
  | "Data Analyst"
  | "Software Developer"
  | "Football Analyst"
  | "Cyber Security Analyst"
  | "Business Analyst";

export default function AiCvGeneratorPage() {
  const { user } = useAuth();
  const [jobRole, setJobRole] = useState<JobRole>("Data Analyst");
  const [tone, setTone] = useState<CvTone>("Professional");
  const [includeQualifications, setIncludeQualifications] = useState(true);
  const [includeDevelopment, setIncludeDevelopment] = useState(true);
  const [includePlacements, setIncludePlacements] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");

  const cvPreview = useMemo(() => {
    return {
      summary: `Motivated ${jobRole} candidate that demonstrates growing technical ability, reflective development, and readiness for placement and industry experience.`,
      skills: [
        "Communication",
        "Python",
        "SQL",
        "Problem Solving",
        "Teamwork",
        "Data Analysis"
      ],
      qualifications: includeQualifications
        ? [
            "Google Data Analytics Certificate",
            "AWS Cloud Practitioner",
            "Python for Data Science"
          ]
        : [],
      development: includeDevelopment
        ? [
            "Improved SQL query writing through project work",
            "Developed stronger data visualisation skills",
            "Enhanced communication through collaborative presentations"
          ]
        : [],
      placements: includePlacements
        ? [
            `${jobRole} placement experience with responsibilities aligned to industry practice`
          ]
        : []
    };
  }, [jobRole, includeQualifications, includeDevelopment, includePlacements]);

  useEffect(() => {
    async function load() {
      if (!user.id) return;
      try {
        const data = await listAiCvGenerations(user.id);
        if (data.length > 0) {
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
    if (!user.id) {
      setError("Please log in again.");
      return;
    }
    setError("");
    try {
      await createAiCvGeneration({
        userId: user.id,
        jobRole,
        tone,
        includeQualifications,
        includeDevelopment,
        includePlacements,
        cvPreview,
      });
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save generated CV.");
    }
  }

  return (
    <div>
      <h2>AI CV Generator</h2>
      <p className="muted">
        Generate a tailored CV preview using your qualifications, development history,
        competencies, and placement experience.
      </p>
      {error && (
        <p className="muted" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "18px"
        }}
      >
        <form className="card" onSubmit={handleGenerate}>
          <label className="label">
            Target Job Role
            <select
              className="input"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value as JobRole)}
            >
              <option value="Data Analyst">Data Analyst</option>
              <option value="Software Developer">Software Developer</option>
              <option value="Football Analyst">Football Analyst</option>
              <option value="Cyber Security Analyst">Cyber Security Analyst</option>
              <option value="Business Analyst">Business Analyst</option>
            </select>
          </label>

          <label className="label">
            CV Tone
            <select
              className="input"
              value={tone}
              onChange={(e) => setTone(e.target.value as CvTone)}
            >
              <option value="Professional">Professional</option>
              <option value="Academic">Academic</option>
              <option value="Creative">Creative</option>
            </select>
          </label>

          <div className="card" style={{ padding: "12px", marginBottom: "14px" }}>
            <strong style={{ display: "block", marginBottom: "10px" }}>
              Include in CV
            </strong>

            <label style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                type="checkbox"
                checked={includeQualifications}
                onChange={(e) => setIncludeQualifications(e.target.checked)}
              />
              Qualifications
            </label>

            <label style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                type="checkbox"
                checked={includeDevelopment}
                onChange={(e) => setIncludeDevelopment(e.target.checked)}
              />
              Development Log
            </label>

            <label style={{ display: "flex", gap: "10px" }}>
              <input
                type="checkbox"
                checked={includePlacements}
                onChange={(e) => setIncludePlacements(e.target.checked)}
              />
              Placements
            </label>
          </div>

          <button className="btn primary" type="submit">
            Generate CV Preview
          </button>
        </form>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>CV Preview</h3>

          {!generated ? (
            <p className="muted">
              Select a role and generate your CV preview.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              <section>
                <h4 style={{ margin: "0 0 8px" }}>Professional Summary</h4>
                <p style={{ margin: 0 }}>{cvPreview.summary}</p>
              </section>

              <section>
                <h4 style={{ margin: "0 0 8px" }}>Key Skills</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {cvPreview.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        background: "#e7f2fb",
                        color: "#1b6ea8",
                        fontSize: "13px",
                        fontWeight: 600
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {cvPreview.qualifications.length > 0 && (
                <section>
                  <h4 style={{ margin: "0 0 8px" }}>Qualifications</h4>
                  <ul style={{ margin: 0, paddingLeft: "18px" }}>
                    {cvPreview.qualifications.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {cvPreview.development.length > 0 && (
                <section>
                  <h4 style={{ margin: "0 0 8px" }}>Development Highlights</h4>
                  <ul style={{ margin: 0, paddingLeft: "18px" }}>
                    {cvPreview.development.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {cvPreview.placements.length > 0 && (
                <section>
                  <h4 style={{ margin: "0 0 8px" }}>Placement Experience</h4>
                  <ul style={{ margin: 0, paddingLeft: "18px" }}>
                    {cvPreview.placements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}