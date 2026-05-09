import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Role, useAuth } from "../../../app/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setErrorMessage("");

    login({
      id: crypto.randomUUID(),
      isAuthenticated: true,
      role,
      fullName: fullName.trim()
    });

    navigate("/redirect", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f5f7fb"
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "420px", padding: "32px" }}>
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <h1 style={{ marginBottom: "8px" }}>Practitioner Passport</h1>
          <p className="muted" style={{ margin: 0 }}>
            Professional development and placement tracking platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
          <label className="label">
            Full Name
            <input
              className="input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
            />
          </label>

          <label className="label">
            Role
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="teacher">Academic</option>
            </select>
          </label>

          {errorMessage && (
            <div style={{ color: "#b42318", fontSize: "14px" }}>
              {errorMessage}
            </div>
          )}

          <button className="btn primary" type="submit">
            Continue
          </button>
        </form>

        <div style={{ marginTop: "18px", textAlign: "center" }}>
          <span className="muted">
            Need an account? <Link to="/signup">Create one</Link>
          </span>
        </div>
      </div>
    </div>
  );
}