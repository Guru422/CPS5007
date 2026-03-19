import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { createPlacement, deletePlacement, listPlacements } from "../studentApi";

type PlacementStatus = "Pending" | "Approved" | "Rejected";
type PlacementType = "Internship" | "Part Time" | "Full Time" | "Work Experience";

type Placement = {
  id: number;
  title: string;
  organisation: string;
  location: string;
  type: PlacementType;
  startDate: string;
  endDate: string;
  status: PlacementStatus;
  description: string;
};

export default function PlacementsPage() {
  const { user } = useAuth();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<PlacementType>("Internship");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<PlacementStatus>("Pending");
  const [description, setDescription] = useState("");

  const totalPlacements = placements.length;
  const approvedPlacements = useMemo(
    () => placements.filter((p) => p.status === "Approved").length,
    [placements]
  );
  const pendingPlacements = useMemo(
    () => placements.filter((p) => p.status === "Pending").length,
    [placements]
  );

  useEffect(() => {
    async function load() {
      if (!user.id) return;
      try {
        const data = await listPlacements(user.id);
        setPlacements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load placements.");
      }
    }
    void load();
  }, [user.id]);

  async function addPlacement(e: React.FormEvent) {
    e.preventDefault();

    if (
      !title.trim() ||
      !organisation.trim() ||
      !location.trim() ||
      !startDate ||
      !endDate ||
      !description.trim()
    ) {
      alert("Please complete all placement fields.");
      return;
    }

    if (!user.id) {
      setError("Please log in again.");
      return;
    }
    setError("");
    try {
      const newPlacement = await createPlacement({
        userId: user.id,
        title: title.trim(),
        organisation: organisation.trim(),
        location: location.trim(),
        type,
        startDate,
        endDate,
        status,
        description: description.trim(),
      });

      setPlacements((prev) => [newPlacement, ...prev]);

      setTitle("");
      setOrganisation("");
      setLocation("");
      setType("Internship");
      setStartDate("");
      setEndDate("");
      setStatus("Pending");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save placement.");
    }
  }

  async function removePlacement(id: number) {
    if (!user.id) return;
    try {
      await deletePlacement(user.id, id);
      setPlacements((prev) => prev.filter((placement) => placement.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete placement.");
    }
  }

  return (
    <div>
      <h2>Placements</h2>
      <p className="muted">
        Add and track your placement applications, internship roles, and work-based opportunities.
      </p>
      {error && (
        <p className="muted" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "18px"
        }}
      >
        <div className="card">
          <div className="muted">Total Placements</div>
          <h3 style={{ margin: "8px 0 0" }}>{totalPlacements}</h3>
        </div>

        <div className="card">
          <div className="muted">Approved</div>
          <h3 style={{ margin: "8px 0 0" }}>{approvedPlacements}</h3>
        </div>

        <div className="card">
          <div className="muted">Pending</div>
          <h3 style={{ margin: "8px 0 0" }}>{pendingPlacements}</h3>
        </div>
      </div>

      <form className="card" onSubmit={addPlacement}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px"
          }}
        >
          <label className="label">
            Placement Title
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Data Analyst Intern"
            />
          </label>

          <label className="label">
            Organisation
            <input
              className="input"
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              placeholder="Example: Sky Sports"
            />
          </label>

          <label className="label">
            Location
            <input
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Example: London"
            />
          </label>

          <label className="label">
            Placement Type
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value as PlacementType)}
            >
              <option value="Internship">Internship</option>
              <option value="Part Time">Part Time</option>
              <option value="Full Time">Full Time</option>
              <option value="Work Experience">Work Experience</option>
            </select>
          </label>

          <label className="label">
            Start Date
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label className="label">
            End Date
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>

          <label className="label">
            Status
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as PlacementStatus)}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>
        </div>

        <label className="label" style={{ marginTop: "16px" }}>
          Description
          <textarea
            className="input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the placement role, responsibilities, or goals."
          />
        </label>

        <button className="btn primary" type="submit">
          Add Placement
        </button>
      </form>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Saved Placements</h3>

        {placements.length === 0 ? (
          <p className="muted">No placements added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {placements.map((placement) => (
              <div
                key={placement.id}
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
                    <h4 style={{ margin: "0 0 6px" }}>{placement.title}</h4>
                    <div className="muted">
                      {placement.organisation} • {placement.location}
                    </div>
                    <div className="muted" style={{ marginTop: "4px" }}>
                      {placement.type} • {placement.startDate} to {placement.endDate}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 600,
                      background:
                        placement.status === "Approved"
                          ? "#dff5df"
                          : placement.status === "Rejected"
                          ? "#fde3e3"
                          : "#fff4d6",
                      color:
                        placement.status === "Approved"
                          ? "#2e7d32"
                          : placement.status === "Rejected"
                          ? "#b42318"
                          : "#946200"
                    }}
                  >
                    {placement.status}
                  </div>
                </div>

                <p style={{ margin: "12px 0 0" }}>{placement.description}</p>

                <div style={{ marginTop: "14px" }}>
                  <button className="btn" type="button" onClick={() => removePlacement(placement.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}