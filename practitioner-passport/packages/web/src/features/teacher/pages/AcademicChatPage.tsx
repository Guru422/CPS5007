const studentMessages = [
  {
    id: 1,
    student: "Joe Doe",
    message: "Could you review my placement submission?",
    time: "09:12"
  },
  {
    id: 2,
    student: "Amira Khan",
    message: "I have uploaded a new certificate to my profile.",
    time: "10:05"
  }
];

export default function AcademicChatPage() {
  return (
    <div>
      <h2>Academic Chat</h2>
      <p className="muted">
        Manage communication with students regarding placements and progress.
      </p>

      <div className="card">
        <div style={{ display: "grid", gap: "14px" }}>
          {studentMessages.map((item) => (
            <div
              key={item.id}
              style={{
                borderBottom: "1px solid var(--border)",
                paddingBottom: "12px"
              }}
            >
              <h4 style={{ margin: "0 0 6px" }}>{item.student}</h4>
              <div>{item.message}</div>
              <div className="muted" style={{ marginTop: "4px" }}>
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}