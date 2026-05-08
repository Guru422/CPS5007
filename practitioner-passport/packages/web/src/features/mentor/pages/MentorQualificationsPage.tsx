const qualificationData = [
  { id: 1, student: "Joe Doe", qualification: "AWS Cloud Practitioner", organisation: "Amazon", year: "2025" },
  { id: 2, student: "Amira Khan", qualification: "Google Data Analytics Certificate", organisation: "Coursera", year: "2026" },
  { id: 3, student: "Sam Lewis", qualification: "Python for Data Science", organisation: "edX", year: "2025" }
];

export default function MentorQualificationsPage() {
  return (
    <div>
      <h2>Qualifications Overview</h2>
      <p className="muted">
        Monitor student certificates and qualification records.
      </p>

      <div className="card">
        <div style={{ display: "grid", gap: "14px" }}>
          {qualificationData.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid var(--border)"
              }}
            >
              <h4 style={{ margin: "0 0 6px" }}>{item.student}</h4>
              <div>{item.qualification}</div>
              <div className="muted">
                {item.organisation} • {item.year}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}