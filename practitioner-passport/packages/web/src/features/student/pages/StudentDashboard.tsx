import { Link } from "react-router-dom";

const summaryCards = [
  { label: "Competencies", value: 8, link: "/student/competencies" },
  { label: "Qualifications", value: 4, link: "/student/qualifications" },
  { label: "Development Logs", value: 6, link: "/student/development" },
  { label: "Placements", value: 3, link: "/student/placements" }
];

const recentActivity = [
  "Added AWS Cloud Practitioner qualification",
  "Submitted Data Analyst placement",
  "Updated SQL competency score",
  "Added development log for communication skills"
];

export default function StudentDashboard() {
  return (
    <div>
      <h2>Student Dashboard</h2>
      <p className="muted">
        Overview of your Practitioner Passport progress, placements, and professional development.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "16px",
          marginTop: "18px"
        }}
      >
        {summaryCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="muted">{card.label}</div>
            <h3 style={{ margin: "8px 0 0" }}>{card.value}</h3>
          </Link>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "18px",
          marginTop: "18px"
        }}
      >
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recent Activity</h3>

          <div style={{ display: "grid", gap: "12px" }}>
            {recentActivity.map((item) => (
              <div
                key={item}
                style={{
                  padding: "12px",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  background: "#fff"
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Placement Status</h3>

          <div style={{ display: "grid", gap: "10px" }}>
            <div>
              <strong>Current status:</strong>
              <div className="muted">1 approved, 2 pending</div>
            </div>

            <div>
              <strong>Next action:</strong>
              <div className="muted">
                Wait for Academic review or update placement details.
              </div>
            </div>

            <Link className="btn primary" to="/student/placements">
              View Placements
            </Link>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "18px" }}>
        <h3 style={{ marginTop: 0 }}>AI CV Readiness</h3>
        <p className="muted">
          Your CV generator uses your qualifications, competencies, development logs,
          and placements to create a tailored CV preview.
        </p>

        <Link className="btn primary" to="/student/ai-cv">
          Open AI CV Generator
        </Link>
      </div>
    </div>
  );
}