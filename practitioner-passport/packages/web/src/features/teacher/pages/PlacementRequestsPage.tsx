import { useMemo, useState } from "react";

type Status = "Pending" | "Approved" | "Rejected";

type PlacementRequest = {
  id: number;
  student: string;
  role: string;
  organisation: string;
  location: string;
  status: Status;
};

export default function PlacementRequestsPage() {
  const [requests, setRequests] = useState<PlacementRequest[]>([
    {
      id: 1,
      student: "Joe Doe",
      role: "Data Analyst Intern",
      organisation: "Sky Sports",
      location: "London",
      status: "Pending"
    },
    {
      id: 2,
      student: "Amira Khan",
      role: "Performance Analyst",
      organisation: "BBC Sport",
      location: "Manchester",
      status: "Pending"
    },
    {
      id: 3,
      student: "Sam Lewis",
      role: "Software Developer Intern",
      organisation: "Local Tech Lab",
      location: "Bristol",
      status: "Approved"
    }
  ]);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "Pending").length,
    [requests]
  );

  const approvedCount = useMemo(
    () => requests.filter((r) => r.status === "Approved").length,
    [requests]
  );

  const rejectedCount = useMemo(
    () => requests.filter((r) => r.status === "Rejected").length,
    [requests]
  );

  function updateStatus(id: number, status: Status) {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  }

  return (
    <div>
      <h2>Placement Requests</h2>
      <p className="muted">
        Review student placement submissions and approve or reject requests.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "16px",
          marginTop: "18px",
          marginBottom: "18px"
        }}
      >
        <div className="card">
          <div className="muted">Pending</div>
          <h3 style={{ margin: "8px 0 0" }}>{pendingCount}</h3>
        </div>

        <div className="card">
          <div className="muted">Approved</div>
          <h3 style={{ margin: "8px 0 0" }}>{approvedCount}</h3>
        </div>

        <div className="card">
          <div className="muted">Rejected</div>
          <h3 style={{ margin: "8px 0 0" }}>{rejectedCount}</h3>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Submitted Requests</h3>

        <div style={{ display: "grid", gap: "14px" }}>
          {requests.map((request) => (
            <div
              key={request.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "14px",
                background: "#fff"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "flex-start"
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 6px" }}>{request.student}</h4>
                  <div>{request.role}</div>
                  <div className="muted" style={{ marginTop: "4px" }}>
                    {request.organisation} • {request.location}
                  </div>
                </div>

                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 600,
                    background:
                      request.status === "Approved"
                        ? "#dff5df"
                        : request.status === "Rejected"
                        ? "#fde3e3"
                        : "#fff4d6",
                    color:
                      request.status === "Approved"
                        ? "#2e7d32"
                        : request.status === "Rejected"
                        ? "#b42318"
                        : "#946200"
                  }}
                >
                  {request.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button
                  className="btn primary"
                  type="button"
                  onClick={() => updateStatus(request.id, "Approved")}
                >
                  Approve
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => updateStatus(request.id, "Rejected")}
                >
                  Reject
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => updateStatus(request.id, "Pending")}
                >
                  Reset
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}