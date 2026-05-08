const placements = [
  { id: 1, student: "Joe Doe", organisation: "Sky Sports", status: "Pending" },
  { id: 2, student: "Amira Khan", organisation: "BBC Sport", status: "Approved" },
  { id: 3, student: "Sam Lewis", organisation: "Local Performance Lab", status: "Rejected" }
];

export default function MentorPlacementProgressPage() {
  return (
    <div>
      <h2>Placement Progress</h2>
      <p className="muted">
        Track placement submissions and approval progress across students.
      </p>

      <div className="card">
        <div style={{ display: "grid", gap: "14px" }}>
          {placements.map((placement) => (
            <div
              key={placement.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                padding: "12px 0",
                borderBottom: "1px solid var(--border)"
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 6px" }}>{placement.student}</h4>
                <div className="muted">{placement.organisation}</div>
              </div>

              <div>{placement.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}