const progressItems = [
  { label: "Competencies Recorded", value: 8 },
  { label: "Qualifications Added", value: 4 },
  { label: "Development Logs", value: 6 },
  { label: "Placements Submitted", value: 3 }
];

export default function ProgressPage() {
  return (
    <div>
      <h2>Progress</h2>
      <p className="muted">
        Track your overall professional development progress.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "16px",
          marginTop: "18px"
        }}
      >
        {progressItems.map((item) => (
          <div className="card" key={item.label}>
            <div className="muted">{item.label}</div>
            <h3 style={{ margin: "8px 0 0" }}>{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: "18px" }}>
        <h3 style={{ marginTop: 0 }}>Progress Summary</h3>
        <p>
          Your profile is developing well. You have started recording competencies,
          qualifications, development entries, and placement information.
        </p>
      </div>
    </div>
  );
}