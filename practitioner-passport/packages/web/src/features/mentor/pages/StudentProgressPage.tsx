const students = [
  { id: 1, name: "Joe Doe", progress: "Strong", competencies: 7, developmentLogs: 5 },
  { id: 2, name: "Amira Khan", progress: "Moderate", competencies: 5, developmentLogs: 3 },
  { id: 3, name: "Sam Lewis", progress: "Needs Support", competencies: 3, developmentLogs: 2 }
];

export default function StudentProgressPage() {
  return (
    <div>
      <h2>Student Progress</h2>
      <p className="muted">
        Review student development activity, competencies, and overall progression.
      </p>

      <div className="card">
        <div style={{ display: "grid", gap: "14px" }}>
          {students.map((student) => (
            <div
              key={student.id}
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
                <h4 style={{ margin: "0 0 6px" }}>{student.name}</h4>
                <div className="muted">
                  Competencies: {student.competencies} • Development Logs: {student.developmentLogs}
                </div>
              </div>

              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background:
                    student.progress === "Strong"
                      ? "#dff5df"
                      : student.progress === "Moderate"
                      ? "#fff4d6"
                      : "#fde3e3",
                  color:
                    student.progress === "Strong"
                      ? "#2e7d32"
                      : student.progress === "Moderate"
                      ? "#946200"
                      : "#b42318"
                }}
              >
                {student.progress}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}