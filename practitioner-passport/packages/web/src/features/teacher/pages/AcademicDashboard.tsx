import { Link } from "react-router-dom";

const summaryCards = [
  { label: "Placement Requests", value: 6, link: "/teacher/placement-requests" },
  { label: "Pending Reviews", value: 4, link: "/teacher/placement-requests" },
  { label: "Student Messages", value: 11, link: "/teacher/chat" },
  { label: "Reports Generated", value: 8, link: "/teacher/reports" }
];

const recentItems = [
  "Joe Doe submitted a placement request",
  "Amira Khan sent a message about her certificate",
  "Sam Lewis requires placement review",
  "Progress report generated for Data Analyst pathway"
];

export default function AcademicDashboard() {
  return (
    <div>
      <h2>Academic Dashboard</h2>
      <p className="muted">
        Review placement requests, communicate with students, and monitor academic progress.
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
          <h3 style={{ marginTop: 0 }}>Recent Academic Activity</h3>

          <div style={{ display: "grid", gap: "12px" }}>
            {recentItems.map((item) => (
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
          <h3 style={{ marginTop: 0 }}>Academic Actions</h3>

          <p className="muted">
            Review placement submissions, respond to student messages, and view reports.
          </p>

          <div style={{ display: "grid", gap: "10px" }}>
            <Link className="btn primary" to="/teacher/placement-requests">
              Review Placements
            </Link>

            <Link className="btn" to="/teacher/chat">
              Open Chat
            </Link>

            <Link className="btn" to="/teacher/reports">
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}