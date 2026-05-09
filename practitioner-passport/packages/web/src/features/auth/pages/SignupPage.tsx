import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Role, useAuth } from "../../../app/providers/AuthProvider";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage("Please enter your name and email.");
      return;
    }

    if (role === "student" && !studentId.trim()) {
      setErrorMessage("Please enter your student ID.");
      return;
    }

    setErrorMessage("");

    signup({
      id: crypto.randomUUID(),
      isAuthenticated: true,
      role,
      fullName: fullName.trim(),
      email: email.trim(),
      studentId: role === "student" ? studentId.trim() : ""
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
      <div className="card" style={{ width: "100%", maxWidth: "460px", padding: "32px" }}>
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <h1 style={{ marginBottom: "8px" }}>Create Account</h1>
          <p className="muted" style={{ margin: 0 }}>
            Join Practitioner Passport.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
          <label className="label">
            Full Name
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </label>

          <label className="label">
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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

          {role === "student" && (
            <label className="label">
              Student ID
              <input
                className="input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID"
              />
            </label>
          )}

          {errorMessage && (
            <div style={{ color: "#b42318", fontSize: "14px" }}>
              {errorMessage}
            </div>
          )}

          <button className="btn primary" type="submit">
            Create Account
          </button>
        </form>

        <div style={{ marginTop: "18px", textAlign: "center" }}>
          <span className="muted">
            Already have an account? <Link to="/login">Back to login</Link>
          </span>
        </div>
      </div>
    </div>
  );
}